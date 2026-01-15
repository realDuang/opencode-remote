import { LocaleDict } from "./en";

export const zh: LocaleDict = {
  // Common
  common: {
    loading: "加载中...",
    cancel: "取消",
    save: "保存",
    delete: "删除",
    confirm: "确认",
    back: "返回",
    copied: "已复制!",
    showMore: "显示更多",
    showLess: "显示更少",
    showResults: "显示结果",
    hideResults: "隐藏结果",
    showDetails: "显示详情",
    hideDetails: "隐藏详情",
    showPreview: "显示预览",
    hidePreview: "隐藏预览",
    showContents: "显示内容",
    hideContents: "隐藏内容",
    showOutput: "显示输出",
    hideOutput: "隐藏输出",
    error: "错误",
    unknownProject: "未知项目",
  },

  // Login page
  login: {
    title: "OpenCode Remote",
    accessCode: "访问码",
    placeholder: "输入 6 位验证码",
    invalidCode: "无效的访问码",
    errorOccurred: "发生错误，请重试。",
    verifying: "验证中...",
    connect: "连接",
  },

  // Chat page
  chat: {
    newSession: "新会话",
    remoteAccess: "远程访问",
    settings: "设置",
    logout: "退出登录",
    startConversation: "开始新的对话",
    startConversationDesc: "选择一个模型，在下方输入框中输入任何问题开始聊天。",
    disclaimer: "AI 生成的内容可能不准确，请核实重要信息。",
  },

  // Settings page
  settings: {
    back: "返回",
    title: "连接设置",
    serverUrl: "OpenCode 服务器地址",
    serverUrlDesc: "请输入你要连接的 OpenCode 服务地址 (例如: http://localhost:4096)",
    testing: "测试中...",
    testConnection: "测试连接",
    connectionSuccess: "连接测试成功！",
    connectionFailed: "无法连接到服务器:",
    serverUrlEmpty: "服务器地址不能为空",
    serverError: "服务器返回错误:",
    urlUpdated: "服务器地址已更新",
    saveFailed: "保存失败，请检查地址格式",
    saving: "保存中...",
    saveAndConnect: "保存并连接",
    infoTitle: "说明",
    infoDefault: "默认地址通常为 /opencode-api (指向本地代理)",
    infoRemote: "如果连接远程服务器，请确保网络可达",
    infoChange: "更改地址后，聊天记录和会话列表将从新服务器加载",
  },

  // Remote Access page
  remote: {
    title: "远程访问",
    publicAccess: "公网远程访问",
    publicAccessDesc: "通过 Cloudflare 隧道从互联网访问",
    starting: "正在启动隧道，请稍候...",
    startFailed: "启动失败，请确保已安装 cloudflared",
    securityWarning: "安全提示：",
    securityWarningDesc: "远程访问允许完全控制此设备。请妥善保管访问密码，切勿分享给不信任的人。",
    accessPassword: "访问密码",
    connectionAddress: "连接地址",
    publicAddress: "公网地址",
    lanAddress: "局域网地址",
    localAddress: "本机地址",
    lan: "局域网",
    public: "公网",
    notConnected: "未连接",
    publicQrScan: "公网扫码访问",
    lanQrScan: "局域网扫码访问",
    publicQrDesc: "适用于远程连接，速度可能较慢",
    lanQrDesc: "确保手机和电脑连接同一 Wi-Fi",
  },

  // Session Sidebar
  sidebar: {
    noSessions: "暂无会话",
    newSession: "新建会话",
    deleteConfirm: "确定要删除这个会话吗？",
    deleteSession: "删除会话",
    justNow: "刚刚",
    minutesAgo: "{count}分钟前",
    hoursAgo: "{count}小时前",
    daysAgo: "{count}天前",
    files: "{count} 文件",
  },

  // Prompt Input
  prompt: {
    normalMode: "普通对话模式",
    normal: "普通",
    buildMode: "Build 模式 - 用于构建和编码任务",
    build: "Build",
    planMode: "Plan mode - 用于规划和设计任务",
    plan: "Plan",
    placeholder: "输入消息...",
    send: "发送消息",
  },

  // Model Selector
  model: {
    selectModel: "选择模型",
    noModels: "没有可用的模型，请先配置服务器",
  },

  // Message Parts
  parts: {
    linkToMessage: "跳转到此消息",
    thinking: "思考中",
    attachment: "附件",
    creatingPlan: "创建计划",
    updatingPlan: "更新计划",
    completingPlan: "完成计划",
    match: "{count} 匹配",
    matches: "{count} 匹配",
    result: "{count} 结果",
    results: "{count} 结果",
  },
};
