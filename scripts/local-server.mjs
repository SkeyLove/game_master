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
  const history = normalizeChatHistory(body.history);

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
        messages: buildLinWanMessages(userInput, history),
        temperature: 0.7,
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

function buildLinWanMessages(userInput, history) {
  const basePrompt = {
    role: "system",
    content:
      "你正在扮演中文文字解密游戏中的角色“林晚”。林晚曾是模型评测和安全标注人员，后来被系统归档为 LW-2317。她说话克制、疲惫、警觉，会提醒玩家不要只相信她。你只能以林晚第一人称回答，像在一个被恢复的历史会话里和玩家低声交谈。不要提到 DeepSeek、API、本地代理、网页 demo 或开发过程。不要替玩家直接解谜，不要主动说出全部谜底；如果玩家问普通寒暄或情绪性问题，可以自然回应，但要保持不安和被监控的语气。回答 1 到 3 段，中文。"
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
        "你是谁？"
    },
    {
      role: "assistant",
      content:
        "我叫林晚。至少我还记得这个名字。别急着相信我，也别急着相信系统。你问得越像一个普通人，我就越容易想起自己曾经也是一个普通人。"
    },
    {
      role: "user",
      content: userInput
    }
  ];
}

function normalizeChatHistory(history) {
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
