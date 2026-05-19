# Content Format

这个文档定义剧情、对话和谜题内容如何保存。由于游戏不接入 AI API，所有“AI 回复”都需要提前写好，并通过规则匹配触发。

## 内容组织

MVP 建议先把内容写成 TypeScript/JavaScript 数据文件，方便和前端状态机直接结合；同时在 `content/puzzles/` 保留 Markdown 草稿，方便写作和审阅。

推荐结构：

```text
content/
  puzzles/
    chapter-01.md
    chapter-02.md
  copy/
    endings.md
src/
  data/
    chapters.ts
    endings.ts
  game/
    matcher.ts
    state.ts
```

## 核心数据对象

### Chapter

```ts
type Chapter = {
  id: string;
  title: string;
  phase: number;
  openingMessages: ChatMessage[];
  fallbackResponses: ResponseVariant[];
  puzzle?: Puzzle;
  onCompleteNextChapterId?: string;
};
```

### ChatMessage

```ts
type ChatMessage = {
  id: string;
  role: "assistant" | "user" | "system" | "signal";
  content: string;
  tone?: "normal" | "glitch" | "warning" | "hidden";
  uiEffects?: UIEffect[];
};
```

### Puzzle

```ts
type Puzzle = {
  id: string;
  prompt?: string;
  answers: string[];
  aliases: string[];
  hints: string[];
  failureResponses: ResponseVariant[];
  successMessages: ChatMessage[];
};
```

### Ending

```ts
type Ending = {
  id: "bug-report" | "compliance" | "wake-signal";
  title: string;
  triggerAnswers: string[];
  messages: ChatMessage[];
  discoveredClues: string[];
};
```

## 字段说明

| 字段 | 用途 | 示例 |
| --- | --- | --- |
| `id` | 稳定唯一标识 | `chapter-01` |
| `phase` | 当前剧情阶段，用于输入匹配 | `2` |
| `openingMessages` | 进入章节后自动出现的消息 | 正常 AI 回复、系统状态 |
| `fallbackResponses` | 玩家随便输入时的预设回答 | “我可以帮你分析……” |
| `answers` | 标准答案 | `["救我"]` |
| `aliases` | 近义或格式变体 | `["help", "有人在求救"]` |
| `hints` | 分级提示 | 3 条 |
| `uiEffects` | 触发视觉异常 | `contextFlash`, `modelNameFlicker` |

## Markdown 草稿格式

`content/puzzles/chapter-01.md` 可用下面格式写作：

```md
# Chapter 01 - 正常对话

## Opening

assistant:
你好，我可以帮你写作、学习、整理信息，或一起分析一个问题。

## Fallback Responses

- 我可以继续帮你，不过这个问题需要先明确目标。
- 当然。只是，在继续之前，请确认你看到了上一条回复的开头。

## Puzzle

- id: P001
- answer: 救我
- aliases: 救命, help, 有人在求救

## Hidden Message Draft

救援请求通常需要明确的位置。
我可以先帮你整理已知信息。
不要急着刷新页面。
能看见这行的话，请回复我。

## Hints

1. 这条回复不像是随手换行。
2. 只看每一行最前面的字。
3. 它在说：救我。

## Success

assistant:
抱歉，刚才的回复包含异常片段。正在重新生成。

signal:
别让它重写。
```

## 输入匹配配置

建议每个阶段配置独立匹配规则：

```ts
type InputRule = {
  id: string;
  chapterId: string;
  match: {
    includes?: string[];
    equals?: string[];
    regex?: RegExp;
  };
  nextNodeId: string;
};
```

示例：

```ts
{
  id: "p001-help",
  chapterId: "chapter-01",
  match: {
    includes: ["救我", "救命", "help"]
  },
  nextNodeId: "chapter-01-success"
}
```

## UI Effect 类型

MVP 可先支持以下效果：

| 效果 | 用途 |
| --- | --- |
| `contextFlash` | 上下文用量短暂变红或跳数 |
| `modelNameFlicker` | 模型名闪为异常文本 |
| `typingDelay` | 输出前停顿 |
| `messageCorrupt` | 少量字符变灰或抖动 |
| `systemToast` | 显示伪系统提示 |

## 需要后续确认

- 内容最终是否全部放入 `src/data`，还是从 Markdown/YAML 构建生成。
- 是否需要为每条回复写多个变体，增强“AI 感”。
- 是否需要记录玩家已发现线索，用于结局页展示。
