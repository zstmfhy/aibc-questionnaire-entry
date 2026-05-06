const STORAGE_KEY = "aibc-survey-draft-v1";
const API_ENDPOINT = window.AIBC_SURVEY_API_ENDPOINT || "/api/submit";
const IS_STATIC_PREVIEW = location.hostname.endsWith("github.io") && !window.AIBC_SURVEY_API_ENDPOINT;

const roles = [
  {
    id: "demand",
    title: "需求方",
    subtitle: "我有业务问题或项目计划，正在寻找AI方案、产品或服务。",
  },
  {
    id: "supply",
    title: "供给方",
    subtitle: "我能提供AI产品、技术、咨询、交付、培训或行业方案。",
  },
  {
    id: "both",
    title: "供需两者",
    subtitle: "我既有业务需求，也有能力或产品可以对外输出。",
  },
  {
    id: "resource",
    title: "资源方",
    subtitle: "我提供资金、渠道、客户、算力、数据、园区、政策或媒体资源。",
  },
  {
    id: "observer",
    title: "观望/学习",
    subtitle: "我先了解生态、寻找方向，暂时没有明确供需或资源输出。",
  },
];

const industries = [
  "金融/保险",
  "教育/培训",
  "医疗/健康",
  "制造/工业",
  "零售/电商",
  "物流/供应链",
  "政务/公共事业",
  "法律咨询",
  "媒体/广告/内容",
  "能源/环保",
  "交通/出行",
  "餐饮/酒店/旅游",
  "房地产/建筑",
  "SaaS/互联网",
  "跨境/出海",
  "其他",
];

const capabilityOptions = [
  "数据分析/BI",
  "RAG知识库/企业搜索",
  "AI Agent/智能体",
  "工作流自动化",
  "AI应用开发",
  "系统集成/定制开发",
  "大模型微调/私有化部署",
  "智能客服/销售助手",
  "内容生成：文案/图片/视频/音频",
  "AI数字人/虚拟主播",
  "AI培训/组织赋能",
  "算力/云服务/基础设施",
  "数据治理/标注",
  "行业咨询/规划",
  "其他",
];

const commonQuestions = [
  q("name", "姓名/昵称", "text", { required: true }),
  q("wechat", "微信号", "text", { required: true, help: "用于匹配结果推送和一对一撮合。" }),
  q("phone", "手机号", "tel", { help: "用于账号去重和紧急联系，可选。" }),
  q("org", "公司/组织/个人品牌", "text"),
  q("title", "职位/身份", "text", { help: "例如：创始人、产品负责人、业务负责人、独立开发者、投资人。" }),
  q("city", "所在城市", "text", { required: true }),
  q("industry", "所属行业", "checkbox", { required: true, options: industries }),
  q("intro", "请用一句话介绍您或您所在组织", "textarea", {
    help: "这会帮助运营快速判断您的背景和匹配语境。",
  }),
  q("decision_context", "您在相关合作中的位置", "radio", {
    required: true,
    options: ["最终决策者", "项目负责人", "核心执行者", "评估/推荐者", "资源连接者", "学习了解中"],
  }),
];

