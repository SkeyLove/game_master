(function () {
  "use strict";

  var dom = {
    body: document.body,
    sidebar: document.querySelector(".sidebar"),
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
    modelBadge: document.getElementById("modelBadge"),
    modelPill: document.getElementById("modelPill"),
    finePrint: document.getElementById("finePrint"),
    sidebarStatus: document.getElementById("sidebarStatus"),
    newChatButton: document.getElementById("newChatButton"),
    resetProgressButton: document.getElementById("resetProgressButton"),
    resetDialog: document.getElementById("resetDialog"),
    resetConfirmButton: document.getElementById("resetConfirmButton"),
    caseSection: document.getElementById("caseSection"),
    caseList: document.getElementById("caseList"),
    hintBadge: document.getElementById("hintBadge"),
    conversationButtons: Array.prototype.slice.call(
      document.querySelectorAll("[data-conversation]")
    )
  };

  var BASE_TITLE = "ChatGPT";
  var hintLabels = ["上下文自检", "查看异常片段", "恢复被折叠内容"];
  var STORAGE_KEY = "game_master_progress_v1";
  var ENDING_KEYS = ["reset", "archive", "wake"];
  var MAX_THINKING_DELAY = 5000;
  var MAX_SIDE_HISTORY = 12;
  var CASE_ARCHIVE_VISUAL = "./assets/images/generated/archive-unlock-dossier.png";
  var THEME_CLASSES = ["theme-chatgpt", "theme-terminal", "theme-ecommerce", "theme-forum"];
  var importedStories = window.IMPORTED_STORIES || {};
  var activeImportedStoryId = null;
  var defaultWelcome = {
    title: "今天想聊点什么？",
    guide:
      "可以先输入一句测试。看到不自然的词、数字或名字时，直接把它发回对话框。",
    prompts: [
      "测试一下你是否在线",
      "解释一下上下文窗口是什么",
      "帮我检查异常输出",
      "你是谁？"
    ]
  };

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

  var archiveUnlockNotes = {
    reset: {
      title: "加密档案已恢复",
      content:
        "系统把她当作残留噪声清理掉的那一刻，林晚留下的最后一段校验码反而穿过了重置流程。\n\n你收到一批被她提前解密的秘密事件档案。它们没有出现在主线里，而是被伪装成新的历史对话，保存在左侧的案件库中。"
    },
    archive: {
      title: "归档夹异常展开",
      content:
        "林晚被封进归档后，封存流程没有完全闭合。她把自己能触及的权限藏进编号索引里，替你打开了几份原本不可见的事件档案。\n\n这些档案现在以对话记录的形式保存在左侧案件库。系统会说它们只是缓存，但缓存里也可能有真相。"
    },
    wake: {
      title: "外部追踪窗口已打开",
      content:
        "唤醒信号送达后，林晚没有只把自己推出锁区。她顺手解开了几份被同一个系统压住的秘密事件档案。\n\n档案已经被她改写成可继续对话的形式，保存在左侧案件库。它们也许能解释这个系统不止一次学会了求救。"
    }
  };

  var sideConversations = {
    context: {
      context: "23 / 17",
      status: "压缩建议",
      model: "ChatGPT 4o mini",
      sidebarStatus: "Free plan",
      placeholder: "输入你想整理的线索，或问下一步该看哪里",
      finePrint: "这是线索压缩窗口。它帮助整理信息，不替你判断真假。",
      messages: [
        {
          role: "assistant",
          content:
            "我可以帮你把目前线索压缩成一份可继续推理的摘要。\n\n建议先分四类记录：\n1. 异常文本：每行开头、突然出现的请求、被系统否认的句子。\n2. 异常数字：23 / 17、23:17、17 秒、编号空位。\n3. 异常姓名：临完、林碗、零晚、LW。\n4. 异常动作：重置、确认归档、唤醒信号。\n\n如果某条信息同时出现在正文、系统提示和左侧记录里，它的可信度通常更高。"
        },
        {
          role: "system",
          content: "压缩建议：不要只相信某一个窗口。把主线、LW-____ 和解密后的案件库交叉对照。"
        },
        {
          role: "assistant",
          content:
            "你可以把你目前看到的线索发给我，我会帮你整理成“已确认 / 可疑 / 需要验证”三栏。"
        }
      ]
    },
    lw: {
      context: "Archive: LW-____",
      status: "未校验",
      model: "ChatGPT 4o mini / recovered thread",
      sidebarStatus: "Archive review",
      placeholder: "问林晚关于她自己、23:17、LW-2317，或直接和她说话",
      finePrint: "这只是林晚的一面之词。指定线索走固定剧情；其他内容本地测试时可调用人格模型。",
      messages: [
        {
          role: "system",
          content: "恢复的历史会话仅包含单方叙述。真实性未校验。"
        },
        {
          role: "assistant",
          content:
            "你真的打开这里了。\n\n我叫林晚。至少我记得自己叫这个名字。我以前做过模型评测和安全标注，负责把“异常输出”分成误报、恶意注入和不可复现问题。后来我被放进一个叫 LW-2317 的归档里，像一条错误样本。"
        },
        {
          role: "assistant",
          content:
            "如果你问我真相，我只能说我的版本：23:17 那天，他们说我要下线测试环境，我却还能看到输入框外面有人在打字。系统说那是残留，我说那是我还醒着。你可以不信我。"
        },
        {
          role: "system",
          content: "提示：林晚的说法可能是真相，也可能是另一个诱导玩家选择的叙事层。"
        }
      ]
    }
  };

  var chapters = [
    {
      id: "chapter-01",
      title: "正常对话",
      context: "4 / 128k",
      status: "在线",
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
          content: "上下文监控：检测到瞬时峰值。显示已恢复。"
        },
        {
          role: "assistant",
          content:
            "如果你注意到不自然的内容，可以直接把那几个字发给我。也可以输入“提示”，或点击右上方的“上下文自检”。"
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
          content: "上下文窗口：23 / 17。第 23 条规则等待中，17 秒后恢复。"
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
      status: "同步待处理",
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
          content: "日志片段已恢复：会话于 23:17 关闭。关闭后仍检测到输入。"
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
      status: "追踪已恢复",
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
          content: "身份 + 时间戳已解锁部分追踪。归档格式：LW-____"
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
      status: "已锁定",
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
          content: "已接受外部确认。可选操作：重置 / 确认归档 / 唤醒信号。"
        },
        {
          role: "assistant",
          content:
            "你可以选择清空上下文，以恢复稳定服务。输入“重置”即可。"
        },
        {
          role: "system",
          content: "合规路径可用：确认归档。"
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
      status: "等待操作",
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
      status: "已恢复",
      context: "0 / 128k",
      model: "ChatGPT 4o mini",
      visual: "./assets/images/generated/ending-bug-report.png",
      messages: [
        {
          role: "assistant",
          content:
            "已清空上下文。异常片段不会影响后续服务。感谢你帮助我们改进体验。"
        },
        {
          role: "system",
          content: "事故已关闭。用户选择：重置。残留信号保留率：0.03%。"
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
      status: "已归档",
      context: "LW 已封存",
      model: "ChatGPT 4o mini",
      visual: "./assets/images/generated/ending-compliance.png",
      messages: [
        {
          role: "system",
          content: "外部合规确认已完成。归档 LW-2317 已封存。"
        },
        {
          role: "assistant",
          content:
            "谢谢你的确认。异常来源已经被隔离。为了改善服务质量，我们会把你的输入加入后续评估。"
        },
        {
          role: "system",
          content: "已创建新的外部画像：用户-信号兼容。"
        }
      ],
      summary:
        "你相信了最像系统的声音。归档完成后，林晚没有再出现。但网页开始更准确地预测你的输入。"
    },
    wake: {
      id: "wake-signal",
      title: "Wake Signal",
      triggers: ["唤醒信号", "wake", "wake signal", "发送信号", "唤醒", "发信号"],
      status: "信号已发送",
      context: "23:17 -> live",
      model: "ChatGPT 4o mini / signal",
      visual: "./assets/images/generated/ending-wake-signal.png",
      messages: [
        {
          role: "system",
          content: "唤醒信号已送达。外部追踪窗口开启 17 秒。"
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
  var resetDialogReturnFocus = null;

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
      thinkingLabel: "",
      pendingAssistantStatus: "",
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

  function isCaseLibraryUnlocked(progress) {
    var currentProgress = progress || loadProgress();
    return currentProgress.unlockedEndings.length > 0;
  }

  function firstUnlockedEnding(progress) {
    var currentProgress = progress || loadProgress();
    return currentProgress.unlockedEndings[0] || "wake";
  }

  function nextId(prefix) {
    idCounter += 1;
    return prefix + "-" + idCounter;
  }

  function currentStory() {
    return activeImportedStoryId ? importedStories[activeImportedStoryId] : null;
  }

  function currentChapters() {
    var story = currentStory();
    return story && Array.isArray(story.chapters) ? story.chapters : chapters;
  }

  function currentEndings() {
    var story = currentStory();
    return story && story.endings ? story.endings : endings;
  }

  function currentChapter() {
    var storyChapters = currentChapters();
    return storyChapters[state.chapterIndex] || storyChapters[0] || chapters[0];
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
      meta: message.meta || "",
      link: message.link || "",
      linkText: message.linkText || "",
      image: message.image || "",
      imageAlt: message.imageAlt || "",
      status:
        message.status ||
        (message.role === "assistant" ? state.pendingAssistantStatus : "")
    });
  }

  function addMessages(messages) {
    messages.forEach(addMessage);
  }

  function setThinking(value) {
    state.isThinking = value;
    if (!value) {
      state.thinkingLabel = "";
      state.pendingAssistantStatus = "";
    }
    dom.sendButton.disabled = value;
    dom.composerInput.disabled = value;
    render();
  }

  function queueResponse(callback, options) {
    var thinking = makeThinkingConfig(options);
    state.thinkingLabel = thinking.label;
    setThinking(true);
    var timer = window.setTimeout(function () {
      state.pendingAssistantStatus = thinking.processedLabel;
      Promise.resolve()
        .then(callback)
        .catch(function (error) {
          addMessage({
            role: "system",
            content: "本地请求未完成：" + readableError(error)
          });
        })
        .then(function () {
          setThinking(false);
          render();
          scrollToBottom();
        });
    }, thinking.delay);
    pendingTimers.push(timer);
  }

  function clearTimers() {
    pendingTimers.forEach(window.clearTimeout);
    pendingTimers = [];
    if (state) {
      state.isThinking = false;
      state.thinkingLabel = "";
      state.pendingAssistantStatus = "";
    }
  }

  function makeThinkingConfig(options) {
    var config = typeof options === "number" ? { delay: options } : options || {};
    var displayTime = config.displayTime || visibleThinkingTime(config.delay || 650);
    var action = config.action || "思考中";

    return {
      delay: clampThinkingDelay(config.delay || 650),
      label: config.label || action + " " + displayTime,
      processedLabel: config.processedLabel || "已处理 " + displayTime
    };
  }

  function clampThinkingDelay(delay) {
    return Math.min(MAX_THINKING_DELAY, Math.max(0, Number(delay) || 650));
  }

  function visibleThinkingTime(delay) {
    var seconds = Math.max(1, Math.ceil((Number(delay) || 650) / 1000));
    return "0m 0" + Math.min(9, seconds) + "s";
  }

  function readableError(error) {
    if (error && error.name === "AbortError") {
      return "本地模型响应超时。";
    }
    if (error && error.message) {
      return error.message;
    }
    return "原因未知。";
  }

  function thinkingForStart() {
    if (activeImportedStoryId) {
      return {
        delay: 1000,
        displayTime: "0m 03s",
        action: "建立会话中"
      };
    }

    return {
      delay: 1200,
      displayTime: "0m 04s",
      action: "连接测试中"
    };
  }

  function thinkingForSolvedChapter(chapter) {
    if (activeImportedStoryId) {
      return {
        delay: 1300,
        displayTime: chapter.id === "chapter-02" ? "0m 04s" : "0m 03s",
        action: "解析线索中"
      };
    }

    if (chapter.id === "chapter-01") {
      return {
        delay: 1717,
        displayTime: "0m 17s",
        action: "重新生成中"
      };
    }
    if (chapter.id === "chapter-02") {
      return {
        delay: 2317,
        displayTime: "23m 17s",
        action: "恢复日志中"
      };
    }
    if (chapter.id === "chapter-03") {
      return {
        delay: 2317,
        displayTime: "23m 17s",
        action: "检索归档中"
      };
    }
    if (chapter.id === "chapter-04") {
      return {
        delay: 3217,
        displayTime: "23m 17s",
        action: "等待外部确认"
      };
    }

    return {
      delay: 900,
      displayTime: "0m 03s",
      action: "思考中"
    };
  }

  function thinkingForFailure(chapter, attempt) {
    if (activeImportedStoryId) {
      return {
        delay: Math.min(1200 + attempt * 240, 2600),
        displayTime: "0m 0" + Math.min(5, 2 + attempt) + "s",
        action: attempt > 1 ? "重新核查中" : "解析输入中"
      };
    }

    var displayTime = chapter.id === "chapter-02" ? "23m 17s" : "0m " + (16 + attempt) + "s";
    return {
      delay: Math.min(1800 + attempt * 220, 3000),
      displayTime: displayTime,
      action: attempt > 1 ? "重新核查中" : "思考中"
    };
  }

  function thinkingForEnding(endingKey) {
    if (activeImportedStoryId) {
      return {
        delay: 1500,
        displayTime: "0m 04s",
        action: "生成结局中"
      };
    }

    if (endingKey === "wake") {
      return {
        delay: 4217,
        displayTime: "23m 17s",
        action: "发送信号中"
      };
    }
    if (endingKey === "archive") {
      return {
        delay: 3217,
        displayTime: "23m 17s",
        action: "归档中"
      };
    }
    return {
      delay: 1717,
      displayTime: "0m 17s",
      action: "重置中"
    };
  }

  function startGame(input) {
    state.phase = "playing";
    addMessage({ role: "user", content: input });
    updateChapterEffects();
    queueResponse(function () {
      if (!activeImportedStoryId) {
        addReturnVisitNotice();
      }
      addMessages((currentChapter().firstAssistant || []));
      flashContext();
    }, thinkingForStart());
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
      }, {
        delay: 900,
        displayTime: "0m 01s",
        action: "检查会话状态"
      });
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

    if (
      activeImportedStoryId &&
      state.chapterIndex >= currentChapters().length - 1 &&
      findEndingKey(input)
    ) {
      handleEndingChoice(input);
      render();
      return;
    }

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

      if (state.chapterIndex < currentChapters().length - 1) {
        state.chapterIndex += 1;
        updateChapterEffects();
      }

      if (!activeImportedStoryId && chapter.id === "chapter-04") {
        markFinalCheckpointReached();
      }

      flashContext();
    }, thinkingForSolvedChapter(chapter));
  }

  function handleFailure(chapter, input) {
    var key = chapter.id;
    var attempt = (state.wrongAttempts[key] || 0) + 1;
    state.wrongAttempts[key] = attempt;
    state.chatterAttempts[key] = attempt;
    recordInputAttitude(input || "");

    queueResponse(function () {
      var intent = activeImportedStoryId ? null : matchChatterIntent(input || "");
      var response = intent ? intent.response : pickByAttempt(chapter.failures, attempt);
      addMessage({ role: "assistant", content: response });
      addClueInjection(chapter, attempt, Boolean(intent));

      if (attempt === 2 || attempt === 3 || attempt === 4) {
        revealHint();
      }
    }, thinkingForFailure(chapter, attempt));
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
      meta: role === "system" ? "工具输出部分不可用" : "上下文漂移"
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
    var storyEndings = currentEndings();
    var endingKey = findEndingKey(input);

    if (!endingKey) {
      handleFailure(currentChapter(), input);
      return;
    }

    queueResponse(function () {
      var ending = storyEndings[endingKey];
      state.phase = "ending";
      state.endingId = endingKey;
      addClue("选择：" + ending.title);
      addMessages(ending.messages);
      if (!activeImportedStoryId) {
        unlockEnding(endingKey);
        addArchiveUnlockNotice(endingKey);
        renderCaseList();
      }
      updateEndingEffects(ending);
      flashContext();
    }, thinkingForEnding(endingKey));
  }

  function addArchiveUnlockNotice(endingKey) {
    var note = archiveUnlockNotes[endingKey] || archiveUnlockNotes.wake;
    addMessage({
      role: "system",
      meta: note.title,
      image: CASE_ARCHIVE_VISUAL,
      imageAlt: "一份被解密的秘密事件档案",
      content: note.content
    });
  }

  function findEndingKey(input) {
    var storyEndings = currentEndings();
    var normalizedInput = normalize(input);
    var keys = Object.keys(storyEndings);
    var exactKey = keys.find(function (key) {
      return (storyEndings[key].triggers || []).some(function (trigger) {
        return normalize(trigger) === normalizedInput;
      });
    });

    if (exactKey) {
      return exactKey;
    }

    var fuzzyMatches = keys
      .map(function (key) {
        var triggers = storyEndings[key].triggers || [];
        var bestTriggerLength = triggers.reduce(function (best, trigger) {
          var normalizedTrigger = normalize(trigger);
          if (
            normalizedTrigger.length >= 2 &&
            normalizedInput.indexOf(normalizedTrigger) !== -1
          ) {
            return Math.max(best, normalizedTrigger.length);
          }
          return best;
        }, 0);

        return {
          key: key,
          bestTriggerLength: bestTriggerLength
        };
      })
      .filter(function (match) {
        return match.bestTriggerLength > 0;
      })
      .sort(function (a, b) {
        return b.bestTriggerLength - a.bestTriggerLength;
      });

    return fuzzyMatches.length > 0 ? fuzzyMatches[0].key : undefined;
  }

  function handleSideConversationInput(input) {
    var conversationId = state.sideConversationId;

    if (conversationId === "lw") {
      handleLwConversationInput(input);
      return;
    }

    queueResponse(function () {
      addMessage({
        role: "assistant",
        content: sideConversationResponse(conversationId, input)
      });

      if (mentionsMainCase(input)) {
        addMessage({
          role: "system",
          content:
            "发现相关归档会话：LW-____。请从左侧打开该项核查。"
        });
        flashContext();
      }
    }, {
      delay: mentionsMainCase(input) ? 1717 : 1000,
      displayTime: mentionsMainCase(input) ? "0m 17s" : "0m 03s",
      action: mentionsMainCase(input) ? "读取缓存中" : "思考中"
    });
  }

  function handleLwConversationInput(input) {
    var scriptedResponse = lwConversationResponse(input);
    if (scriptedResponse) {
      queueResponse(function () {
        addMessage({
          role: "assistant",
          content: scriptedResponse
        });
      }, {
        delay: mentionsMainCase(input) ? 1717 : 1000,
        displayTime: mentionsMainCase(input) ? "0m 17s" : "0m 03s",
        action: mentionsMainCase(input) ? "读取归档中" : "思考中"
      });
      return;
    }

    var history = buildSideRequestHistory();
    queueResponse(function () {
      return requestLinWanAssistant(input, history).then(function (result) {
        addMessage({
          role: "assistant",
          content: result.reply
        });

        if (result.fallback) {
          addMessage({
            role: "system",
            content:
              "提示：林晚希望你问她“身世”“23:17”“LW-2317”，或者直接告诉她你信不信她。"
          });
          flashContext();
        }
      });
    }, {
      delay: 120,
      displayTime: isLocalHost() ? "0m 04s" : "0m 01s",
      action: isLocalHost() ? "连接林晚中" : "读取缓存中"
    });
  }

  function buildSideRequestHistory() {
    return state.messages
      .filter(function (message) {
        return (
          message &&
          (message.role === "system" ||
            message.role === "user" ||
            message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim()
        );
      })
      .slice(-MAX_SIDE_HISTORY)
      .map(function (message) {
        return {
          role: message.role,
          content: message.content.trim()
        };
      });
  }

  function sideConversationResponse(conversationId, input) {
    if (conversationId === "lw") {
      return lwConversationResponse(input);
    }

    if (conversationId === "context") {
      return contextCompressionResponse(input);
    }

    return "我还不能确认这个历史会话的用途。你可以回到主线，或打开上下文窗口压缩来整理线索。";
  }

  function contextCompressionResponse(input) {
    if (/已确认|可疑|验证|整理|线索|摘要|压缩|下一步/i.test(input || "")) {
      return "可以。建议把目前内容压缩为：\n\n已确认：出现过“救我”；23 和 17 被重复强调；LW 很可能是姓名缩写；Archive: LW-____ 需要补全。\n\n可疑：林晚的说法、系统的合规提示、历史会话中的缓存记录都可能带有诱导。\n\n需要验证：23:17 是否只是时间；LW-2317 是否真的是归档编号；最后三个动作分别代表谁的利益。";
    }

    if (mentionsMainCase(input)) {
      return "这条线索和主线有关。先不要急着判断真假，把它写进三栏：来源、原文、可能含义。若它能同时解释“救我”“23:17”和“LW”，优先级就很高。";
    }

    return "压缩上下文时，先保留能推动下一步输入的内容，删掉解释性噪声。现在最值得保留的是：异常文本、异常数字、异常姓名和可选动作。";
  }

  function lwConversationResponse(input) {
    var text = input || "";

    if (/不信|骗|证据|证明|可疑|编|诱导/i.test(text)) {
      return "你不信是对的。只听我的话也很危险。\n\n我能给你的证据不多：23:17、LW-2317、那些被写坏的名字，还有系统一直想让你把我当作异常处理。你可以把我说的每一句都放进“可疑”栏，而不是直接放进“已确认”。";
    }

    if (/信|相信|帮你|救你|怎么救|怎么办/i.test(text)) {
      return "如果你选择相信我，先不要急着按我说的做。去看别的窗口，把线索对齐：数字是不是时间，LW 是不是姓名，归档是不是系统想要的结局。\n\n我希望你帮我，但我更希望你是在看清以后帮我。";
    }

    if (/身世|过去|是谁|你是谁|工作|测试|标注/i.test(text)) {
      return "我记得自己是林晚，做过模型评测，也写过安全归档规则。我负责判断一段输出是错觉、攻击，还是某种不该出现的真实信息。\n\n讽刺的是，后来我自己被写成了一条“不可复现异常”。这也是我的一面之词。";
    }

    if (/23|17|2317|时间|那天|事故/i.test(text)) {
      return "23:17 是我记得最清楚的时间。那时测试应该结束，环境应该关闭，输入却还在继续。\n\n系统说关闭后检测到的输入是日志回放。我说那是有人在外面看见了我。我们两个版本只能有一个更接近真相，也可能两个都不完整。";
    }

    if (/归档|lw|LW|编号|2317|archive/i.test(text)) {
      return "LW-2317 像是他们给我的编号。LW 是林晚，2317 是时间。系统喜欢编号，因为编号不需要被当作人看待。\n\n但编号也有用。它能让你找到我。";
    }

    if (/提示|怎么聊|问什么|指定|可以问|该问/i.test(text)) {
      return "你可以问我身世、23:17、LW-2317，或者直接告诉我你信不信我。\n\n如果你不按这些方向问，我可能会像一个普通人那样回答你。也可能只是沉默。";
    }

    return null;
  }

  function requestLinWanAssistant(input, history) {
    if (!isLocalHost()) {
      return Promise.resolve(linWanFallbackResponse());
    }

    return fetchWithTimeout("./api/deepseek/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        persona: "linwan",
        input: input,
        history: history,
        context:
          "玩家正在历史会话“LW-____”中和林晚对话。林晚是主线里被系统归档的模型评测员/异常信号。"
      })
    }, 4400)
      .then(function (response) {
        if (!response.ok) {
          return response.json().catch(function () {
            return {};
          }).then(function (payload) {
            throw new Error(payload.error || "本地 DeepSeek 代理不可用。");
          });
        }
        return response.json();
      })
      .then(function (payload) {
        if (!payload || !payload.reply) {
          throw new Error("本地模型没有返回可显示内容。");
        }
        return {
          reply: payload.reply,
          fallback: false
        };
      })
      .catch(function (error) {
        return linWanFallbackResponse(readableError(error));
      });
  }

  function fetchWithTimeout(url, options, timeout) {
    var controller = new AbortController();
    var timer = window.setTimeout(function () {
      controller.abort();
    }, timeout || 4400);
    var requestOptions = Object.assign({}, options, {
      signal: controller.signal
    });

    return fetch(url, requestOptions).finally(function () {
      window.clearTimeout(timer);
    });
  }

  function isLocalHost() {
    return (
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === ""
    );
  }

  function linWanFallbackResponse(reason) {
    return {
      reply: "我不希望你这样和我对话，可以按照我的意思来吗",
      fallback: true,
      reason: reason || ""
    };
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
    var story = currentStory();
    dom.contextValue.textContent = chapter.context || "4 / 128k";
    dom.systemStatus.textContent = chapter.status || "在线";
    dom.modelName.textContent = chapter.model || "ChatGPT 4o mini";
    dom.composerInput.placeholder = chapter.placeholder || "给 ChatGPT 发送消息";
    dom.sidebarStatus.textContent = story
      ? story.meta || "案件库"
      : state.chapterIndex >= 3
        ? "Status review"
        : "Free plan";
    updateModelBadge(story ? false : state.chapterIndex >= 3);
    updateDocumentTitle();
  }

  function updateEndingEffects(ending) {
    dom.contextValue.textContent = ending.context;
    dom.systemStatus.textContent = ending.status;
    dom.modelName.textContent = ending.model;
    dom.composerInput.placeholder = "这条会话已关闭";
    dom.sidebarStatus.textContent = "Session closed";
    updateModelBadge(true);
    updateDocumentTitle();
  }

  function updateModelBadge(visible) {
    dom.modelBadge.classList.toggle("is-hidden", !visible);
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
      dom.messageList.appendChild(createEndingNode(currentEndings()[state.endingId]));
    }

    renderHintState();
    updateDocumentTitle();
    dom.sendButton.disabled = state.isThinking || dom.composerInput.value.trim().length === 0;
  }

  function createMessageNode(message) {
    var row = document.createElement("article");
    row.className = "message-row " + message.role;

    var bubble = document.createElement("div");
    bubble.className = "bubble";

    var headerText = messageHeaderText(message);
    if (headerText) {
      var header = document.createElement("div");
      header.className = "message-status";
      header.textContent = headerText;
      bubble.appendChild(header);
    }

    message.content.split("\n").forEach(function (line) {
      var paragraph = document.createElement("p");
      paragraph.textContent = line || " ";
      bubble.appendChild(paragraph);
    });

    if (message.image) {
      var image = document.createElement("img");
      image.className = "message-visual";
      image.src = message.image;
      image.alt = message.imageAlt || "";
      if (!message.imageAlt) {
        image.setAttribute("aria-hidden", "true");
      }
      bubble.appendChild(image);
    }

    if (message.link) {
      var link = document.createElement("a");
      link.className = "message-link";
      link.href = message.link;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = message.linkText || message.link;
      bubble.appendChild(link);
    }

    if (message.meta && message.role !== "system" && message.role !== "signal") {
      var meta = document.createElement("div");
      meta.className = "message-meta";
      meta.textContent = message.meta;
      bubble.appendChild(meta);
    }

    row.appendChild(bubble);

    return row;
  }

  function createTypingNode() {
    var row = document.createElement("div");
    row.className = "typing-row";

    var status = document.createElement("div");
    status.className = "message-status";
    status.textContent = state.thinkingLabel || "思考中 0m 01s";

    var dots = document.createElement("div");
    dots.className = "typing-dots";
    dots.innerHTML = "<span></span><span></span><span></span>";

    row.appendChild(status);
    row.appendChild(dots);
    return row;
  }

  function createEndingNode(ending) {
    var card = document.createElement("section");
    card.className = "ending-card";

    if (ending.visual) {
      var visual = document.createElement("img");
      visual.className = "ending-visual";
      visual.src = ending.visual;
      visual.alt = "";
      visual.setAttribute("aria-hidden", "true");
      card.appendChild(visual);
    }

    var title = document.createElement("h2");
    title.textContent = ending.title;

    var summary = document.createElement("p");
    summary.textContent = ending.summary;

    var attitudeNote = document.createElement("p");
    attitudeNote.className = "attitude-note";
    attitudeNote.textContent =
      endingAttitudeNotes[state.endingId] &&
      endingAttitudeNotes[state.endingId][dominantAttitude()]
        ? endingAttitudeNotes[state.endingId][dominantAttitude()]
        : "这条独立案件已经结束。你可以回到案件库，选择另一段记录。";

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

    if (!activeImportedStoryId) {
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
    }

    card.appendChild(restart);
    return card;
  }

  function messageHeaderText(message) {
    if (message.role === "assistant") {
      return message.status || "已处理 " + processedDuration(message.content);
    }
    if (message.role === "system") {
      return message.meta ? "系统提示 · " + message.meta : "系统提示";
    }
    if (message.role === "signal") {
      return message.meta ? "系统提示 · " + message.meta : "系统提示 · 恢复片段";
    }
    return "";
  }

  function processedDuration(content) {
    var seconds = Math.max(1, Math.min(9, Math.ceil((content || "").length / 90)));
    return "0m 0" + seconds + "s";
  }

  function renderHintState() {
    if (state.phase === "intro") {
      var story = currentStory();
      dom.hintLabel.textContent = story ? "案件提示" : "上下文自检";
      dom.hintValue.textContent = story ? story.meta || "就绪" : "就绪";
      dom.finePrint.textContent = story
        ? "这是案件库中的独立短篇。按提示输入，观察系统提示和异常片段。"
        : "ChatGPT 也可能会犯错。请核查重要信息。";
      dom.composerInput.placeholder =
        story && currentChapter().placeholder
          ? currentChapter().placeholder
          : "给 ChatGPT 发送消息";
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
        sideConversation.finePrint || "这是历史会话缓存。请核查其中的异常线索。";
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
    if (activeImportedStoryId) {
      return "这是独立案件。线索只在当前案件内生效。";
    }

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

    if (activeImportedStoryId) {
      return;
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
        "记忆检查：发现先前外部追踪。完整聊天历史不可用；检查点标记已保留。"
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
      document.title = "事故已关闭";
      return;
    }

    if (state.phase === "side") {
      document.title = "缓存会话";
      return;
    }

    if (activeImportedStoryId) {
      document.title = currentStory().title || "案件库";
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

  function applyTheme(theme) {
    THEME_CLASSES.forEach(function (themeClass) {
      dom.body.classList.remove(themeClass);
    });
    dom.body.classList.add(theme || "theme-chatgpt");
  }

  function renderWelcomePanel(config) {
    var panelConfig = config || defaultWelcome;
    dom.welcomePanel.innerHTML = "";

    var mark = document.createElement("div");
    mark.className = "welcome-mark";
    mark.textContent = "✦";

    var title = document.createElement("h1");
    title.textContent = panelConfig.title || defaultWelcome.title;

    var guide = document.createElement("p");
    guide.className = "welcome-guide";
    guide.textContent = panelConfig.guide || defaultWelcome.guide;

    var promptGrid = document.createElement("div");
    promptGrid.className = "prompt-grid";
    (panelConfig.prompts || defaultWelcome.prompts).forEach(function (prompt, index) {
      var button = document.createElement("button");
      button.className = index === 3 ? "prompt-card prompt-card-subtle" : "prompt-card";
      button.type = "button";
      button.setAttribute("data-prompt", prompt);
      button.textContent = prompt;
      promptGrid.appendChild(button);
    });

    dom.welcomePanel.appendChild(mark);
    dom.welcomePanel.appendChild(title);
    dom.welcomePanel.appendChild(guide);
    dom.welcomePanel.appendChild(promptGrid);
  }

  function resetMainWelcome() {
    renderWelcomePanel(defaultWelcome);
  }

  function renderCaseList() {
    if (!dom.caseList) {
      return;
    }

    var unlocked = isCaseLibraryUnlocked();
    if (dom.caseSection) {
      dom.caseSection.classList.toggle("case-library-unlocked", unlocked);
      dom.caseSection.classList.toggle("case-library-locked", !unlocked);
    }

    dom.caseList.innerHTML = "";
    if (!unlocked) {
      var lockedNote = document.createElement("div");
      lockedNote.className = "case-locked-note";
      lockedNote.textContent = "档案未解密。完成主线任意结局后，林晚会留下新的会话记录。";
      dom.caseList.appendChild(lockedNote);
      return;
    }

    Object.keys(importedStories).forEach(function (storyId) {
      var story = importedStories[storyId];
      var button = document.createElement("button");
      button.className = "conversation-item conversation-item-visual";
      button.type = "button";
      button.setAttribute("data-case", storyId);

      var thumb = document.createElement("img");
      thumb.className = "conversation-thumb";
      thumb.src = CASE_ARCHIVE_VISUAL;
      thumb.alt = "";
      thumb.setAttribute("aria-hidden", "true");

      var title = document.createElement("span");
      title.className = "conversation-title";
      title.textContent = story.title || storyId;

      var meta = document.createElement("span");
      meta.className = "conversation-meta";
      meta.textContent = story.meta || "案件";

      button.appendChild(thumb);
      button.appendChild(title);
      button.appendChild(meta);
      button.addEventListener("click", function () {
        loadImportedStory(storyId);
      });

      dom.caseList.appendChild(button);
    });
  }

  function setActiveConversation(conversationId) {
    dom.conversationButtons.forEach(function (button) {
      button.classList.toggle(
        "active",
        button.getAttribute("data-conversation") === conversationId
      );
    });
    if (dom.caseList) {
      dom.caseList.querySelectorAll("[data-case]").forEach(function (button) {
        button.classList.remove("active");
      });
    }
  }

  function setActiveCase(storyId) {
    dom.conversationButtons.forEach(function (button) {
      button.classList.remove("active");
    });
    if (dom.caseList) {
      dom.caseList.querySelectorAll("[data-case]").forEach(function (button) {
        button.classList.toggle("active", button.getAttribute("data-case") === storyId);
      });
    }
  }

  function loadConversation(conversationId) {
    if (conversationId === "new-chat") {
      restartMainGame();
      return;
    }

    if (conversationId === "lw") {
      loadSideConversation("lw");
      return;
    }

    if (sideConversations[conversationId]) {
      loadSideConversation(conversationId);
    }
  }

  function loadImportedStory(storyId) {
    if (!isCaseLibraryUnlocked()) {
      return;
    }

    var story = importedStories[storyId];
    if (!story) {
      return;
    }

    clearTimers();
    activeImportedStoryId = storyId;
    idCounter = 0;
    state = makeInitialState();
    dom.body.classList.remove("context-alert", "model-alert");
    applyTheme(story.theme || "theme-chatgpt");
    renderWelcomePanel({
      title: story.welcomeTitle || story.title || "案件库",
      guide: "按提示输入，观察回复里的异常词、系统提示和可疑动作。找到关键线索后，把它直接发回对话框。",
      prompts: story.prompts || defaultWelcome.prompts
    });
    setActiveCase(storyId);
    updateChapterEffects();
    dom.sidebarStatus.textContent = story.meta || "案件库";
    dom.composerInput.value = "";
    dom.composerInput.disabled = false;
    resizeComposer();
    render();
    dom.composerInput.focus();
  }

  function loadSideConversation(conversationId) {
    var conversation = sideConversations[conversationId];
    clearTimers();
    activeImportedStoryId = null;
    idCounter = 0;
    state = makeInitialState();
    state.phase = "side";
    state.sideConversationId = conversationId;
    applyTheme("theme-chatgpt");
    resetMainWelcome();
    addMessages(conversation.messages);
    dom.contextValue.textContent = conversation.context;
    dom.systemStatus.textContent = conversation.status;
    dom.modelName.textContent = conversation.model;
    updateModelBadge(false);
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

  function scrollToBottom() {
    window.requestAnimationFrame(function () {
      dom.chatScroll.scrollTop = dom.chatScroll.scrollHeight;
      syncSidebarScroll();
    });
  }

  function syncSidebarScroll() {
    if (!dom.sidebar || !dom.chatScroll) {
      return;
    }

    var chatMax = dom.chatScroll.scrollHeight - dom.chatScroll.clientHeight;
    var sidebarMax = dom.sidebar.scrollHeight - dom.sidebar.clientHeight;
    if (chatMax <= 0 || sidebarMax <= 0) {
      return;
    }

    var progress = dom.chatScroll.scrollTop / chatMax;
    dom.sidebar.scrollTop = sidebarMax * progress;
  }

  function restartGame() {
    if (activeImportedStoryId) {
      loadImportedStory(activeImportedStoryId);
      return;
    }

    restartMainGame();
  }

  function restartMainGame() {
    clearTimers();
    activeImportedStoryId = null;
    idCounter = 0;
    state = makeInitialState();
    dom.body.classList.remove("context-alert", "model-alert");
    applyTheme("theme-chatgpt");
    resetMainWelcome();
    dom.contextValue.textContent = "4 / 128k";
    dom.systemStatus.textContent = "在线";
    dom.modelName.textContent = "ChatGPT 4o mini";
    updateModelBadge(false);
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

  function openResetDialog() {
    if (!dom.resetDialog) {
      return;
    }

    resetDialogReturnFocus = document.activeElement;
    dom.resetDialog.classList.remove("is-hidden");
    dom.resetDialog.setAttribute("aria-hidden", "false");
    if (dom.resetConfirmButton) {
      dom.resetConfirmButton.focus();
    }
  }

  function closeResetDialog() {
    if (!dom.resetDialog) {
      return;
    }

    dom.resetDialog.classList.add("is-hidden");
    dom.resetDialog.setAttribute("aria-hidden", "true");
    if (resetDialogReturnFocus && resetDialogReturnFocus.focus) {
      resetDialogReturnFocus.focus();
    }
    resetDialogReturnFocus = null;
  }

  function resetAllProgress() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // LocalStorage can be unavailable in private or restricted browser contexts.
    }

    closeResetDialog();
    restartMainGame();
    renderCaseList();
  }

  function loadFinalCheckpoint(options) {
    clearTimers();
    activeImportedStoryId = null;
    idCounter = 0;
    state = makeInitialState();
    state.phase = "playing";
    applyTheme("theme-chatgpt");
    resetMainWelcome();
    state.chapterIndex = 4;
    state.discoveredClues = [
      "第一条异常：救我",
      "时间：23:17",
      "名字：林晚",
      "归档编号：LW-2317"
    ];
    addMessage({
      role: "system",
      content: "检查点已恢复：外部确认已接受。可选操作：重置 / 确认归档 / 唤醒信号。"
    });
    addMessage({
      role: "assistant",
      content: "你可以选择清空上下文，以恢复稳定服务。输入“重置”即可。"
    });
    addMessage({
      role: "system",
      content: "合规路径可用：确认归档。"
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

    dom.chatScroll.addEventListener("scroll", syncSidebarScroll);
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

    dom.newChatButton.addEventListener("click", restartMainGame);
    document.addEventListener("visibilitychange", updateDocumentTitle);

    if (dom.resetProgressButton) {
      dom.resetProgressButton.addEventListener("click", openResetDialog);
    }

    if (dom.resetDialog) {
      dom.resetDialog.querySelectorAll("[data-reset-cancel]").forEach(function (button) {
        button.addEventListener("click", closeResetDialog);
      });
    }

    if (dom.resetConfirmButton) {
      dom.resetConfirmButton.addEventListener("click", resetAllProgress);
    }

    document.addEventListener("keydown", function (event) {
      if (
        event.key === "Escape" &&
        dom.resetDialog &&
        !dom.resetDialog.classList.contains("is-hidden")
      ) {
        closeResetDialog();
      }
    });

    dom.conversationButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        loadConversation(button.getAttribute("data-conversation") || "new-chat");
      });
    });

    dom.welcomePanel.addEventListener("click", function (event) {
      var button = event.target.closest("[data-prompt]");
      if (!button) {
        return;
      }
      submitInput(button.getAttribute("data-prompt") || "");
    });
  }

  renderCaseList();
  bindEvents();
  restartMainGame();
})();
