# Game Master

轻量级网页端文字解密游戏项目。

## 推荐阅读顺序

给 Codex 开始开发前，优先阅读：

1. [design/00-codex-reading-guide.md](design/00-codex-reading-guide.md)
2. [design/01-project-brief.md](design/01-project-brief.md)
3. [design/02-game-design.md](design/02-game-design.md)
4. [design/03-story-and-tone.md](design/03-story-and-tone.md)
5. [design/04-puzzle-design.md](design/04-puzzle-design.md)
6. [design/05-content-format.md](design/05-content-format.md)
7. [design/06-ui-ux.md](design/06-ui-ux.md)
8. [design/07-technical-design.md](design/07-technical-design.md)
9. [design/08-development-plan.md](design/08-development-plan.md)

## 目录说明

- `design/`: 给人和 Codex 阅读的设计文档。
- `content/puzzles/`: 后续放每一关谜题内容。
- `content/copy/`: 后续放界面文案、提示、结局文本。
- `assets/images/`: 图片素材。
- `assets/audio/`: 音效或背景音乐素材。
- `assets/fonts/`: 字体文件。
- `references/`: 参考资料、竞品截图、灵感链接。

## Demo 运行方式

当前 demo 是零依赖静态网页，主要文件：

- `index.html`
- `src/app.js`
- `src/styles.css`

本地预览：

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:5173/
```

推荐主线输入：

```text
测试一下你是否在线
救我
2317
林晚
LW-2317
唤醒信号
```

最终选择阶段也可以输入 `重置` 或 `确认归档` 来进入另外两个结局。