const demandQuestions = [
  q("demand.stage", "您的AI需求目前处于哪个阶段？", "radio", {
    required: true,
    options: [
      "刚发现问题，想判断AI是否适合",
      "正在调研方案和供应商",
      "内部已立项/有负责人",
      "正在选型，希望尽快看Demo",
      "已有方案，想升级/替换/补充",
      "已采购或自研，想找生态伙伴",
    ],
  }),
  q("demand.problem", "当前最想解决的业务问题是什么？", "textarea", {
    required: true,
    help: "请尽量写清业务场景、现有流程、卡点和影响。",
  }),
  q("demand.users", "谁会使用这个AI方案？使用规模大概是多少？", "text", {
    help: "例如：20名客服、300名销售、全公司知识库、面向10万C端用户。",
  }),
  q("demand.goal", "您希望AI方案带来什么明确结果？", "textarea", {
    required: true,
    help: "例如：降低人力成本、提升转化率、缩短处理时长、沉淀知识资产。",
  }),
  q("demand.success_metric", "怎样算这个项目成功？", "text", {
    help: "例如：准确率达到90%、客服响应减少50%、每月节省30人天。",
  }),
  q("demand.capabilities", "您大概率需要哪些AI能力？", "checkbox", {
    required: true,
    options: capabilityOptions,
  }),
  q("demand.data", "当前可用的数据/知识资产有哪些？", "checkbox", {
    options: [
      "结构化业务数据",
      "文档/制度/知识库",
      "客服/销售/运营对话记录",
      "图片/视频/音频素材",
      "业务系统/API数据",
      "外部公开数据",
      "暂不清楚，需要供应商梳理",
      "基本没有，需要从0开始",
    ],
  }),
  q("demand.security", "数据安全和部署偏好", "radio", {
    required: true,
    options: ["必须私有化/本地部署", "可接受混合部署", "可接受SaaS云端", "暂不确定，需要评估"],
  }),
  q("demand.integration", "是否需要对接现有系统？", "checkbox", {
    options: ["CRM", "ERP", "OA/飞书/企业微信", "客服系统", "电商/订单系统", "数据仓库/BI", "自研系统/API", "暂不需要", "不确定"],
  }),
  q("demand.timeline", "期望推进节奏", "radio", {
    required: true,
    options: ["1周内想先聊清楚", "1个月内要看到Demo/方案", "1-2个月内完成选型", "3个月内验证可行性", "长期规划，暂不紧急"],
  }),
  q("demand.budget", "预算或可接受合作规模", "radio", {
    required: true,
    options: ["先了解行情", "1万元以下", "1-5万元", "5-20万元", "20-100万元", "100万元以上", "按效果付费/分成"],
  }),
  q("demand.internal_resources", "内部可配合资源", "radio", {
    options: ["只有我一个人推动", "有1-3人小团队", "有项目组/IT支持", "高层重视且资源充足", "暂不确定"],
  }),
  q("demand.blockers", "当前最大的顾虑是什么？", "checkbox", {
    options: ["ROI不清楚", "数据安全/合规", "效果不达预期", "内部缺AI人才", "系统对接复杂", "供应商不靠谱", "预算审批难", "技术变化太快", "其他"],
  }),
  q("demand.vendor_preference", "您希望匹配什么样的供给方？", "checkbox", {
    options: ["成熟SaaS产品", "定制开发团队", "行业解决方案公司", "独立开发者/小团队", "咨询顾问", "培训机构", "能联合共创的伙伴"],
  }),
  q("demand.materials", "是否有补充材料或链接？", "textarea", {
    help: "可放需求文档、业务流程、竞品链接、现有系统说明等。",
  }),
];

