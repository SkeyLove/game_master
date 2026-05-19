# Technical Design

这个文档定义 demo 的推荐技术方案和核心实现结构。目标是快速做出可玩的网页端单机 demo，不接入 AI API。

## 技术栈

建议首版使用：

- 前端框架：React
- 构建工具：Vite
- 语言：TypeScript
- 样式方案：CSS Modules 或普通 CSS，先不引入复杂 UI 库
- 状态管理：React `useReducer`，必要时拆出纯函数状态机
- 测试工具：Vitest 用于答案匹配和状态推进，Playwright 用于关键流程冒烟测试
- 部署目标：静态站点，可部署到 Vercel、Netlify、GitHub Pages 或任意静态服务器

如果后续只想更快做极简原型，也可以用纯 HTML/CSS/JS，但 React + Vite 更适合维护多阶段对话和分支结局。

## 核心架构

```text
src/
  app/
    App.tsx
  components/
    ChatLayout.tsx
    ChatMessage.tsx
    Composer.tsx
    Sidebar.tsx
    TopStatusBar.tsx
    EndingView.tsx
  data/
    chapters.ts
    endings.ts
  game/
    matcher.ts
    reducer.ts
    normalize.ts
    types.ts
  styles/
    global.css
    chat.css
  utils/
    delay.ts
```

## 数据模型

### GameState

```ts
type GameState = {
  phase: "intro" | "playing" | "ending";
  currentChapterId: string;
  messages: ChatMessage[];
  solvedPuzzleIds: string[];
  discoveredClues: string[];
  usedHints: Record<string, number>;
  wrongAttempts: Record<string, number>;
  endingId?: string;
};
```

### ChatMessage

```ts
type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "signal";
  content: string;
  tone?: "normal" | "glitch" | "warning" | "hidden";
  createdAt?: string;
};
```

### Puzzle

```ts
type Puzzle = {
  id: string;
  answers: string[];
  aliases: string[];
  hints: string[];
  successMessages: ChatMessage[];
  failureResponses: string[];
};
```

## 状态推进

推荐使用 reducer 处理玩家输入：

1. `SUBMIT_INPUT`：把用户消息加入聊天。
2. `MATCH_INPUT`：根据当前章节和输入内容匹配答案、结局或 fallback。
3. `APPEND_RESPONSE`：追加预设 assistant/system/signal 消息。
4. `COMPLETE_PUZZLE`：记录已解谜题和新线索。
5. `ADVANCE_CHAPTER`：切换下一章节。
6. `ENTER_ENDING`：进入结局视图。

## 输入匹配

必须先做归一化：

- 去除首尾空格。
- 英文转小写。
- 全角字符转半角。
- 去除常见标点。
- 中文答案可去除中间空格。
- 特殊规则：`23:17`、`23 17`、`2317` 等价；`LW-2317`、`LW2317` 等价。

匹配优先级：

1. 当前章节关键答案。
2. 当前章节答案别名。
3. 最终结局触发词。
4. 通用试探词，例如 `你是谁`、`有人吗`。
5. 当前章节 fallback。

## 存档

- MVP：不需要存档。
- 刷新页面：可以从头开始。
- 后续版本：可使用 `localStorage` 保存 `GameState`，但要注意这会削弱“误入普通 AI 页面”的初始体验。

## UI 状态

需要维护的 UI 状态：

- 是否正在生成回复。
- 当前可用提示等级。
- 顶部上下文数字。
- 模型名显示文本。
- 是否显示结局页。

UI 异常不应该影响核心数据判断；它们应由剧情节点触发，但失败时不阻塞游戏推进。

## 测试重点

- 答案归一化是否正确。
- 每个谜题的别名是否能触发成功。
- 错误输入是否不会卡死流程。
- 三个结局是否都能进入。
- Enter 和 Shift + Enter 行为是否正确。
- 首屏输入任意内容后是否能开始游戏。

## 风险

- 伪 ChatGPT 界面要像，但不能依赖真实品牌资源或官方接口。
- 预设回复需要足够多，否则玩家容易看出不是 AI。
- 自由输入范围太大，fallback 必须自然，不能频繁露馅。
- 谜题线索藏得太深会导致玩家以为只是 UI bug。
- 三结局需要在文案上显著不同，否则重复游玩动力不足。

## 待确认

- 是否使用 React + Vite 作为正式 demo 技术栈。
- 是否需要完全避免使用 ChatGPT 名称和标识，只保留“AI 对话界面”感觉。
- MVP 是否要内置 5 个谜题，还是先做 3 个谜题的短版。
- 结局 C 是否定义为真结局，还是三个结局平权。
