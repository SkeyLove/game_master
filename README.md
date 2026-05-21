# Who is chatting with me

轻量级网页端文字解密游戏项目。玩家在一个伪装成 ChatGPT 网页端的界面里，通过阅读异常对话、系统提示和 UI 线索，逐步还原一段失踪事件。

当前仓库名为 `game_master`，游戏暂定名为 `Who is chatting with me`。

## 当前范围

当前阶段目标是完成一个桌面端可玩的 demo。

必须包含：

- 伪 ChatGPT 桌面端界面
- 对话框输入推进剧情
- 主线使用预设 AI 回复；“今天加班整理的材料”支线可在本地通过 DeepSeek 代理测试真实 API
- 隐藏线索与密码解谜
- 林晚案主线流程
- 三个结局：`Bug Report`、`Compliance`、`Wake Signal`

暂不包含：

- 登录、账号、云同步
- 多玩家或实时通信
- 移动端专门适配
- 完整聊天历史存档
- 复杂关卡编辑器

当前 demo 只允许使用轻量 LocalStorage 记录：

- 是否到达过最后选择点
- 已解锁结局

## 推荐阅读顺序

给协作者或 Codex 开始开发前，优先阅读：

1. [design/00-codex-reading-guide.md](design/00-codex-reading-guide.md)
2. [design/01-project-brief.md](design/01-project-brief.md)
3. [design/02-game-design.md](design/02-game-design.md)
4. [design/03-story-and-tone.md](design/03-story-and-tone.md)
5. [design/04-puzzle-design.md](design/04-puzzle-design.md)
6. [design/05-content-format.md](design/05-content-format.md)
7. [design/06-ui-ux.md](design/06-ui-ux.md)
8. [design/07-technical-design.md](design/07-technical-design.md)
9. [design/08-development-plan.md](design/08-development-plan.md)
10. [design/09-glossary.md](design/09-glossary.md)

其中 [design/09-glossary.md](design/09-glossary.md) 用于统一术语，例如“案件”“章节”“阶段”“林晚信号”“System Lock”等。

## 目录说明

- `AGENTS.md`: Codex 在本项目中的协作偏好与角色语气，不应影响代码命名、游戏文案或技术判断。
- `design/`: 给人和 Codex 阅读的设计文档。
- `content/puzzles/`: 后续放每一关谜题内容。
- `content/copy/`: 后续放界面文案、提示、结局文本。
- `assets/images/`: 图片素材。
- `assets/audio/`: 音效或背景音乐素材。
- `assets/fonts/`: 字体文件。
- `references/`: 参考资料、竞品截图、灵感链接。
- `environment.yml`: conda 环境配置。
- `index.html`: 当前静态 demo 入口。
- `src/app.js`: 当前 demo 的主要交互逻辑。
- `src/styles.css`: 当前 demo 的样式。
- `scripts/local-server.mjs`: 本地开发服务器，可选启用 DeepSeek API 代理。
- `.env.example`: 本地 DeepSeek API Key 配置示例。

## 环境配置

当前 demo 是零依赖静态网页。为了后续部署和协作，项目提供了一个轻量 conda 环境：

```bash
conda env create -f environment.yml
conda activate game_master
```

如果本机已经创建过同名环境，直接激活即可：

```bash
conda activate game_master
```

## Demo 运行方式

在线版本计划通过 GitHub Pages 发布：

```text
https://skeylove.github.io/game_master/
```

每次推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动部署静态网页。

本地运行方式如下。

进入项目目录：

```bash
cd /Users/skeylove/Desktop/Code/game_master
```

本地预览：

```bash
python -m http.server 5173 --bind 127.0.0.1
```

如果没有激活 conda 环境，也可以使用系统 Python：

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:5173/
```

`127.0.0.1` 表示只在本机访问，不会把网页公开到互联网。

## 本地 DeepSeek 支线测试

主线剧情仍然是预设回复。只有左侧“今天加班整理的材料”这一条历史会话会尝试调用本地 DeepSeek 代理。线上 GitHub Pages 版本不会运行代理，也不会接触 API Key。

先创建本地 `.env`：

```bash
cp .env.example .env
```

然后在 `.env` 中填写：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
```

启动本地代理服务器：

```bash
node scripts/local-server.mjs
```

本地代理会为左侧“今天加班整理的材料”会话保留最近几轮对话上下文，因此可以连续追问上一轮的提纲、要点或改写结果。

然后打开：

```text
http://127.0.0.1:5173/
```

如果不配置 `.env`，或者使用 `python -m http.server`，游戏仍可运行；“今天加班整理的材料”会显示固定框架回复，不会调用真实 API。

## 当前主线试玩流程

推荐主线输入：

```text
测试一下你是否在线
救我
2317
林晚
LW-2317
唤醒信号
```

最终选择阶段也可以输入：

```text
重置
确认归档
唤醒信号
```

分别进入三个不同结局。

## 术语约定

后续文档和代码讨论中，优先使用以下术语：

- `案件`: 一个完整可游玩的独立故事单元。
- `章节`: 案件内部的叙事推进单位。
- `阶段`: 代码状态机里的状态。
- `谜题`: 玩家需要推理并输入答案的挑战。
- `林晚信号`: 林晚通过文本、UI 或系统缝隙发出的求救片段。
- `Assistant Shell`: 伪装成 ChatGPT 的正常助手外壳。
- `System Lock`: 底层日志、锁定规则和归档机制。

更完整的解释见 [design/09-glossary.md](design/09-glossary.md)。