const supplyQuestions = [
  q("supply.entity_type", "您的供给主体类型", "radio", {
    required: true,
    options: ["公司", "创业团队", "独立开发者/自由职业", "高校/研究机构", "企业内部团队对外合作", "其他"],
  }),
  q("supply.team_size", "团队规模", "radio", {
    options: ["1人", "2-5人", "6-20人", "21-50人", "50人以上"],
  }),
  q("supply.offer_summary", "请用3句话说清楚您能交付什么", "textarea", {
    required: true,
    help: "建议包含：服务对象、核心能力、交付结果。",
  }),
  q("supply.capabilities", "核心能力标签", "checkbox", {
    required: true,
    options: capabilityOptions,
  }),
  q("supply.industries", "最有经验或最想服务的行业", "checkbox", {
    required: true,
    options: industries,
  }),
  q("supply.customer_profile", "什么样的客户最适合找您？", "textarea", {
    help: "例如行业、规模、预算、数据成熟度、典型痛点。",
  }),
  q("supply.cases", "请简述1-3个代表案例", "textarea", {
    required: true,
    help: "客户可脱敏，但请尽量写清问题、方案、结果。",
  }),
  q("supply.stack", "主要技术栈/模型路线", "checkbox", {
    options: ["OpenAI/GPT", "Claude/Anthropic", "通义千问", "文心一言", "智谱/ChatGLM", "讯飞星火", "Llama/Mistral等开源模型", "自研模型", "不限模型按场景选择", "其他"],
  }),
  q("supply.delivery_mode", "可提供的合作模式", "checkbox", {
    required: true,
    options: ["SaaS订阅", "项目制交付", "PoC/Demo验证", "驻场/外包人力", "远程技术支持", "培训/内训", "渠道代理", "联合运营/分成", "技术入股"],
  }),
  q("supply.cycle", "典型交付周期", "radio", {
    options: ["1周内MVP/Demo", "1-4周标准交付", "1-3个月深度定制", "6个月以上长期陪跑", "视项目而定"],
  }),
  q("supply.min_budget", "适合您的最低合作规模", "radio", {
    required: true,
    options: ["1万元以下也可", "1-5万元", "5-20万元", "20-100万元", "100万元以上", "更偏分成/联合运营"],
  }),
  q("supply.capacity", "当前可承接能力", "radio", {
    options: ["本周可聊且可快速启动", "本月可承接1-2个项目", "只接高匹配项目", "目前主要找渠道/伙伴", "暂时展示能力，后续再接"],
  }),
  q("supply.after_sales", "售后和保障方式", "checkbox", {
    options: ["工作日在线支持", "7×24支持", "专属客户成功", "文档/社群自助", "合同SLA", "按项目另议"],
  }),
  q("supply.differentiator", "您和同类供给方相比最大的差异是什么？", "textarea"),
  q("supply.collab_needs", "您在AIBC最希望获得什么？", "checkbox", {
    options: ["精准客户线索", "联合交付伙伴", "渠道/代理商", "投资人/融资对接", "品牌曝光", "行业需求反馈", "政策/资质咨询", "技术合作"],
  }),
  q("supply.links", "官网/产品/作品集/GitHub/案例链接", "textarea"),
];

const resourceQuestions = [
  q("resource.types", "您能提供哪些资源？", "checkbox", {
    required: true,
    options: ["资金/投资", "客户线索", "渠道/代理", "算力/云资源", "数据资源", "媒体/品牌曝光", "园区/政策", "专家/顾问", "场地/活动", "其他"],
  }),
  q("resource.description", "请具体描述资源内容和可用边界", "textarea", {
    required: true,
    help: "例如资源规模、覆盖行业、可触达对象、使用限制。",
  }),
  q("resource.scale", "资源规模或合作量级", "text", {
    help: "例如：可投额度、渠道覆盖、客户数量、算力额度、媒体矩阵规模。",
  }),
  q("resource.targets", "您希望优先连接哪类对象？", "checkbox", {
    required: true,
    options: ["需求方企业", "AI供给方", "创业项目", "投资机构", "渠道伙伴", "政府/园区", "高校/研究机构"],
  }),
  q("resource.cooperation", "您偏好的合作方式", "checkbox", {
    options: ["投资", "采购", "分成", "资源置换", "渠道代理", "联合活动", "联合孵化", "公益支持", "另议"],
  }),
  q("resource.focus", "资源更适合哪些行业/地区/阶段？", "textarea"),
  q("resource.requirements", "您对被推荐对象有什么门槛？", "textarea", {
    help: "例如营收阶段、案例要求、资质要求、地域、合规要求。",
  }),
  q("resource.time_window", "资源可投入时间窗口", "radio", {
    options: ["随时可对接", "1个月内", "1-3个月内", "长期有效", "视项目而定"],
  }),
  q("resource.expected_return", "您期待获得什么回报？", "checkbox", {
    options: ["财务回报", "项目分成", "战略合作", "品牌曝光", "优质项目管道", "生态影响力", "学习市场", "暂不明确"],
  }),
  q("resource.examples", "是否有过往资源合作案例？", "textarea"),
];

