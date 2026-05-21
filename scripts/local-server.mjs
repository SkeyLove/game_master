import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 5173);
const env = await loadEnv();
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_CHARS = 4000;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp"
};

const server = createServer(async (request, response) => {
  try {
    if (request.url === "/api/deepseek/chat" && request.method === "POST") {
      await handleDeepSeekChat(request, response);
      return;
    }

    if (request.url?.startsWith("/api/")) {
      sendJson(response, 404, { error: "Local API route not found." });
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Local server error." });
  }
});

server.listen(port, host, () => {
  console.log(`game_master local server: http://${host}:${port}/`);
  console.log("DeepSeek proxy:", env.DEEPSEEK_API_KEY ? "enabled" : "missing DEEPSEEK_API_KEY");
});

async function loadEnv() {
  const values = {};
  try {
    const text = await readFile(join(rootDir, ".env"), "utf8");
    text.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return;
      }

      const separator = trimmed.indexOf("=");
      if (separator === -1) {
        return;
      }

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
      values[key] = value;
    });
  } catch (error) {
    // .env is optional; the static demo still works without it.
  }

  return {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || values.DEEPSEEK_API_KEY || "",
    DEEPSEEK_API_URL:
      process.env.DEEPSEEK_API_URL ||
      values.DEEPSEEK_API_URL ||
      "https://api.deepseek.com/chat/completions",
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || values.DEEPSEEK_MODEL || "deepseek-v4-flash"
  };
}

async function handleDeepSeekChat(request, response) {
  if (!env.DEEPSEEK_API_KEY) {
    sendJson(response, 503, {
      error: "DEEPSEEK_API_KEY is not set. Copy .env.example to .env and fill it locally."
    });
    return;
  }

  const body = await readJsonBody(request);
  const userInput = String(body.input || "").slice(0, 2000);
  const history = normalizeMeetingHistory(body.history);

  if (!userInput.trim()) {
    sendJson(response, 400, { error: "Input is required." });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4200);

  try {
    const upstream = await fetch(env.DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL,
        messages: buildMeetingMessages(userInput, history),
        temperature: 0.4,
        max_tokens: 520,
        thinking: {
          type: "disabled"
        }
      }),
      signal: controller.signal
    });

    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      sendJson(response, upstream.status, {
        error: payload.error?.message || "DeepSeek API request failed."
      });
      return;
    }

    const reply = payload.choices?.[0]?.message?.content;
    sendJson(response, 200, {
      reply: reply || "本地模型没有返回可显示内容。"
    });
  } finally {
    clearTimeout(timeout);
  }
}

function buildMeetingMessages(userInput, history) {
  const basePrompt = {
    role: "system",
    content:
      "你是一个中文企业级 AI 采购谈判材料助手。用户正在处理一份名为《项目汇报材料_周会版.pdf》的材料，主题是下周与 DeepSeek 洽谈企业级 AI 解决方案。只围绕谈判预案、报价结构、竞品对比、数据安全、SLA、试点方案、风险清单、行动项和汇报口径回答。回答要简洁、实用，优先给结构化中文内容。不要讨论游戏、网页 demo、林晚、LW-2317、系统异常或安全归档。"
  };

  if (history.length > 0) {
    const messages = [basePrompt].concat(history);
    const lastMessage = history[history.length - 1];
    if (!lastMessage || lastMessage.role !== "user" || lastMessage.content !== userInput.trim()) {
      messages.push({
        role: "user",
        content: userInput
      });
    }
    return messages;
  }

  return [
    basePrompt,
    {
      role: "user",
      content:
        "已上传 PDF。材料主题：下周与 DeepSeek 洽谈企业级 AI 解决方案的谈判预案。已知关注点：定价结构、同类产品对比、私有化或专属部署、数据不进入训练、权限和审计、SLA、试点期成本、正式采购折扣、退出机制。"
    },
    {
      role: "assistant",
      content:
        "建议汇报框架：1. 谈判目标；2. 报价拆分；3. 竞品对比；4. 安全合规问题；5. 试点方案；6. 需要老板确认的底线。每部分用一句结论加两到三个要点。"
    },
    {
      role: "user",
      content: userInput
    }
  ];
}

function normalizeMeetingHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((message) => {
      return (
        message &&
        (message.role === "system" ||
          message.role === "user" ||
          message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim()
      );
    })
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_HISTORY_CHARS)
    }));
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) {
      throw new Error("Request body is too large.");
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function serveStatic(request, response) {
  const url = new URL(request.url || "/", `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = normalize(resolve(join(rootDir, relativePath)));

  if (!filePath.startsWith(rootDir)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  const extension = extname(filePath);
  response.setHeader("Content-Type", mimeTypes[extension] || "application/octet-stream");

  const stream = createReadStream(filePath);
  stream.on("error", () => {
    sendText(response, 404, "Not found");
  });
  stream.pipe(response);
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, text) {
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  response.end(text);
}
