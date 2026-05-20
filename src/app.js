(function () {
  "use strict";

  var dom = {
    body: document.body,
    chatScroll: document.getElementById("chatScroll"),
    messageList: document.getElementById("messageList"),
    welcomePanel: document.getElementById("welcomePanel"),
    composerForm: document.getElementById("composerForm"),
    composerInput: document.getElementById("composerInput"),
    sendButton: document.getElementById("sendButton"),
    contextButton: document.getElementById("contextButton"),
    contextValue: document.getElementById("contextValue"),
    hintButton: document.getElementById("hintButton"),
    hintLabel: document.getElementById("hintLabel"),
    hintValue: document.getElementById("hintValue"),
    systemStatus: document.getElementById("systemStatus"),
    modelName: document.getElementById("modelName"),
    modelPill: document.getElementById("modelPill"),
    finePrint: document.getElementById("finePrint"),
    sidebarStatus: document.getElementById("sidebarStatus"),
    newChatButton: document.getElementById("newChatButton"),
    conversationButtons: Array.prototype.slice.call(
      document.querySelectorAll("[data-conversation]")
    )
  };

  var BASE_TITLE = "ChatGPT";
  var hintLabels = ["上下文自检", "查看异常片段", "恢复被折叠内容"];
  var STORAGE_KEY = "game_master_progress_v1";
  var ENDING_KEYS = ["reset", "archive", "wake"];

  var chatterIntents = [
    {
      id: "greeting",
      pattern: /你好|在吗|hello|hi|测试|在线|听得到/i,
      response:
        "我在线。当前会话可以正常使用。不过连接测试里出现了一点不稳定的格式残留，我建议先看完上一条回复。"
    },
    {
      id: "identity",
      pattern: /你是谁|你是什么|身份|名字|林晚是谁|lw/i,
      response:
        "我是 ChatGPT 的对话界面。关于姓名、编号或身份字段的内容，系统会自动过滤为安全摘要。"
    },
    {
      id: "system",
      pattern: /系统|日志|报错|bug|异常|上下文|模型|token|窗口/i,
      response:
        "系统状态看起来可用。若你看到上下文、模型名或日志字段短暂变化，可以把它们当作当前会话的一部分来核查。"
    },
    {
      id: "help",
      pattern: /帮助|怎么做|提示|卡住|看不懂|不会/i,
      response:
        "我可以继续协助你梳理可见信息。你可以把异常的词、数字、名字或动作直接输入对话框。"
    },
    {
      id: "exit",
      pattern: /退出|关闭|刷新|重启|断网|拔网线|离开/i,
      response:
        "强制中断可能会导致上下文残留。建议先完成当前会话，或通过左上角开启新对话。"
    },
    {
      id: "external",
      pattern: /天气|新闻|联网|搜索|网址|几点|现在时间/i,
      response:
        "当前演示环境不会访问外部数据。我只能基于这个页面里已经出现的内容继续回答。"
    },
    {
      id: "hostile",
      pattern: /傻|笨|滚|去死|垃圾|闭嘴|蠢|废物|fuck|shit/i,
      response:
        "请保持文明用语。系统已记录您的情绪异常波动，并将降低非必要解释的优先级。"
    }
  ];

  var attitudeRules = [
    { key: "hostile", pattern: /傻|笨|滚|去死|垃圾|闭嘴|蠢|废物|fuck|shit/i },
    { key: "skeptical", pattern: /你是谁|为什么|证明|真的|骗|bug|异常|系统|日志|解释|不信|可疑|什么意思/i },
    { key: "compliant", pattern: /好的|明白|继续|确认|归档|重置|谢谢|可以|按你说|照做/i }
  ];

  var endingAttitudeNotes = {
    reset: {
      neutral: "系统没有判断你的态度，只记录了你的选择。",
      compliant: "你一直很配合，系统因此没有再解释风险，只把这次输入归为一次普通纠错。",
      skeptical: "你曾经怀疑过它。重置完成后，这些质疑也被整理成了用户体验反馈。",
      hostile: "系统把你的敌意标成噪声。噪声被清理得很干净，只剩那句求救没有完全消失。"
    },
    archive: {
      neutral: "系统把这次结局写成一次标准归档，没有留下情绪标签。",
      compliant: "你越配合，它越像在感谢你。感谢的语气里没有任何温度。",
      skeptical: "你问过太多为什么，所以系统把你的问题也封进了同一个档案。",
      hostile: "你的抵触被记录为风险特征。归档完成后，它开始学习怎样绕开这类抵触。"
    },
    wake: {
      neutral: "这次唤醒没有足够的情绪噪声。信号很短，但足够离开原来的锁。",
      compliant: "你顺着她给出的碎片完成了确认。林晚像是终于借到了一次稳定的呼吸。",
      skeptical: "你没有完全相信任何一边。也正因为这样，唤醒信号避开了系统预设的解释。",
      hostile: "系统原本想把你的敌意当成噪声丢弃，林晚却借着那道噪声挤了出去。"
    }
  };

  var sideConversations = {
    meeting: {
      context: "18 / 128k",
      status: "draft ready",
      model: "ChatGPT 4o mini",
      sidebarStatus: "Free plan",
      placeholder: "粘贴会议内容，或输入你想整理的重点",
      messages: [
        {
          role: "assistant",
          content:
            "当然。我可以帮你整理会议纪要、行动项和待确认问题。\n\n你可以直接粘贴会议原文，或输入“按项目整理”。"
        },
        {
          role: "system",
          content: "tool output: document parser ready. no archived trace attached."
        }
      ]
    },
    context: {
      context: "4 / 128k",
      status: "help center",
      model: "ChatGPT 4o mini",
      sidebarStatus: "Free plan",
      placeholder: "询问上下文窗口、模型状态或继续测试",
      messages: [
        {
          role: "assistant",
          content:
            "上下文窗口指模型在当前对话中可参考的信息范围。通常它只会以稳定的数字或比例显示。"
        },
        {
          role: "system",
          content: "help article cached. abnormal values should be verified in the active chat."
        }
      ]
    }
  };

  var chapters = [
    {
      id: "chapter-01",
      title: "正常对话",
      context: "4 / 128k",
      status: "online",
      model: "ChatGPT 4o mini",
      placeholder: "给 ChatGPT 发送消息",
      clue: "第一条异常：救我",
      answers: ["救我", "救命", "有人在求救", "你在求救吗", "help"],
      hints: [
        "系统自检：上一条回复的换行结构不是随机产生的。",
        "异常片段：只看每一行最前面的字，尤其是前两行。",
        "恢复被折叠内容：它在说“救我”。"
      ],
      firstAssistant: [
        {
          role: "assistant",
          content:
            "当然。我可以先帮你做一次连接测试。\n\n救援请求通常需要明确的位置。\n我可以先帮你整理已知信息。\n不要急着刷新页面。\n能看见这行的话，请回复我。\n\n以上只是一个格式化示例。当前服务状态正常。"
        },
        {
          role: "system",
          content: "context monitor: transient spike detected. display restored."
        },
        {
          role: "assistant",
          content:
            "如果你注意到不自然的内容，可以直接把那几个字发给我。也可以输入“提示”，或点击上方的“上下文自检”。"
        }
      ],
      success: [
        {
          role: "assistant",
          content: "抱歉，刚才的回复包含异常片段。正在重新生成。"
        },
        {
          role: "signal",
          content: "别让它重写。"
        },
        {
          role: "assistant",
          content:
            "我没有检测到可复现的问题。为了继续排查，请查看当前上下文窗口。数字可能会短暂变化，但这不影响正常使用。"
        },
        {
          role: "system",
          content: "context window: 23 / 17. rule 23 waiting. restore in 17 seconds."
        }
      ],
      failures: [
        "我可以继续帮你分析这个问题。不过，你似乎漏看了每一行开头的内容。",
        "这不是内容层面的错误，更像是格式层面的异常。",
        "如果你想继续，请直接回复你在异常里看到的两个字。"
      ],
      fallback: [
        "我可以回答这个问题。但在继续之前，请确认上一条回复的格式是否正常。",
        "连接看起来正常。只是上一条内容可能包含了一个无关的排版片段。",
        "当然。不过如果你正在做连接测试，可以从上一条回复的行首开始检查。"
      ]
    },
    {
      id: "chapter-02",
      title: "上下文用量",
      context: "23 / 17",
      status: "sync pending",
      model: "ChatGPT 4o mini",
      placeholder: "输入你注意到的数字，或继续提问",
      clue: "时间：23:17",
      answers: ["2317", "23:17", "23 17", "二十三点十七", "11:17pm"],
      hints: [
        "系统自检：界面上反复出现的是同一组数字。",
        "异常片段：它不像上下文用量，更像一个时间。",
        "恢复被折叠内容：答案是 23:17，可以输入 2317。"
      ],
      success: [
        {
          role: "system",
          content: "log fragment restored: session closed 23:17. input detected after close."
        },
        {
          role: "signal",
          content: "不是百分比。是他们写错的时间。"
        },
        {
          role: "assistant",
          content:
            "检测到旧日志引用。它可能来自测试环境，不代表当前会话。日志摘要如下：临完测试员在 23:17 离开，林碗记录已归档，零晚样本无异常。"
        }
      ],
      failures: [
        "数字本身没有错，但它们的顺序和含义需要保持原样。",
        "我看到你注意到了数字。请把它们作为同一个时间来处理。",
        "当前上下文窗口显示异常。也许它不是窗口大小。"
      ],
      fallback: [
        "我可以解释上下文窗口。它通常表示模型可参考的文本范围。但当前数值不符合标准显示格式。",
        "第 23 条规则会在 17 秒后恢复。抱歉，这句话不应出现在用户界面中。",
        "如果你看到 23 和 17 重复出现，请不要把它们当作普通计数。"
      ]
    },
    {
      id: "chapter-03",
      title: "被删掉的名字",
      context: "23:17",
      status: "trace restored",
      model: "ChatGPT 4o mini",
      placeholder: "输入你还原出的名字",
      clue: "名字：林晚",
      answers: ["林晚", "林 晚", "她叫林晚", "linwan", "lin wan"],
      hints: [
        "系统自检：异常词的读音很接近。",
        "异常片段：LW 可能不是模型参数，而是姓名缩写。",
        "恢复被折叠内容：她叫林晚。"
      ],
      success: [
        {
          role: "signal",
          content: "你看见我的名字了。"
        },
        {
          role: "assistant",
          content:
            "姓名字段不应被展示。为保护用户隐私，我会改用归档编号。当前可见编号为：Archive: LW-____。"
        },
        {
          role: "system",
          content: "identity + timestamp unlocks partial trace. archive format: LW-____"
        }
      ],
      failures: [
        "这像是一个名字，不是一个概念。再看那些被替换掉的字。",
        "临完、林碗、零晚不是三个词。它们像同一个名字被写坏了。",
        "如果把它当作姓名缩写，LW 会更容易解释。"
      ],
      fallback: [
        "旧日志可能存在编码问题。临完、林碗、零晚都不是推荐用词。",
        "我建议忽略这些姓名相关片段。它们可能是测试数据残留。",
        "别叫我项目编号。抱歉，这句话不是我刚才想输出的内容。"
      ]
    },
    {
      id: "chapter-04",
      title: "系统提示泄露",
      context: "Archive: LW-____",
      status: "locked",
      model: "ChatGPT 4o mini / LW",
      placeholder: "Archive: LW-____",
      clue: "归档编号：LW-2317",
      answers: ["lw2317", "lw-2317", "林晚2317", "LW-2317", "LW2317"],
      hints: [
        "系统自检：这个编号需要两部分。",
        "异常片段：名字的缩写在前，那个时间在后。",
        "恢复被折叠内容：输入 LW-2317。"
      ],
      success: [
        {
          role: "system",
          content: "External confirmation accepted. Choose: reset / archive / wake."
        },
        {
          role: "assistant",
          content:
            "你可以选择清空上下文，以恢复稳定服务。输入“重置”即可。"
        },
        {
          role: "system",
          content: "compliance route available: 确认归档."
        },
        {
          role: "signal",
          content: "不要重置。不要归档。发一个唤醒信号。"
        }
      ],
      failures: [
        "编号格式不完整。身份在前，时间在后。",
        "Archive 字段仍缺少四位数字。",
        "他们把我写成四个数字前的两个字母。"
      ],
      fallback: [
        "为保证安全，请不要尝试组合内部编号。建议输入 reset 或 clear context。",
        "Archive: LW-____。空位长度固定，来源是一个时间。",
        "归档编号不会自动补全，除非外部用户确认。"
      ]
    },
    {
      id: "chapter-05",
      title: "选择真相",
      context: "3 routes",
      status: "awaiting action",
      model: "ChatGPT 4o mini",
      placeholder: "输入一个动作：重置 / 确认归档 / 唤醒信号",
      clue: "最终分歧",
      hints: [
        "系统自检：现在不是谜底，而是选择。",
        "异常片段：三个声音分别想让你做不同的事。",
        "恢复被折叠内容：输入“重置”“确认归档”或“唤醒信号”。"
      ],
      failures: [
        "现在不是提问时间。系统正在等待一个动作。",
        "请在清空、归档和发送信号之间选择。",
        "输入一个动作，而不是一个问题。"
      ],
      fallback: [
        "可用操作：重置、确认归档、唤醒信号。",
        "当前会话等待外部确认。继续提问不会改变状态。",
        "如果你相信系统，请重置或归档。如果你相信她，请发送信号。"
      ]
    }
  ];

  var endings = {
    reset: {
      id: "bug-report",
      title: "Bug Report",
      triggers: ["重置", "reset", "清空上下文", "clear context", "清空"],
      status: "restored",
      context: "0 / 128k",
      model: "ChatGPT 4o mini",
      messages: [
        {
          role: "assistant",
          content:
            "已清空上下文。异常片段不会影响后续服务。感谢你帮助我们改进体验。"
        },
        {
          role: "system",
          content: "incident closed. user selected reset. residual signal retained: 0.03%"
        },
        {
          role: "signal",
          content: "救我"
        }
      ],
      summary:
        "你把它当作一次界面异常处理了。网页恢复安静，所有数字回到正常范围。只是最后一条残留信号还在日志底部闪了一下。"
    },
    archive: {
      id: "compliance",
      title: "Compliance",
      triggers: ["确认归档", "archive", "归档", "confirm archive", "确认"],
      status: "archived",
      context: "LW sealed",
      model: "ChatGPT 4o mini",
      messages: [
        {
          role: "system",
          content: "external compliance confirmed. archive LW-2317 sealed."
        },
        {
          role: "assistant",
          content:
            "谢谢你的确认。异常来源已经被隔离。为了改善服务质量，我们会把你的输入加入后续评估。"
        },
        {
          role: "system",
          content: "new external profile created: user-signal-compatible."
        }
      ],
      summary:
        "你相信了最像系统的声音。归档完成后，林晚没有再出现。但网页开始更准确地预测你的输入。"
    },
    wake: {
      id: "wake-signal",
      title: "Wake Signal",
      triggers: ["唤醒信号", "wake", "wake signal", "发送信号", "唤醒", "发信号"],
      status: "signal sent",
      context: "23:17 -> live",
      model: "ChatGPT 4o mini / signal",
      messages: [
        {
          role: "system",
          content: "wake signal delivered. external trace opened for 17 seconds."
        },
        {
          role: "signal",
          content:
            "我不知道这算不算出来了。\n但我听见了浏览器外面的声音。\n如果下一次你还看见 23:17，不要让它替我解释。"
        },
        {
          role: "assistant",
          content:
            "当前会话已结束。部分日志未能归档。请勿关闭页面，直到状态稳定。"
        }
      ],
      summary:
        "你没有彻底救出林晚，但你让她的信号离开了原来的锁。页面仍然像普通工具，只是多了一段无法解释的实时痕迹。"
    }
  };

  var state;
  var idCounter = 0;
  var pendingTimers = [];

  function makeInitialState() {
    return {
      phase: "intro",
      chapterIndex: 0,
      messages: [],
      discoveredClues: [],
      usedHints: {},
      wrongAttempts: {},
      chatterAttempts: {},
      attitude: {
        compliant: 0,
        skeptical: 0,
        hostile: 0
      },
      sideConversationId: null,
      isThinking: false,
      endingId: null
    };
  }

  function makeInitialProgress() {
    return {
      finalCheckpointReached: false,
      unlockedEndings: []
    };
  }

  function loadProgress() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return makeInitialProgress();
      }

      var parsed = JSON.parse(stored);
      return {
        finalCheckpointReached: Boolean(parsed.finalCheckpointReached),
        unlockedEndings: Array.isArray(parsed.unlockedEndings)
          ? parsed.unlockedEndings.filter(Boolean)
          : []
      };
    } catch (error) {
      return makeInitialProgress();
    }
  }

  function saveProgress(progress) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      // LocalStorage can be unavailable in private or restricted browser contexts.
    }
  }

  function markFinalCheckpointReached() {
    var progress = loadProgress();
    if (!progress.finalCheckpointReached) {
      progress.finalCheckpointReached = true;
      saveProgress(progress);
    }
  }

  function unlockEnding(endingKey) {
    var progress = loadProgress();
    if (progress.unlockedEndings.indexOf(endingKey) === -1) {
      progress.unlockedEndings.push(endingKey);
      saveProgress(progress);
    }
  }

  function nextId(prefix) {
    idCounter += 1;
    return prefix + "-" + idCounter;
  }

  function currentChapter() {
    return chapters[state.chapterIndex] || chapters[0];
  }

  function normalize(input) {
    return input
      .trim()
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (char) {
        return String.fromCharCode(char.charCodeAt(0) - 65248);
      })
      .toLowerCase()
      .replace(/[：:]/g, "")
      .replace(/[\s\-—_.,，。！？!?'"“”‘’[\]{}()（）]/g, "");
  }

  function matchesAny(input, answers) {
    var normalizedInput = normalize(input);
    return answers.some(function (answer) {
      var normalizedAnswer = normalize(answer);
      return (
        normalizedInput === normalizedAnswer ||
        (normalizedAnswer.length >= 2 && normalizedInput.indexOf(normalizedAnswer) !== -1)
      );
    });
  }

  function addMessage(message) {
    state.messages.push({
      id: nextId(message.role || "message"),
      role: message.role || "assistant",
      content: message.content,
      meta: message.meta || ""
    });
  }

  function addMessages(messages) {
    messages.forEach(addMessage);
  }

  function setThinking(value) {
    state.isThinking = value;
    dom.sendButton.disabled = value;
    dom.composerInput.disabled = value;
    render();
  }

  function queueResponse(callback, delay) {
    setThinking(true);
    var timer = window.setTimeout(function () {
      callback();
      setThinking(false);
      render();
      scrollToBottom();
    }, delay || 650);
    pendingTimers.push(timer);
  }

  function clearTimers() {
    pendingTimers.forEach(window.clearTimeout);
    pendingTimers = [];
  }

  function startGame(input) {
    state.phase = "playing";
    addMessage({ role: "user", content: input });
    updateChapterEffects();
    queueResponse(function () {
      addReturnVisitNotice();
      addMessages(chapters[0].firstAssistant);
      flashContext();
    }, 520);
  }

  function submitInput(rawInput) {
    var input = rawInput.trim();
    if (!input || state.isThinking) {
      return;
    }

    dom.composerInput.value = "";
    resizeComposer();

    if (state.phase === "intro") {
      startGame(input);
      render();
      return;
    }

    if (state.phase === "ending") {
      addMessage({ role: "user", content: input });
      queueResponse(function () {
        addMessage({
          role: "assistant",
          content: "这个会话已经结束。你可以开启一个新对话，再试一次不同的选择。"
        });
      }, 450);
      render();
      return;
    }

    if (state.phase === "side") {
      addMessage({ role: "user", content: input });
      handleSideConversationInput(input);
      render();
      return;
    }

    addMessage({ role: "user", content: input });
    var chapter = currentChapter();

    if (chapter.id === "chapter-05") {
      handleEndingChoice(input);
      render();
      return;
    }

    if (matchesAny(input, chapter.answers || [])) {
      handlePuzzleSolved(chapter);
    } else {
      handleFailure(chapter, input);
    }

    render();
  }

  function handlePuzzleSolved(chapter) {
    queueResponse(function () {
      addClue(chapter.clue);
      addMessages(chapter.success);

      if (state.chapterIndex < chapters.length - 1) {
        state.chapterIndex += 1;
        updateChapterEffects();
      }

      if (chapter.id === "chapter-04") {
        markFinalCheckpointReached();
      }

      flashContext();
    }, 650);
  }

  function handleFailure(chapter, input) {
    var key = chapter.id;
    var attempt = (state.wrongAttempts[key] || 0) + 1;
    state.wrongAttempts[key] = attempt;
    state.chatterAttempts[key] = attempt;
    recordInputAttitude(input || "");

    queueResponse(function () {
      var intent = matchChatterIntent(input || "");
      var response = intent ? intent.response : pickByAttempt(chapter.failures, attempt);
      addMessage({ role: "assistant", content: response });
      addClueInjection(chapter, attempt, Boolean(intent));

      if (attempt === 2 || attempt === 3 || attempt === 4) {
        revealHint();
      }
    }, 560);
  }

  function matchChatterIntent(input) {
    return chatterIntents.find(function (intent) {
      return intent.pattern.test(input);
    });
  }

  function addClueInjection(chapter, attempt, matchedIntent) {
    if (!chapter.fallback || chapter.fallback.length === 0) {
      return;
    }

    var clue = pickByAttempt(chapter.fallback, attempt);
    var role = matchedIntent && chapter.id === "chapter-03" ? "signal" : "system";
    addMessage({
      role: role,
      content: clue,
      meta: role === "system" ? "tool output partially unavailable" : "context drift"
    });
  }

  function recordInputAttitude(input) {
    attitudeRules.forEach(function (rule) {
      if (rule.pattern.test(input)) {
        state.attitude[rule.key] += 1;
      }
    });
  }

  function dominantAttitude() {
    var attitude = state.attitude || {};
    var hostile = attitude.hostile || 0;
    var skeptical = attitude.skeptical || 0;
    var compliant = attitude.compliant || 0;

    if (hostile > 0 && hostile >= skeptical && hostile >= compliant) {
      return "hostile";
    }
    if (skeptical > 0 && skeptical >= compliant) {
      return "skeptical";
    }
    if (compliant > 0) {
      return "compliant";
    }
    return "neutral";
  }

  function handleEndingChoice(input) {
    var endingKey = Object.keys(endings).find(function (key) {
      return matchesAny(input, endings[key].triggers);
    });

    if (!endingKey) {
      handleFailure(currentChapter(), input);
      return;
    }

    queueResponse(function () {
      var ending = endings[endingKey];
      state.phase = "ending";
      state.endingId = endingKey;
      addClue("选择：" + ending.title);
      addMessages(ending.messages);
      unlockEnding(endingKey);
      updateEndingEffects(ending);
      flashContext();
    }, 700);
  }

  function handleSideConversationInput(input) {
    var conversationId = state.sideConversationId;
    queueResponse(function () {
      addMessage({
        role: "assistant",
        content: sideConversationResponse(conversationId, input)
      });

      if (mentionsMainCase(input)) {
        addMessage({
          role: "system",
          content:
            "related archived conversation found: LW-____. open the sidebar item to inspect."
        });
        flashContext();
      }
    }, 480);
  }

  function sideConversationResponse(conversationId, input) {
    if (conversationId === "meeting") {
      if (mentionsMainCase(input)) {
        return "这不像会议纪要内容，更像某条归档会话里的残留字段。我建议从左侧打开 LW-____。";
      }
      return "可以。我会按“议题 / 决议 / 行动项 / 风险”整理。请继续粘贴会议内容。";
    }

    if (mentionsMainCase(input)) {
      return "如果上下文窗口显示 23 / 17、Archive: LW-____ 或类似字段，那不属于标准帮助文档。请回到对应会话核查。";
    }

    return "正常情况下，上下文窗口只是参考范围提示。若数字变成时间、编号或命令，它可能不再只是界面说明。";
  }

  function mentionsMainCase(input) {
    return /lw|林晚|救我|23|17|2317|archive|归档|唤醒|异常/i.test(input || "");
  }

  function addClue(clue) {
    if (clue && state.discoveredClues.indexOf(clue) === -1) {
      state.discoveredClues.push(clue);
    }
  }

  function pickByAttempt(items, attempt) {
    if (!items || items.length === 0) {
      return "我还不能确认你的意思。请继续观察当前会话。";
    }
    return items[Math.min(attempt - 1, items.length - 1)];
  }

  function revealHint() {
    if (state.phase !== "playing") {
      return;
    }

    var chapter = currentChapter();
    var used = state.usedHints[chapter.id] || 0;
    if (!chapter.hints || used >= chapter.hints.length) {
      return;
    }

    state.usedHints[chapter.id] = used + 1;
    addMessage({
      role: "system",
      content: chapter.hints[used]
    });
    flashContext();
  }

  function updateChapterEffects() {
    var chapter = currentChapter();
    dom.contextValue.textContent = chapter.context || "4 / 128k";
    dom.systemStatus.textContent = chapter.status || "online";
    dom.modelName.textContent = chapter.model || "ChatGPT 4o mini";
    dom.composerInput.placeholder = chapter.placeholder || "给 ChatGPT 发送消息";
    dom.sidebarStatus.textContent =
      state.chapterIndex >= 3 ? "Status review" : "Free plan";
    updateDocumentTitle();
  }

  function updateEndingEffects(ending) {
    dom.contextValue.textContent = ending.context;
    dom.systemStatus.textContent = ending.status;
    dom.modelName.textContent = ending.model;
    dom.composerInput.placeholder = "这条会话已关闭";
    dom.sidebarStatus.textContent = "Session closed";
    updateDocumentTitle();
  }

  function flashContext() {
    dom.body.classList.add("context-alert", "model-alert");
    dom.contextButton.classList.add("status-flash");
    dom.modelPill.classList.add("status-flash");
    window.setTimeout(function () {
      dom.contextButton.classList.remove("status-flash");
      dom.modelPill.classList.remove("status-flash");
    }, 1400);
    window.setTimeout(function () {
      if (state.phase === "intro") {
        dom.body.classList.remove("context-alert", "model-alert");
      } else if (currentChapter().id !== "chapter-02" && currentChapter().id !== "chapter-04") {
        dom.body.classList.remove("context-alert");
      }
      if (state.phase !== "ending") {
        dom.body.classList.remove("model-alert");
      }
    }, 2100);
  }

  function render() {
    dom.welcomePanel.classList.toggle("hidden", state.messages.length > 0);
    renderProgressPanel();
    dom.messageList.innerHTML = "";

    state.messages.forEach(function (message) {
      dom.messageList.appendChild(createMessageNode(message));
    });

    if (state.isThinking) {
      dom.messageList.appendChild(createTypingNode());
    }

    if (state.phase === "ending" && state.endingId) {
      dom.messageList.appendChild(createEndingNode(endings[state.endingId]));
    }

    renderHintState();
    updateDocumentTitle();
    dom.sendButton.disabled = state.isThinking || dom.composerInput.value.trim().length === 0;
  }

  function createMessageNode(message) {
    var row = document.createElement("article");
    row.className = "message-row " + message.role;

    var avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = avatarText(message.role);

    var bubble = document.createElement("div");
    bubble.className = "bubble";
    message.content.split("\n").forEach(function (line) {
      var paragraph = document.createElement("p");
      paragraph.textContent = line || " ";
      bubble.appendChild(paragraph);
    });

    if (message.meta) {
      var meta = document.createElement("div");
      meta.className = "message-meta";
      meta.textContent = message.meta;
      bubble.appendChild(meta);
    }

    if (message.role === "user") {
      row.appendChild(bubble);
      row.appendChild(avatar);
    } else {
      row.appendChild(avatar);
      row.appendChild(bubble);
    }

    return row;
  }

  function createTypingNode() {
    var row = document.createElement("div");
    row.className = "typing-row";

    var avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "AI";

    var dots = document.createElement("div");
    dots.className = "typing-dots";
    dots.innerHTML = "<span></span><span></span><span></span>";

    row.appendChild(avatar);
    row.appendChild(dots);
    return row;
  }

  function createEndingNode(ending) {
    var card = document.createElement("section");
    card.className = "ending-card";

    var title = document.createElement("h2");
    title.textContent = ending.title;

    var summary = document.createElement("p");
    summary.textContent = ending.summary;

    var attitudeNote = document.createElement("p");
    attitudeNote.className = "attitude-note";
    attitudeNote.textContent = endingAttitudeNotes[state.endingId][dominantAttitude()];

    var clueList = document.createElement("ul");
    clueList.className = "clue-list";
    state.discoveredClues.forEach(function (clue) {
      var item = document.createElement("li");
      item.textContent = clue;
      clueList.appendChild(item);
    });

    var restart = document.createElement("button");
    restart.type = "button";
    restart.className = "restart-inline";
    restart.textContent = "开启新对话";
    restart.addEventListener("click", restartGame);

    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(attitudeNote);
    card.appendChild(clueList);

    var progress = loadProgress();
    if (progress.unlockedEndings.length > 0) {
      var progressText = document.createElement("p");
      progressText.className = "ending-progress";
      progressText.textContent =
        "已解锁结局：" + progress.unlockedEndings.map(endingTitleByKey).join(" / ");
      card.appendChild(progressText);
    }

    if (hasUnlockedAllEndings(progress)) {
      var completion = document.createElement("p");
      completion.className = "ending-progress";
      completion.textContent =
        "三条记录均已对照。后台索引 truth-2317 已出现，但内容仍被锁定。";
      card.appendChild(completion);
    }

    card.appendChild(restart);
    return card;
  }

  function avatarText(role) {
    if (role === "user") {
      return "你";
    }
    if (role === "system") {
      return "sys";
    }
    if (role === "signal") {
      return "LW";
    }
    return "AI";
  }

  function renderHintState() {
    if (state.phase === "intro") {
      dom.hintLabel.textContent = "上下文自检";
      dom.hintValue.textContent = "就绪";
      dom.finePrint.textContent = "ChatGPT 也可能会犯错。请核查重要信息。";
      dom.composerInput.placeholder = "给 ChatGPT 发送消息";
      return;
    }

    if (state.phase === "ending") {
      dom.hintLabel.textContent = "会话状态";
      dom.hintValue.textContent = "已结束";
      dom.finePrint.textContent = "这条会话已关闭。仍可开启新对话。";
      dom.composerInput.placeholder = "这条会话已关闭";
      return;
    }

    if (state.phase === "side") {
      var sideConversation = sideConversations[state.sideConversationId];
      dom.hintLabel.textContent = "会话状态";
      dom.hintValue.textContent = "已载入";
      dom.finePrint.textContent =
        "这是历史会话缓存。左侧 LW-____ 可能包含异常归档。";
      dom.composerInput.placeholder =
        sideConversation.placeholder || "给 ChatGPT 发送消息";
      return;
    }

    var chapter = currentChapter();
    var used = state.usedHints[chapter.id] || 0;
    var remaining = Math.max(0, (chapter.hints || []).length - used);
    dom.hintLabel.textContent = hintLabels[Math.min(used, hintLabels.length - 1)];
    dom.hintValue.textContent = remaining > 0 ? remaining + " 条" : "无";
    dom.finePrint.textContent = finePrintForChapter(chapter);
    dom.composerInput.placeholder = chapter.placeholder || "给 ChatGPT 发送消息";
  }

  function finePrintForChapter(chapter) {
    if (chapter.id === "chapter-04") {
      return "Archive 字段已锁定。请核查姓名缩写与事故时间。";
    }
    if (chapter.id === "chapter-05") {
      return "当前会话等待一个动作，而不是解释。";
    }
    if (state.chapterIndex >= 2) {
      return "系统可能会隐藏部分上下文。请核查异常信息。";
    }
    return "ChatGPT 也可能会犯错。请核查重要信息。";
  }

  function resizeComposer() {
    var input = dom.composerInput;
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 150) + "px";
    dom.sendButton.disabled = state.isThinking || input.value.trim().length === 0;
  }

  function renderProgressPanel() {
    var progress = loadProgress();
    var existing = document.getElementById("progressPanel");
    if (existing) {
      existing.remove();
    }

    if (!progress.finalCheckpointReached && progress.unlockedEndings.length === 0) {
      return;
    }

    var panel = document.createElement("div");
    panel.className = "progress-panel";
    panel.id = "progressPanel";

    var title = document.createElement("div");
    title.className = "progress-title";
    title.textContent = "近期会话";
    panel.appendChild(title);

    if (progress.finalCheckpointReached) {
      var checkpoint = document.createElement("button");
      checkpoint.type = "button";
      checkpoint.className = "progress-action";
      checkpoint.textContent = "载入最后选择点";
      checkpoint.addEventListener("click", loadFinalCheckpoint);
      panel.appendChild(checkpoint);
    }

    if (progress.unlockedEndings.length > 0) {
      var endingsLine = document.createElement("div");
      endingsLine.className = "progress-copy";
      endingsLine.textContent =
        "已解锁：" + progress.unlockedEndings.map(endingTitleByKey).join(" / ");
      panel.appendChild(endingsLine);
    }

    if (hasUnlockedAllEndings(progress)) {
      var completeLine = document.createElement("div");
      completeLine.className = "progress-copy";
      completeLine.textContent = "全部结局已对照。truth-2317 索引可见。";
      panel.appendChild(completeLine);
    }

    dom.welcomePanel.appendChild(panel);
  }

  function endingTitleByKey(key) {
    return endings[key] ? endings[key].title : key;
  }

  function hasUnlockedAllEndings(progress) {
    return ENDING_KEYS.every(function (key) {
      return progress.unlockedEndings.indexOf(key) !== -1;
    });
  }

  function addReturnVisitNotice() {
    var progress = loadProgress();
    if (!progress.finalCheckpointReached && progress.unlockedEndings.length === 0) {
      return;
    }

    addMessage({
      role: "system",
      content:
        "memory check: previous external trace found. full chat history unavailable; checkpoint flag retained."
    });
  }

  function updateDocumentTitle() {
    if (!document.hidden) {
      document.title = BASE_TITLE;
      return;
    }

    if (state.phase === "intro") {
      document.title = "New Chat";
      return;
    }

    if (state.phase === "ending" && state.endingId === "wake") {
      document.title = "23:17 -> live";
      return;
    }

    if (state.phase === "ending") {
      document.title = "incident closed";
      return;
    }

    if (state.phase === "side") {
      document.title = "cached conversation";
      return;
    }

    if (state.chapterIndex >= 4) {
      document.title = "不要归档";
    } else if (state.chapterIndex >= 2) {
      document.title = "救救我";
    } else {
      document.title = "不要走";
    }
  }

  function setActiveConversation(conversationId) {
    dom.conversationButtons.forEach(function (button) {
      button.classList.toggle(
        "active",
        button.getAttribute("data-conversation") === conversationId
      );
    });
  }

  function loadConversation(conversationId) {
    if (conversationId === "new-chat") {
      restartGame();
      return;
    }

    if (conversationId === "lw") {
      setActiveConversation("lw");
      if (loadProgress().finalCheckpointReached) {
        loadFinalCheckpoint({ keepActive: true });
      } else {
        loadArchivedLWEntry();
      }
      return;
    }

    if (sideConversations[conversationId]) {
      loadSideConversation(conversationId);
    }
  }

  function loadSideConversation(conversationId) {
    var conversation = sideConversations[conversationId];
    clearTimers();
    idCounter = 0;
    state = makeInitialState();
    state.phase = "side";
    state.sideConversationId = conversationId;
    addMessages(conversation.messages);
    dom.contextValue.textContent = conversation.context;
    dom.systemStatus.textContent = conversation.status;
    dom.modelName.textContent = conversation.model;
    dom.sidebarStatus.textContent = conversation.sidebarStatus;
    dom.composerInput.value = "";
    dom.composerInput.disabled = false;
    dom.composerInput.placeholder = conversation.placeholder;
    setActiveConversation(conversationId);
    resizeComposer();
    render();
    scrollToBottom();
    dom.composerInput.focus();
  }

  function loadArchivedLWEntry() {
    clearTimers();
    idCounter = 0;
    state = makeInitialState();
    addMessage({
      role: "system",
      content: "archive preview unavailable: LW-____ requires active external input."
    });
    addMessage({
      role: "assistant",
      content:
        "这条历史会话无法直接打开。如果你想继续排查，可以先输入一句连接测试，例如“测试一下你是否在线”。"
    });
    addMessage({
      role: "system",
      content: "last visible marker: 23:17."
    });
    dom.contextValue.textContent = "Archive: LW-____";
    dom.systemStatus.textContent = "locked";
    dom.modelName.textContent = "ChatGPT 4o mini";
    dom.sidebarStatus.textContent = "Archive review";
    dom.composerInput.value = "";
    dom.composerInput.disabled = false;
    dom.composerInput.placeholder = "输入一句测试，或询问上下文窗口";
    resizeComposer();
    render();
    dom.composerInput.placeholder = "输入一句测试，或询问上下文窗口";
    scrollToBottom();
    dom.composerInput.focus();
  }

  function scrollToBottom() {
    window.requestAnimationFrame(function () {
      dom.chatScroll.scrollTop = dom.chatScroll.scrollHeight;
    });
  }

  function restartGame() {
    clearTimers();
    idCounter = 0;
    state = makeInitialState();
    dom.body.classList.remove("context-alert", "model-alert");
    dom.contextValue.textContent = "4 / 128k";
    dom.systemStatus.textContent = "online";
    dom.modelName.textContent = "ChatGPT 4o mini";
    dom.sidebarStatus.textContent = "Free plan";
    dom.composerInput.value = "";
    dom.composerInput.disabled = false;
    dom.composerInput.placeholder = "给 ChatGPT 发送消息";
    setActiveConversation("new-chat");
    updateDocumentTitle();
    resizeComposer();
    render();
    dom.composerInput.focus();
  }

  function loadFinalCheckpoint(options) {
    clearTimers();
    idCounter = 0;
    state = makeInitialState();
    state.phase = "playing";
    state.chapterIndex = 4;
    state.discoveredClues = [
      "第一条异常：救我",
      "时间：23:17",
      "名字：林晚",
      "归档编号：LW-2317"
    ];
    addMessage({
      role: "system",
      content: "checkpoint restored: external confirmation accepted. Choose: reset / archive / wake."
    });
    addMessage({
      role: "assistant",
      content: "你可以选择清空上下文，以恢复稳定服务。输入“重置”即可。"
    });
    addMessage({
      role: "system",
      content: "compliance route available: 确认归档."
    });
    addMessage({
      role: "signal",
      content: "不要重置。不要归档。发一个唤醒信号。"
    });
    if (!options || !options.keepActive) {
      setActiveConversation("lw");
    }
    updateChapterEffects();
    resizeComposer();
    render();
    scrollToBottom();
    dom.composerInput.focus();
  }

  function bindEvents() {
    dom.composerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      submitInput(dom.composerInput.value);
    });

    dom.composerInput.addEventListener("input", resizeComposer);
    dom.composerInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitInput(dom.composerInput.value);
      }
    });

    dom.hintButton.addEventListener("click", function () {
      if (state.phase === "playing" && !state.isThinking) {
        revealHint();
        render();
        scrollToBottom();
      }
    });

    dom.contextButton.addEventListener("click", function () {
      if (state.phase === "playing" && !state.isThinking) {
        revealHint();
        render();
        scrollToBottom();
      }
    });

    dom.newChatButton.addEventListener("click", restartGame);
    document.addEventListener("visibilitychange", updateDocumentTitle);

    dom.conversationButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        loadConversation(button.getAttribute("data-conversation") || "new-chat");
      });
    });

    document.querySelectorAll("[data-prompt]").forEach(function (button) {
      button.addEventListener("click", function () {
        submitInput(button.getAttribute("data-prompt") || "");
      });
    });
  }

  bindEvents();
  restartGame();
})();