const observerQuestions = [
  q("observer.interests", "您最关注AI生态中的哪些方向？", "checkbox", {
    required: true,
    options: capabilityOptions,
  }),
  q("observer.learning_goal", "您希望通过AIBC获得什么？", "textarea", {
    required: true,
    help: "例如学习案例、找方向、认识同行、观察投资机会、为公司做准备。",
  }),
  q("observer.future_role", "未来您最可能转成哪种角色？", "radio", {
    options: ["需求方", "供给方", "资源方", "推荐人/连接者", "暂不确定"],
  }),
  q("observer.participation", "您愿意如何参与？", "checkbox", {
    options: ["参加线上分享", "参加线下活动", "旁听撮合会", "贡献案例/经验", "推荐朋友加入", "暂时只看信息"],
  }),
  q("observer.can_help", "即使暂时观望，您有什么可以贡献的？", "textarea"),
  q("observer.topics", "您最希望社群优先组织哪些主题？", "textarea"),
];

const finalQuestions = [
  q("matching_willingness", "是否愿意被平台主动推荐对接？", "radio", {
    required: true,
    options: ["非常愿意，积极撮合", "看情况，先了解对方背景", "暂时不需要，先观望"],
  }),
  q("matching_methods", "您接受哪些推荐方式？", "checkbox", {
    required: true,
    options: ["运营微信私聊", "拉小群沟通", "线上撮合会", "线下闭门会", "社群公开@介绍", "自助匹配看板"],
  }),
  q("availability", "您可投入的参与程度", "radio", {
    required: true,
    options: ["轻度：填完等机会", "中度：愿意参加线上活动", "深度：愿意参与共建和规则制定"],
  }),
  q("public_profile", "是否同意展示脱敏后的基础信息？", "radio", {
    required: true,
    options: ["同意展示行业、城市、能力/需求标签", "不同意，仅允许运营私下撮合"],
  }),
  q("notes", "其他建议或补充", "textarea"),
  q("consent", "信息确认", "checkbox", {
    required: true,
    options: ["我确认填写信息真实有效，并同意AIBC共赢社用于内部供需匹配"],
  }),
];

const sections = {
  role: {
    id: "role",
    kicker: "Step 01",
    title: "先确认您的身份",
    desc: "后续问题会根据身份动态变化。若您既有需求也能提供服务，请选择供需两者。",
  },
  common: {
    id: "common",
    kicker: "基础信息",
    title: "先让运营知道该如何联系和判断背景",
    desc: "这些信息用于去重、标签化和后续撮合，不会对外公开完整联系方式。",
    questions: commonQuestions,
  },
  demand: {
    id: "demand",
    kicker: "需求诊断",
    title: "把真实业务问题讲清楚",
    desc: "我们会根据问题成熟度、预算、数据情况和落地约束，判断适合推荐哪类供给方。",
    questions: demandQuestions,
  },
  supply: {
    id: "supply",
    kicker: "供给画像",
    title: "让需求方知道您能交付什么",
    desc: "重点不是堆技术名词，而是清楚说明适合服务谁、解决什么问题、结果如何证明。",
    questions: supplyQuestions,
  },
  resource: {
    id: "resource",
    kicker: "资源画像",
    title: "明确资源边界和合作方式",
    desc: "资源方的价值在于精准连接。请尽量写清资源类型、规模、约束和期望回报。",
    questions: resourceQuestions,
  },
  observer: {
    id: "observer",
    kicker: "观望意愿",
    title: "告诉我们您想观察什么",
    desc: "即使暂时没有明确供需，也可以通过兴趣标签获得更合适的活动和信息推荐。",
    questions: observerQuestions,
  },
  final: {
    id: "final",
    kicker: "匹配授权",
    title: "最后确认匹配方式",
    desc: "这些设置会影响运营是否主动推荐、如何介绍您，以及哪些信息可以脱敏展示。",
    questions: finalQuestions,
  },
};

