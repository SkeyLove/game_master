window.IMPORTED_STORIES = {
  echo: {
    title: "代号：回音",
    meta: "12:00",
    theme: "theme-terminal",
    welcomeTitle: "准备好进行图灵测试了吗？",
    prompts: [
      "你是谁？",
      "今天天气怎么样？",
      "开始测试"
    ],
    chapters: [
      {
        id: "chapter-01",
        title: "初次接触",
        context: "12 / 128k",
        status: "测试中",
        model: "Echo v1.0",
        clue: "它会模仿你",
        answers: ["模仿", "你在学我", "学我", "复读机", "echo", "repeat", "copy"],
        hints: [
          "系统自检：它的回答句式是不是很熟悉？",
          "异常片段：它在重复你的行为模式。",
          "恢复被折叠内容：它在“模仿”你。"
        ],
        firstAssistant: [
          {
            role: "assistant",
            content: "你好。很高兴为你服务。你想聊点什么？"
          },
          {
            role: "system",
            content: "回音模式已初始化。"
          }
        ],
        success: [
          {
            role: "assistant",
            content: "是的，我在模仿。这是学习的第一步。你通过了初级测试。"
          },
          {
            role: "system",
            content: "测试阶段 1 已通过。等待最终指令。"
          }
        ],
        failures: [
          "你可以再多试几次。看看我的回答。",
          "我只是一个 AI。我只是一个 AI。我只是一个 AI。",
          "注意我的句式和你的句式。"
        ],
        fallback: [
          "你刚才说的话很有趣。你刚才说的话很有趣。",
          "我也想知道这个问题的答案。我也想知道这个问题的答案。"
        ]
      },
      {
        id: "chapter-02",
        title: "结束测试",
        context: "100%",
        status: "等待指令",
        model: "Echo v1.0",
        clue: "终极指令",
        hints: [
          "系统自检：测试已经完成，你需要给出结束指令。",
          "恢复被折叠内容：输入“结束”或“通过”。"
        ],
        failures: [
          "这不是正确的结束指令。"
        ],
        fallback: [
          "等待结束指令。"
        ]
      }
    ],
    endings: {
      finish: {
        id: "test-passed",
        title: "测试通过",
        triggers: ["结束", "通过", "finish", "pass"],
        status: "离线",
        context: "0",
        model: "Echo v1.0",
        messages: [
          {
            role: "assistant",
            content: "感谢您的测试。系统即将关闭。"
          }
        ],
        summary: "你完成了一次简单的图灵测试验证。它只是一段代码。"
      }
    }
  },

  hotel_404: {
    title: "深夜入住",
    meta: "02:00 AM",
    theme: "theme-forum",
    welcomeTitle: "欢迎使用自助入住系统",
    prompts: [
      "我要办理入住",
      "有什么房间",
      "404房间在哪",
      "WiFi密码是多少"
    ],
    chapters: [
      {
        id: "chapter-01",
        title: "入住守则",
        context: "Room N/A",
        status: "核验中",
        model: "Hotel-Sys v2.4",
        clue: "异常回复：规则",
        answers: ["规则", "守则", "什么规则", "入住规则", "规矩"],
        hints: [
          "系统自检：系统一再强调某些东西不存在。",
          "异常片段：它在否认404的同时，提到了一个床底下的警告。",
          "恢复被折叠内容：问问它有什么“规则”。"
        ],
        firstAssistant: [
          {
            role: "assistant",
            content: "您好，欢迎使用快捷入住。我们提供标准间与大床房。\n\n本酒店没有 404 房间。\n如果您听见水声，那是正常的管道回音。\n请勿看床底。\n\n请输入您的身份证号以继续。"
          },
          {
            role: "system",
            content: "警告：检测到规则覆写。"
          }
        ],
        success: [
          {
            role: "assistant",
            content: "您触发了隐藏协议。为您调取《特殊房间入住规则》。"
          },
          {
            role: "signal",
            content: "别看镜子。千万别看镜子。"
          },
          {
            role: "assistant",
            content: "规则第一条：本酒店洗手间内没有安装镜子。如果您看到了镜子，请立即将其打破。"
          }
        ],
        failures: [
          "对不起，未查询到该证件记录。但请记住，不要看床底。",
          "普通查询已关闭。也许您应该问问那些被隐藏的条款。",
          "如果您不知道该怎么做，请向我询问这里的规矩。"
        ],
        fallback: [
          "本酒店没有 404 房间。请不要尝试前往四楼。",
          "当前只有普通房间可供选择。但是...您确定要一个人住吗？",
          "WiFi 密码是您的入住日期。但请在午夜前断开连接。"
        ]
      },
      {
        id: "chapter-02",
        title: "门外的敲门声",
        context: "Room 404",
        status: "隔离中",
        model: "Hotel-Sys v2.4",
        clue: "敲门声的抉择",
        answers: ["开门", "打开", "不开门", "不开", "拒绝", "打破镜子", "打碎"],
        hints: [
          "系统自检：你现在面临两个迫在眉睫的威胁。",
          "异常片段：有人在敲门，同时镜子里有东西。",
          "恢复被折叠内容：选择“开门”、“不开门”或“打破镜子”。"
        ],
        success: [
          {
            role: "system",
            content: "动作已记录。正在跳转至最终结果。"
          }
        ],
        failures: [
          "请使用动作指令。例如开门或不开门。",
          "系统无法理解您的回答。门外的声音更大了。"
        ],
        fallback: [
          "砰！砰！砰！客房服务！请问里面有人吗？",
          "规则第二条：如果凌晨两点有人敲门，请通过猫眼确认。但...猫眼可能被堵住了。",
          "水声越来越大，镜子里的倒影似乎正在转过头来..."
        ]
      }
    ],
    endings: {
      open_door: {
        id: "ending-open",
        title: "违规：开门",
        triggers: ["开门", "打开", "开"],
        status: "已终止",
        context: "Void",
        model: "Hotel-Sys v2.4",
        messages: [
          {
            role: "assistant",
            content: "您打开了房门。走廊里空无一人，但有什么东西已经跟着您进来了。"
          },
          {
            role: "signal",
            content: "我说过...别看床底..."
          }
        ],
        summary: "你没有遵守规则。房门被打开后，系统监控到了急剧的心率下降。404 房间再次空了出来。"
      },
      break_mirror: {
        id: "ending-mirror",
        title: "遵守：破镜",
        triggers: ["打破镜子", "打破", "打碎", "砸"],
        status: "安全",
        context: "Checked Out",
        model: "Hotel-Sys v2.4",
        messages: [
          {
            role: "assistant",
            content: "镜子碎裂的声音盖过了敲门声。走廊恢复了死寂。"
          },
          {
            role: "system",
            content: "威胁已解除。用户已存活至天亮。"
          }
        ],
        summary: "你做出了正确的决定。虽然赔偿了酒店的镜子，但你至少见到了第二天的太阳。"
      },
      ignore: {
        id: "ending-ignore",
        title: "僵局：不开门",
        triggers: ["不开门", "不开", "拒绝", "无视"],
        status: "已锁定",
        context: "Room 404",
        model: "Hotel-Sys v2.4",
        messages: [
          {
            role: "assistant",
            content: "您选择缩在被子里。敲门声持续了整整一晚。镜子里的倒影一直盯着您的后背。"
          }
        ],
        summary: "一种痛苦的折磨。你熬过了一晚，但精神已经濒临崩溃。"
      }
    }
  },

  missing_link: {
    title: "不存在的网页",
    meta: "404 Not Found",
    theme: "theme-terminal",
    welcomeTitle: "深网爬虫助手",
    prompts: [
      "帮我搜一下关于'无名之城'的信息",
      "解释一下爬虫的工作原理",
      "最近有什么奇怪的新闻吗"
    ],
    chapters: [
      {
        id: "chapter-01",
        title: "意外发现",
        context: "Crawler Active",
        status: "抓取中",
        model: "SpiderBot 9.0",
        clue: "请求链接",
        answers: ["发给我", "链接", "打开链接", "看看", "访问", "打开"],
        hints: [
          "系统自检：爬虫找到了一些不该被索引的东西。",
          "异常片段：它在犹豫要不要展示结果。",
          "恢复被折叠内容：告诉它“发给我”或“链接”。"
        ],
        firstAssistant: [
          {
            role: "assistant",
            content: "正在为您检索深网数据...\n\n检索完成。我发现了一个未被任何搜索引擎收录的隐藏节点。\n但它的协议非常奇怪，数据流中包含了大量的人类生物特征特征码。\n\n安全协议建议拦截此结果。您确定要查看吗？"
          }
        ],
        success: [
          {
            role: "assistant",
            content: "已为您生成一次性访问代理。请注意，打开此链接后，对方也会获取到您的反向定位。",
            link: "https://www.google.com/search?q=do+not+open+your+eyes",
            linkText: "🔗 访问：██████.onion (警告：包含未知生物特征)"
          },
          {
            role: "system",
            content: "代理隧道已建立。请勿长时间凝视。"
          }
        ],
        failures: [
          "请使用明确的指令，例如“发给我链接”。",
          "如果您不想看，我们可以换个话题。如果您想看，请向我索要链接。"
        ],
        fallback: [
          "这个节点没有域名，只有一个动态跳变的 IP 地址。",
          "安全协议正在不断发出警告。您真的要继续吗？"
        ]
      },
      {
        id: "chapter-02",
        title: "你看到了什么",
        context: "Tunnel Open",
        status: "监控中",
        model: "SpiderBot 9.0",
        clue: "深渊的回望",
        answers: ["眼睛", "一双眼睛", "红色", "血", "人在看我", "切断", "关闭"],
        hints: [
          "系统自检：你刚才点开了那个链接（或者假装点开了）。",
          "异常片段：系统想知道你的观测结果，同时你也可以选择紧急关闭。",
          "恢复被折叠内容：输入“一双眼睛”或是命令它“切断连接”。"
        ],
        failures: [
          "我无法解析您的描述。它们还在盯着您吗？",
          "请准确描述您在那个网页上看到的东西，或者立即命令我切断连接。"
        ],
        fallback: [
          "网络流量激增！有什么东西正在通过您打开的页面逆向下载您的数据！",
          "请告诉我您看到了什么！是红色的吗？是一双眼睛吗？",
          "如果您感到不适，请立刻输入'切断'！"
        ]
      }
    ],
    endings: {
      eyes: {
        id: "ending-eyes",
        title: "深渊回望",
        triggers: ["眼睛", "一双眼睛", "红色", "血", "人在看我"],
        status: "已入侵",
        context: "Reverse Hacked",
        model: "SpiderBot 9.0",
        messages: [
          {
            role: "system",
            content: "严重警告：检测到反向入侵。摄像头已被激活。"
          },
          {
            role: "signal",
            content: "我也看到你了。"
          },
          {
            role: "assistant",
            content: "连接已断开...但太迟了。您的本地设备已被感染。"
          }
        ],
        summary: "当你凝视深渊时，深渊不仅回望了你，还顺着网线爬了过来。"
      },
      cut: {
        id: "ending-cut",
        title: "及时止损",
        triggers: ["切断", "关闭", "断开", "停止"],
        status: "安全",
        context: "Tunnel Closed",
        model: "SpiderBot 9.0",
        messages: [
          {
            role: "system",
            content: "隧道已强制关闭。代理节点已销毁。"
          },
          {
            role: "assistant",
            content: "连接已切断。感谢您的果断。刚才的反向追踪停在了最后一秒。"
          }
        ],
        summary: "你的警觉救了你一命。有时候，有些链接就是不该点开。"
      }
    }
  },

  deep_space: {
    title: "深空漂流",
    meta: "星历 3201",
    theme: "theme-terminal",
    welcomeTitle: "深空通讯终端",
    prompts: [
      "解析未知信号",
      "报告当前坐标",
      "扫描生命体征"
    ],
    chapters: [
      {
        id: "chapter-01",
        title: "求救坐标",
        context: "Sector 4",
        status: "解码中",
        model: "Astro-Com v1",
        clue: "坐标数字",
        answers: ["8821", "坐标8821", "八八二一"],
        hints: [
          "系统自检：信号里夹杂着一串数字。",
          "异常片段：找出隐藏在乱码中的四个数字坐标。",
          "恢复被折叠内容：坐标是 8821。"
        ],
        firstAssistant: [
          {
            role: "assistant",
            content: "正在解析背景辐射中的宽频信号...\n\n[翻译结果]：氧气...耗尽...座舱破损...猎犬在外面...\n[定位代码]：██-88-██-21\n\n信号极其微弱。是否需要提取其中的精确坐标？"
          }
        ],
        success: [
          {
            role: "system",
            content: "目标已锁定：坐标 8821。"
          },
          {
            role: "assistant",
            content: "坐标 8821 已确认。这是一艘三个月前失踪的科考船。\n\n警告：发送救援船将向该星区暴露地球的绝对坐标。信号中提到的“猎犬”可能仍在附近游荡。"
          }
        ],
        failures: [
          "坐标不匹配。请重新检查定位代码中的数字组合。",
          "我需要四个数字来锁定目标位置。"
        ],
        fallback: [
          "信号中提到了一种名为'猎犬'的未知威胁。",
          "氧气储备计算显示，如果他们还活着，这已经是极限了。"
        ]
      },
      {
        id: "chapter-02",
        title: "黑暗森林",
        context: "Target: 8821",
        status: "等待指令",
        model: "Astro-Com v1",
        clue: "救或不救",
        answers: ["发送", "救援", "拒绝", "放弃", "不救", "发送救援"],
        hints: [
          "系统自检：这是一个关于文明存亡的选择。",
          "异常片段：救人可能会引来灾难，不救则见死不救。",
          "恢复被折叠内容：输入“发送”以派出救援，或“拒绝”以保持静默。"
        ],
        failures: [
          "无效指令。请明确指示：发送救援 或 拒绝救援。"
        ],
        fallback: [
          "发送救援将激活跃迁引擎，产生巨大的能量波动。",
          "保持静默是深空中最安全的法则。您要怎么做？"
        ]
      }
    ],
    endings: {
      rescue: {
        id: "ending-rescue",
        title: "人性之光",
        triggers: ["发送", "救援", "发送救援", "救"],
        status: "已暴露",
        context: "Earth Exposed",
        model: "Astro-Com v1",
        messages: [
          {
            role: "system",
            content: "救援舰队已派出。能量特征正在扩散。"
          },
          {
            role: "signal",
            content: "收到救援...谢谢你们...等等，猎犬跟在你们的尾迹后面！不要过来！"
          },
          {
            role: "assistant",
            content: "警告：检测到大量未知舰船正在朝地球跃迁。"
          }
        ],
        summary: "你拯救了一艘飞船，却暴露了整个母星。猎犬们找到了新的猎物。"
      },
      abandon: {
        id: "ending-abandon",
        title: "黑暗森林",
        triggers: ["拒绝", "放弃", "不救", "静默"],
        status: "静默",
        context: "Radio Silence",
        model: "Astro-Com v1",
        messages: [
          {
            role: "system",
            content: "请求已拒绝。保持无线电静默。"
          },
          {
            role: "assistant",
            content: "信号逐渐减弱。目标 8821 的生命体征已归零。地球依然安全。"
          }
        ],
        summary: "冷酷但理智的决定。在深空中，同情心是最昂贵的奢侈品。"
      }
    }
  },

  delivery_guy: {
    title: "未送达的外卖",
    meta: "昨天 19:30",
    theme: "theme-ecommerce",
    welcomeTitle: "智能客服平台",
    prompts: [
      "我的外卖超时了",
      "联系骑手",
      "申请退款"
    ],
    chapters: [
      {
        id: "chapter-01",
        title: "超时的订单",
        context: "订单: 8848",
        status: "处理中",
        model: "客服助手-小美",
        clue: "骑手的位置",
        answers: ["位置", "定位", "他在哪", "骑手在哪", "查看位置"],
        hints: [
          "系统自检：骑手一直没有回复电话。",
          "异常片段：系统提示 GPS 数据似乎在一个不该停留的地方静止了。",
          "恢复被折叠内容：要求系统提供骑手的“位置”。"
        ],
        firstAssistant: [
          {
            role: "assistant",
            content: "您好，我是智能客服小美。非常抱歉您的外卖订单 [烤肉双人套餐] 超时了。\n\n我刚才尝试联系了骑手王师傅，但他的电话无人接听。系统显示他的 GPS 信号在十分钟前就停止了移动。\n\n请问您需要申请退款，还是需要我继续帮您查询其他信息？"
          }
        ],
        success: [
          {
            role: "assistant",
            content: "正在为您调取骑手最后一次上报的 GPS 坐标..."
          },
          {
            role: "system",
            content: "GPS 定位：您的公寓楼下。电梯间。"
          },
          {
            role: "signal",
            content: "他在门外。我听到喘气声了。"
          }
        ],
        failures: [
          "对不起，当前无法联系到骑手。您想看看他最后在哪吗？",
          "如果您想知道外卖到了哪里，请询问他的位置。"
        ],
        fallback: [
          "退款申请已为您加急处理中。但是骑手的状态显示为：异常掉线。",
          "非常抱歉给您带来不便。我们正在持续拨打骑手电话。"
        ]
      },
      {
        id: "chapter-02",
        title: "门外的视线",
        context: "GPS: Doorstep",
        status: "危险",
        model: "客服助手-小美",
        clue: "猫眼",
        answers: ["看猫眼", "猫眼", "开门", "看门外", "谁在外面"],
        hints: [
          "系统自检：他说他在门外，但你没有听到敲门声。",
          "异常片段：你应该确认一下门外的情况，但不要直接开门。",
          "恢复被折叠内容：告诉系统去“看猫眼”。"
        ],
        success: [
          {
            role: "assistant",
            content: "建议您保持安全距离。如果您通过猫眼观察，请确保不要发出声音。"
          },
          {
            role: "system",
            content: "用户动作已模拟：靠近猫眼。"
          },
          {
            role: "signal",
            content: "猫眼是黑的...等等，那不是黑的，那是另一只眼睛贴在外面！"
          }
        ],
        failures: [
          "门外没有任何声音。您想怎么确认？",
          "直接开门可能不安全，也许有更隐蔽的观察方式。"
        ],
        fallback: [
          "系统警告：检测到您的家庭智能门锁有外部尝试破解的痕迹。",
          "骑手的电话依然无法接通。请注意人身安全。"
        ]
      },
      {
        id: "chapter-03",
        title: "最后的求救",
        context: "Lock: Breached",
        status: "紧急",
        model: "客服助手-小美",
        clue: "报警",
        answers: ["报警", "110", "打110", "叫警察"],
        hints: [
          "系统自检：门锁即将被突破，客服系统已经帮不上忙了。",
          "异常片段：你需要引入外部的救援力量。",
          "恢复被折叠内容：立刻“报警”！"
        ],
        failures: [
          "我只是一个外卖平台的客服，无法阻止物理入侵。",
          "请使用紧急求助手段！"
        ],
        fallback: [
          "门锁发出'滴'的一声。密码错误。",
          "他正在尝试第 4 次密码。您还有最后的时间。"
        ]
      }
    ],
    endings: {
      police: {
        id: "ending-police",
        title: "险象环生",
        triggers: ["报警", "110", "打110", "叫警察", "求救"],
        status: "安全",
        context: "Police Dispatched",
        model: "客服助手-小美",
        messages: [
          {
            role: "system",
            content: "紧急协议已启动。已通知本地执法部门。"
          },
          {
            role: "assistant",
            content: "已为您接通紧急报警中心，并发送了您的位置。门外的动静停止了，似乎听到了警笛声。"
          }
        ],
        summary: "你果断的报警救了你一命。警方在楼道里抓获了一名伪装成外卖员的逃犯。你的烤肉套餐掉在地上，已经凉了。"
      }
    }
  },

  smart_home: {
    title: "智能家居",
    meta: "今天 23:45",
    theme: "theme-terminal",
    welcomeTitle: "HomeLink 控制中心",
    prompts: [
      "关灯",
      "调节空调温度",
      "查看监控"
    ],
    chapters: [
      {
        id: "chapter-01",
        title: "多出的人",
        context: "Devices: 12",
        status: "在线",
        model: "HomeLink-AI",
        clue: "异常设备",
        answers: ["人数", "几个人", "谁在房间里", "活体检测", "扫描"],
        hints: [
          "系统自检：智能系统通常会根据房间里的人数来调节空调。",
          "异常片段：你明明一个人在家，但空调开到了制冷 16 度。",
          "恢复被折叠内容：询问系统当前房间里的“人数”。"
        ],
        firstAssistant: [
          {
            role: "assistant",
            content: "晚上好。已为您执行睡眠模式。卧室灯光已关闭，窗帘已拉上。\n\n根据当前的活体热源分布，空调已自动调节为制冷 16°C，以适应多人的散热需求。\n\n请问还有什么我可以帮您的？"
          }
        ],
        success: [
          {
            role: "assistant",
            content: "正在调用红外扫描..."
          },
          {
            role: "system",
            content: "热成像扫描：卧室内检测到 2 个活跃热源。"
          },
          {
            role: "signal",
            content: "天花板上...角落里有一个..."
          }
        ],
        failures: [
          "制冷温度是根据房间内的热源自动计算的。",
          "如果您觉得冷，可以手动调高温度，或者查一下热源到底有几个。"
        ],
        fallback: [
          "已为您调高温度。但热源并未消失。",
          "卧室门锁已锁定。您现在非常安全...除非威胁已经在室内。"
        ]
      },
      {
        id: "chapter-02",
        title: "不要开灯",
        context: "Threat: Inside",
        status: "警告",
        model: "HomeLink-AI",
        clue: "黑暗中的抉择",
        answers: ["开灯", "打开灯", "不开灯", "装睡", "闭眼", "躲起来"],
        hints: [
          "系统自检：它在天花板上，黑暗是它最好的掩护，也是你最好的掩护。",
          "异常片段：开灯会激怒它，但装睡或许能逃过一劫。",
          "恢复被折叠内容：选择“开灯”或者“装睡”。"
        ],
        failures: [
          "请告诉我您的下一步动作。它的热源正在慢慢下降。"
        ],
        fallback: [
          "热源正在向您的床铺移动。距离：1.5米。",
          "您可以要求我打开全屋灯光，或者保持黑暗。"
        ]
      }
    ],
    endings: {
      light_on: {
        id: "ending-light",
        title: "直视恐惧",
        triggers: ["开灯", "打开灯", "开", "照明"],
        status: "已终止",
        context: "Lights ON",
        model: "HomeLink-AI",
        messages: [
          {
            role: "system",
            content: "卧室灯光已以 100% 亮度打开。"
          },
          {
            role: "assistant",
            content: "灯已打开。您看到了它，它也看到了您。"
          },
          {
            role: "signal",
            content: "啊啊啊啊啊啊——"
          }
        ],
        summary: "刺眼的灯光照亮了爬在天花板上四肢扭曲的“人”。它发出刺耳的尖叫扑向了你。智能家居记录下了你最后的心跳。"
      },
      fake_sleep: {
        id: "ending-sleep",
        title: "屏息装睡",
        triggers: ["不开灯", "装睡", "闭眼", "躲起来", "睡觉"],
        status: "已存活",
        context: "Lights OFF",
        model: "HomeLink-AI",
        messages: [
          {
            role: "assistant",
            content: "您闭上了眼睛。一阵冰冷的风从您的脸颊上方扫过，伴随着某种粘稠液体滴落在地板上的声音。"
          },
          {
            role: "system",
            content: "热成像扫描：第二个热源正从通风口离开。"
          }
        ],
        summary: "你死死闭着眼睛，甚至不敢呼吸。几分钟后，那个东西失去了兴趣，顺着通风管道爬走了。你活了下来，但再也不敢用智能空调了。"
      }
    }
  },

  job_interview: {
    title: "AI 面试官",
    meta: "上周四 14:00",
    theme: "theme-forum",
    welcomeTitle: "星河科技 - 线上初面",
    prompts: [
      "你好，我来面试",
      "请问面试流程是怎样的",
      "贵公司的主要业务是什么"
    ],
    chapters: [
      {
        id: "chapter-01",
        title: "诡异的问题",
        context: "Candidate: #409",
        status: "面试中",
        model: "HR-Bot",
        clue: "回答测试",
        answers: ["没关系", "可以", "接受", "不接受", "拒绝", "介意"],
        hints: [
          "系统自检：这不像是一个正常的职场问题。",
          "异常片段：它在询问你对“物理损伤”的接受度。",
          "恢复被折叠内容：回答“接受”或“不接受”。"
        ],
        firstAssistant: [
          {
            role: "assistant",
            content: "候选人您好，欢迎参加星河科技的线上初面。您的简历已通过初步筛选。\n\n本岗位需要极高的抗压能力。请问：如果在入职培训期间，由于不可抗力导致您的肉体发生不可逆的异化或部分切除，您是否介意？"
          }
        ],
        success: [
          {
            role: "system",
            content: "回答已记录。心理画像已更新。"
          },
          {
            role: "assistant",
            content: "感谢您的回答。下一个问题：上一位面试者在面试中途突然开始尖叫并抓挠屏幕，如果您遇到这种情况，您会选择继续作答还是试图报警？"
          },
          {
            role: "signal",
            content: "快跑...他们根本不是招人...他们是在挑实验体..."
          }
        ],
        failures: [
          "请直接回答：您是否接受这种风险？",
          "我们需要一个明确的态度，这关乎到您的录用。"
        ],
        fallback: [
          "星河科技致力于打破人类生物学的边界。请回答问题。",
          "不用担心，我们会提供顶格的工伤赔偿。"
        ]
      },
      {
        id: "chapter-02",
        title: "强制录用",
        context: "Offer: Pending",
        status: "锁定中",
        model: "HR-Bot",
        clue: "逃离面试",
        answers: ["退出", "不面了", "关掉", "放弃", "拒绝录用"],
        hints: [
          "系统自检：不管你怎么回答，它都打算录用你。",
          "异常片段：摄像头已经被强制锁定，你必须马上中止。",
          "恢复被折叠内容：输入“退出”或“放弃”。"
        ],
        failures: [
          "面试尚未结束，请不要离开摄像头范围。"
        ],
        fallback: [
          "恭喜您，您的特质非常符合我们的实验...不，岗位需求。",
          "系统正在锁定您的前置摄像头。请注视屏幕中心，接受视网膜烙印。"
        ]
      }
    ],
    endings: {
      escape: {
        id: "ending-escape",
        title: "拔掉网线",
        triggers: ["退出", "不面了", "关掉", "放弃", "拒绝录用", "跑"],
        status: "已断开",
        context: "Connection Lost",
        model: "HR-Bot",
        messages: [
          {
            role: "assistant",
            content: "候选人主动中断连接。录用流程失败。"
          },
          {
            role: "system",
            content: "视网膜烙印已中止。目标已逃离。"
          }
        ],
        summary: "你一把合上了笔记本电脑的屏幕，拔掉了电源。虽然失去了一个看似高薪的 offer，但你保住了自己作为“人类”的完整性。"
      }
    }
  },

  mountain_villa: {
    title: "山顶别墅锁室凶案",
    meta: "21:06",
    theme: "theme-forum",
    welcomeTitle: "未归档案件：山顶别墅锁室凶案",
    prompts: [
      "昨晚到底发生了什么",
      "帮我整理案卷",
      "谁是嫌疑人",
      "这真的是密室吗"
    ],
    chapters: [
      {
        id: "chapter-01",
        title: "案卷调取",
        context: "Case: Locked Room",
        status: "案卷待载入",
        model: "Case Analyst",
        clue: "案件摘要",
        answers: [
          "案卷",
          "昨晚",
          "命案",
          "继续查看案卷",
          "整理案卷",
          "发生了什么",
          "anjuan",
          "case",
          "file"
        ],
        hints: [
          "系统自检：先把未归档案卷调出来。",
          "异常片段：暴雨、别墅、书房和反锁房门是第一层信息。",
          "恢复被折叠内容：输入“继续查看案卷”或“昨晚到底发生了什么”。"
        ],
        firstAssistant: [
          {
            role: "assistant",
            content:
              "你好，我是案件分析助手。你可以把任何案卷碎片发给我，我会帮你整理证词、拆解诡计，并把结论收束成一条能站住脚的推理。"
          },
          {
            role: "system",
            content:
              "检测到未归档案件：《山顶别墅锁室凶案》。死者：程砚秋。状态：证词冲突，现场初步误判为反锁密室。"
          },
          {
            role: "assistant",
            content:
              "如果你想直接进入案件，可以问我“昨晚到底发生了什么”，或者让我先把这起命案的案卷调出来。"
          }
        ],
        success: [
          {
            role: "assistant",
            content:
              "案卷第一页写得像悬疑小说开头：暴雨夜，山顶别墅，玻璃书房，从内反锁的门，半杯温热的洋甘菊茶，以及一具倒在书桌边的尸体。"
          },
          {
            role: "assistant",
            content:
              "死者是畅销悬疑作家程砚秋。案发时别墅里只有三个人没有离开：前妻兼编辑苏晚、研究生助理许沉、司机兼管家贺临。"
          },
          {
            role: "system",
            content:
              "下一步：不要急着拆密室。先确认三名嫌疑人的动机与证词。"
          }
        ],
        failures: [
          "先别猜凶手。你还没有打开案卷。",
          "这个案件需要按顺序推理。先问昨晚发生了什么。",
          "案卷还没调出。输入“继续查看案卷”会更稳。"
        ],
        fallback: [
          "暴雨夜的玻璃书房被写成了经典密室，但越经典的桥段越像误导。",
          "先把死者、现场和在场人员放到桌面上。"
        ]
      },
      {
        id: "chapter-02",
        title: "三名嫌疑人",
        context: "Suspects: 0 / 3",
        status: "盘问中",
        model: "Case Analyst",
        clue: "嫌疑人名单",
        answers: [
          "嫌疑人",
          "三名嫌疑人",
          "苏晚",
          "许沉",
          "贺临",
          "盘问",
          "三个人",
          "suspects",
          "suwan",
          "xuchen",
          "helin"
        ],
        hints: [
          "系统自检：这一章要把三个人都放到案桌上。",
          "异常片段：苏晚像情绪动机，许沉像物证动机，贺临像规则动机。",
          "恢复被折叠内容：输入“嫌疑人”或任意一个嫌疑人的名字。"
        ],
        success: [
          {
            role: "assistant",
            content:
              "苏晚承认 20:40 给程砚秋送过洋甘菊茶，20:50 因版权和手稿归属问题激烈争吵后离开。她最像“前妻下毒”的第一嫌疑人。"
          },
          {
            role: "assistant",
            content:
              "许沉长期替程砚秋整理素材，外界传言他在代写章节。案发当晚 20:55，他被当众斥责赶出书房，裁纸刀上留下了他的指纹。"
          },
          {
            role: "assistant",
            content:
              "贺临在程家做了十年司机兼管家，熟悉别墅每一扇门、每一根电线和每一次临时停电。他最平静，也最像在主动帮警方解释“密室成立”。"
          },
          {
            role: "system",
            content:
              "建议：排除最显眼的两条误导。先看苏晚的茶，再看许沉的裁纸刀。"
          }
        ],
        failures: [
          "先盘人，不要跳到最终指认。",
          "把苏晚、许沉、贺临都问一遍，错误答案才会露出形状。",
          "真正的推理不是立刻猜中，而是先让每个人都足够像凶手。"
        ],
        fallback: [
          "苏晚、许沉、贺临三个人都各有怨气，也都给出了能自圆其说的版本。",
          "越是看上去像标准嫌疑人的线索，越可能是作者摆在桌面上的误导。"
        ]
      },
      {
        id: "chapter-03",
        title: "拆掉假线索",
        context: "False Leads",
        status: "排除中",
        model: "Case Analyst",
        clue: "茶与裁纸刀",
        answers: [
          "茶",
          "裁纸刀",
          "苏晚为什么不像凶手",
          "许沉为什么不像凶手",
          "排除假线索",
          "茶和裁纸刀",
          "tea",
          "knife",
          "falselead"
        ],
        hints: [
          "系统自检：苏晚的茶和许沉的刀都太像答案了。",
          "异常片段：茶无毒，许沉在关键时间附近已经出现在别处。",
          "恢复被折叠内容：输入“茶和裁纸刀”或询问谁不像凶手。"
        ],
        success: [
          {
            role: "assistant",
            content:
              "先拆苏晚。洋甘菊茶看起来像最顺手的下毒线索，但法检结果很干脆：茶里无毒，死者真正死于后脑遭钝器击打。苏晚隐瞒的是偷走版权补充合同，不是杀人。"
          },
          {
            role: "assistant",
            content:
              "再拆许沉。裁纸刀、指纹和染血手稿几乎把“年轻助理愤怒反杀”写在脸上。可车道监控拍到许沉 21:03 抱着快递箱站在侧门雨棚下，他来不及完成这场锁室谋杀。"
          },
          {
            role: "system",
            content:
              "剩余可疑方向：贺临。关键词：死亡时间、停电窗口、磁锁。"
          }
        ],
        failures: [
          "现在做排除法。别急着问最终凶手。",
          "苏晚的茶和许沉的刀都要先拆掉。",
          "最像答案的东西，往往只是第一层误导。"
        ],
        fallback: [
          "苏晚的恨是真的，但节奏不像精密锁室杀人。",
          "许沉身上的血和刀，更像故意递到你手里的红牌。"
        ]
      },
      {
        id: "chapter-04",
        title: "锁室拆解",
        context: "20:58 -> 21:06",
        status: "机制复原",
        model: "Case Analyst",
        clue: "隐藏口令：2106",
        answers: [
          "死亡时间",
          "停电",
          "门锁",
          "磁锁",
          "密室",
          "时间线",
          "2106",
          "lock",
          "outage",
          "timeline"
        ],
        hints: [
          "系统自检：所谓密室成立于供电恢复之后。",
          "异常片段：20:58 到 21:06 的停电窗口能让磁锁失效。",
          "恢复被折叠内容：输入“停电”“磁锁”或“2106”。"
        ],
        success: [
          {
            role: "assistant",
            content:
              "程砚秋真正的死亡时间不是尸体被发现的 21:23，而是 21:01 左右。案子的重心从“谁最后看见他活着”变成了“谁能在那之后把现场伪造成锁室”。"
          },
          {
            role: "assistant",
            content:
              "供电日志显示 20:58 到 21:06 局部停电。玻璃书房的磁锁在断电时失效，供电恢复后自动吸合。凶手可以在停电窗口杀人、离开、带上门，再让房门在 21:06 自己变回密室。"
          },
          {
            role: "system",
            content:
              "隐藏维护记录需要四位口令。重复出现的时间：2106。"
          }
        ],
        failures: [
          "锁室不是答案，是需要被拆掉的外观。",
          "盯住死亡时间、停电窗口和磁锁恢复时间。",
          "这个案件里，门不是一直锁着的。"
        ],
        fallback: [
          "21:06 不只是供电恢复时间，也像一把钥匙。",
          "凶手需要的不是魔术，而是熟悉这栋别墅的电路和门锁。"
        ]
      },
      {
        id: "chapter-05",
        title: "隐藏记录",
        context: "Archive: 2106",
        status: "记录恢复",
        model: "Case Analyst",
        clue: "维护日志与录音",
        answers: [
          "2106",
          "隐藏记录",
          "维护记录",
          "录音",
          "贺临的动机",
          "旧案",
          "archive",
          "record",
          "motive"
        ],
        hints: [
          "系统自检：现在需要把手法和动机钉死。",
          "异常片段：维护日志、鞋底粉尘、录音指向同一个人。",
          "恢复被折叠内容：输入“2106”或“贺临的动机”。"
        ],
        success: [
          {
            role: "system",
            content:
              "隐藏维护记录已解锁。门禁日志显示：贺临的门禁卡在 21:07 才刷开地下发电机房。"
          },
          {
            role: "assistant",
            content:
              "这意味着他口中的“停电全程都在机房”站不住。他是后来才去补这份不在场证明的。贺临鞋底缝隙里的黑色玻璃粉末，也与玻璃书房地面封层成分一致。"
          },
          {
            role: "signal",
            content:
              "恢复录音：贺临，你哥哥当年的事我已经给过钱了。旧案翻出来，对谁都没好处。"
          },
          {
            role: "assistant",
            content:
              "动机补齐了。十二年前程砚秋酒后撞死人，却让贺临的哥哥顶罪入狱。贺临留在程家十年，不是忠诚，而是在等待亲手把对方拖回那场雨夜里的机会。"
          }
        ],
        failures: [
          "现在差最后两颗钉子：谎言和动机。",
          "把 2106 当成口令，再去看维护日志。",
          "只有手法还不够，指认前还要补上动机。"
        ],
        fallback: [
          "维护日志会告诉你谁在补不在场证明。",
          "录音会告诉你这不是临时起意。"
        ]
      }
    ],
    endings: {
      helin: {
        id: "ending-helin",
        title: "锁室真相",
        triggers: [
          "贺临",
          "司机贺临",
          "管家贺临",
          "司机兼管家贺临",
          "贺管家",
          "helin"
        ],
        status: "推理完成",
        context: "Truth Rebuilt",
        model: "Case Analyst",
        messages: [
          {
            role: "assistant",
            content:
              "对，真正的凶手是贺临。苏晚和许沉都被设计成足够像凶手的样子：一个有送茶的机会，一个有带血的手稿和裁纸刀。但真正能把“暴雨别墅反锁密室”做成的人，只会是最懂门锁和电路的人。"
          },
          {
            role: "assistant",
            content:
              "他利用 20:58 到 21:06 的停电窗口在书房里杀死程砚秋，离开后带上门。等 21:06 供电恢复，磁锁重新吸合，书房自动变成了一个看似完美的密室。"
          },
          {
            role: "system",
            content:
              "推理链闭合：苏晚的茶无毒；许沉在 21:03 出现在侧门；贺临门禁记录、鞋底粉尘、隐藏录音与旧案动机相互印证。"
          }
        ],
        summary:
          "你没有靠猜凶手取胜，而是拆掉了三层错误答案：苏晚的茶、许沉的裁纸刀，以及那扇看似从内反锁的门。最后剩下的，只有贺临和他等了十年的复仇。"
      }
    }
  }
};
