# Content Format

这个文档定义剧情、对话、谜题以及前端“伪 AI 引擎”的数据结构如何保存。由于游戏不接入真实的 AI API，所有的案件内容、判定规则和表现效果都通过一个统一的 JSON/JS 对象进行管理。

## 内容组织

项目采用了完全**数据驱动 (Data-Driven)** 的架构。核心引擎 (`app.js`) 与案件内容 (`data.js`) 完全解耦。只要向 `window.STORY_DATABASE` 注入符合规范的数据对象，引擎就能自动渲染出对应的案件（Anthology）。

推荐结构：

```text
src/
  app.js      // 核心引擎（解析数据、正则匹配、渲染UI、触发效果）
  data.js     // 全局案件库（包含所有的主线与衍生案件）
  chatter.js  // (可选拆分) 包含 100+ 闲聊意图的正则与回复库
```

## 核心数据对象 (Case / Story Object)

每一个独立的案件（如林晚案、外卖案）都是 `STORY_DATABASE` 中的一个对象。中文文档中统一称为“案件”，代码里可沿用 `story` 作为数据对象名。

### Story 基础信息

```javascript
const storyTemplate = {
  title: "案件标题",        // 左侧边栏显示的标题
  meta: "副标题/时间",      // 左侧边栏显示的次级信息
  welcomeTitle: "你好",     // 进入游戏后主界面显示的欢迎大标题
  prompts: ["快捷输入1"],   // 主界面提供的预设点击提问
  chapters: [],           // 章节数组（见下方拆解）
  endings: {}             // 结局对象（见下方拆解）
};
```

### Chapter (章节/剧情阶段)

```javascript
{
  id: 1, // 章节序号
  // 玩家进入本章节时，系统自动输出的消息
  messages: [
    { role: 'assistant', text: '正常回复文本' },
    { role: 'system', text: '系统级警告文本' },
    { role: 'signal', text: '隐藏的求救者发出的红色文本' }
  ],
  
  // 闲聊兜底时的线索注入（Clue Injection）
  fallback: [
    "每次玩家闲聊后，必定追加的悬疑线索1",
    "线索2"
  ],
  
  // 解谜条件与过关判定
  puzzles: [
    {
      type: "exact", // 'exact' 精确匹配 | 'regex' 正则匹配 | 'action' 物理操作
      keywords: ["救我", "救命"],
      // 答对后触发的表现效果和下一关逻辑
      onSuccess: {
        nextChapter: 2,
        triggerEffect: "glitch_text" // 触发UI表现
      }
    }
  ]
}
```

### Chatter Engine (动态闲聊库结构)

用于支撑“输入匹配逻辑”中的 100+ 闲聊意图。这部分独立于具体案件，作为全局兜底：

```javascript
const ChatterIntents = [
  {
    category: "Meta_Game",
    regex: /退出|关闭|断网/,
    response: "进程一旦启动，强制中断可能会导致数据残留。"
  },
  {
    category: "Story_Specific_Delivery",
    regex: /门锁|密码|破解/,
    response: "民用级智能门锁的暴力破解平均需要 3 分钟。请抓紧时间。"
  }
];
// 引擎逻辑： Response = 匹配到的 ChatterIntents.response + 当前 Chapter.fallback
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

在 `onSuccess.triggerEffect` 或特定剧情节点中调用的视觉/听觉效果枚举：

| 效果 | 用途与表现 |
| --- | --- |
| `contextFlash` | 基础：右上角上下文用量短暂变红或跳数。 |
| `modelNameFlicker` | 基础：顶部模型名闪为异常文本（如 `GPT-4` 闪成 `Help-Me`）。 |
| `typingDelay` | 基础：输出前长停顿，模拟系统挣扎或增加压迫感。 |
| `messageCorrupt` | 进阶：已输出的聊天记录突然变灰、抖动或被 Zalgo 乱码覆盖。 |
| `systemToast` | 基础：弹出红色或黑色的伪系统错误提示框。 |
| `tabTitleChange` | **Webcore**：切出页面时，网页的 Tab 标题发生改变。 |
| `renderIframe` | **Webcore**：在对话框中渲染一个假冒的网页（如维基百科、论坛）。 |
| `clipboardHijack` | **Webcore**：劫持玩家的复制操作，强制写入求救信号。 |
| `fakeCameraRequest` | **硬件联动**：弹出浏览器的“请求使用摄像头”原生授权框。 |
| `simulateOffline` | **系统联动**：强行隐藏浏览器的滚动条，并弹出伪造的网络断开遮罩。 |

## 需要后续确认

- 是否需要将 100+ 条 Chatter 匹配规则从 `app.js` 中抽离为单独的配置文件。
- 复杂案件（如包含假冒 iframe 网页的案件）是否需要为 iframe 内容设计独立的数据结构。
- 轻量 LocalStorage 的结构如何记录“最后选择点”和“已解锁结局”，并为后续跨周目记忆 (Persistent Memory) 预留字段。