let state = loadDraft();
let activeIndex = 0;

const form = document.querySelector("#survey-form");
const root = document.querySelector("#form-root");
const stepsEl = document.querySelector("#steps");
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const submitBtn = document.querySelector("#submit-btn");
const statusEl = document.querySelector("#status");
const previewBanner = document.querySelector("#preview-banner");

if (previewBanner && IS_STATIC_PREVIEW) {
  previewBanner.hidden = false;
}
render();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status("");
  const active = getActiveSections()[activeIndex];
  const errors = validateSection(active);
  if (errors.length) {
    status(errors[0]);
    return;
  }
  await submitSurvey();
});

prevBtn.addEventListener("click", () => {
  if (activeIndex > 0) {
    activeIndex -= 1;
    render();
  }
});

nextBtn.addEventListener("click", () => {
  status("");
  const active = getActiveSections()[activeIndex];
  const errors = validateSection(active);
  if (errors.length) {
    status(errors[0]);
    return;
  }
  const sectionsList = getActiveSections();
  if (activeIndex < sectionsList.length - 1) {
    activeIndex += 1;
    render();
  }
});

root.addEventListener("input", handleInput);
root.addEventListener("change", handleInput);

function q(id, label, type, config = {}) {
  return { id, label, type, ...config };
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { role: "", answers: {} };
  } catch {
    return { role: "", answers: {} };
  }
}

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveSections() {
  const items = [sections.role];
  if (state.role) items.push(sections.common);
  if (state.role === "demand" || state.role === "both") items.push(sections.demand);
  if (state.role === "supply" || state.role === "both") items.push(sections.supply);
  if (state.role === "resource") items.push(sections.resource);
  if (state.role === "observer") items.push(sections.observer);
  if (state.role) items.push(sections.final);
  return items;
}

function render() {
  const activeSections = getActiveSections();
  activeIndex = Math.min(activeIndex, activeSections.length - 1);
  renderSteps(activeSections);
  renderSection(activeSections[activeIndex]);
  prevBtn.disabled = activeIndex === 0;
  nextBtn.style.display = activeIndex === activeSections.length - 1 ? "none" : "inline-flex";
  submitBtn.style.display = activeIndex === activeSections.length - 1 && state.role ? "inline-flex" : "none";
  status("");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSteps(activeSections) {
  stepsEl.innerHTML = activeSections
    .map(
      (section, index) => `
        <div class="step ${index === activeIndex ? "active" : ""}">
          <span>${index + 1}</span>
          <span>${section.title}</span>
        </div>
      `,
    )
    .join("");
}

function renderSection(section) {
  if (section.id === "role") {
    root.innerHTML = `
      ${sectionHeader(section)}
      <div class="roles">
        ${roles
          .map(
            (role) => `
              <label class="role-card">
                <input type="radio" name="role" value="${role.id}" ${state.role === role.id ? "checked" : ""} />
                <span class="role-body">
                  <strong>${role.title}</strong>
                  <span>${role.subtitle}</span>
                </span>
              </label>
            `,
          )
          .join("")}
      </div>
    `;
    return;
  }

  root.innerHTML = `
    ${sectionHeader(section)}
    <div class="questions">
      ${section.questions.map(renderQuestion).join("")}
    </div>
  `;
}

function sectionHeader(section) {
  return `
    <p class="section-kicker">${section.kicker}</p>
    <h2 class="section-title">${section.title}</h2>
    <p class="section-desc">${section.desc}</p>
  `;
}

function renderQuestion(question) {
  const value = state.answers[question.id] ?? (question.type === "checkbox" ? [] : "");
  const required = question.required ? '<span class="required">*</span>' : "";
  const help = question.help ? `<p class="help">${question.help}</p>` : "";
  return `
    <div class="question">
      <label class="title" for="${question.id}">${question.label} ${required}</label>
      ${help}
      ${renderControl(question, value)}
    </div>
  `;
}

function renderControl(question, value) {
  if (question.type === "textarea") {
    return `<textarea id="${question.id}" name="${question.id}" placeholder="请填写...">${escapeHtml(value)}</textarea>`;
  }
  if (question.type === "radio" || question.type === "checkbox") {
    const values = Array.isArray(value) ? value : [value];
    return `
      <div class="options">
        ${question.options
          .map((option) => {
            const checked = values.includes(option) ? "checked" : "";
            return `
              <label class="option">
                <input type="${question.type}" name="${question.id}" value="${escapeHtml(option)}" ${checked} />
                <span>${option}</span>
              </label>
            `;
          })
          .join("")}
      </div>
    `;
  }
  return `<input id="${question.id}" name="${question.id}" type="${question.type}" value="${escapeHtml(value)}" placeholder="请填写..." />`;
}

function handleInput(event) {
  const target = event.target;
  if (!target.name) return;

  if (target.name === "role") {
    state.role = target.value;
    activeIndex = 0;
    saveDraft();
    render();
    return;
  }

  if (target.type === "checkbox") {
    const selected = [...root.querySelectorAll(`input[name="${cssEscape(target.name)}"]:checked`)].map((item) => item.value);
    state.answers[target.name] = selected;
  } else if (target.type === "radio") {
    state.answers[target.name] = target.value;
  } else {
    state.answers[target.name] = target.value;
  }
  saveDraft();
}

function validateSection(section) {
  if (section.id === "role") {
    return state.role ? [] : ["请先选择您的角色。"];
  }
  const errors = [];
  for (const question of section.questions || []) {
    if (!question.required) continue;
    const value = state.answers[question.id];
    const empty = Array.isArray(value) ? value.length === 0 : !String(value || "").trim();
    if (empty) errors.push(`请填写：${question.label}`);
  }
  return errors;
}

async function submitSurvey() {
  if (IS_STATIC_PREVIEW) {
    status("当前是静态预览页，提交接口尚未部署；请部署后端后再正式收集。");
    return;
  }
  const payload = buildPayload();
  submitBtn.disabled = true;
  status("正在提交，请稍候...");
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.message || `提交失败：${response.status}`);
    }
    localStorage.removeItem(STORAGE_KEY);
    root.innerHTML = `
      <div class="success">
        <h2>提交成功</h2>
        <p>我们会在3个工作日内完成信息审核和初步标签化。匹配结果将通过您预留的微信推送。</p>
        <p>建议添加AI奶爸微信：ZST321456，备注：AIBC+您的姓名。</p>
        <p>提交编号：${data.submissionId || payload.submissionId}</p>
      </div>
    `;
    stepsEl.innerHTML = "";
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
    submitBtn.style.display = "none";
    status("");
  } catch (error) {
    status(error.message || "提交失败，请稍后重试。");
    submitBtn.disabled = false;
  }
}

function buildPayload() {
  const submissionId = `aibc_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  return {
    submissionId,
    submittedAt: new Date().toISOString(),
    role: state.role,
    roleLabel: roles.find((role) => role.id === state.role)?.title || state.role,
    answers: state.answers,
    sourcePage: window.location.href,
    userAgent: navigator.userAgent,
  };
}

function status(message) {
  statusEl.textContent = message || "";
  statusEl.style.color = message && message.includes("正在") ? "var(--muted)" : "var(--danger)";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cssEscape(value) {
  if (window.CSS && CSS.escape) return CSS.escape(value);
  return String(value).replaceAll('"', '\\"');
}
