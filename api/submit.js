const FEISHU_BASE_URL = "https://open.feishu.cn";

let cachedToken = null;
let tokenExpiresAt = 0;

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    validatePayload(body);

    const token = await getTenantAccessToken();
    const appToken = mustEnv("FEISHU_APP_TOKEN");
    const tableId = mustEnv("FEISHU_TABLE_ID");
    const fields = buildFeishuFields(body);

    const createResult = await feishuRequest(
      "POST",
      `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
      token,
      { fields },
    );

    res.status(200).json({
      ok: true,
      submissionId: body.submissionId,
      recordId: createResult.data?.record?.record_id,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      ok: false,
      message: error.publicMessage || "提交失败，请稍后重试",
    });
  }
};

function setCors(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const origin = req.headers.origin || "";
  const allowOrigin = allowed.length === 0 || allowed.includes(origin) ? origin || "*" : allowed[0];
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function validatePayload(body) {
  if (!body || typeof body !== "object") {
    throw publicError(400, "提交内容为空");
  }
  if (!body.submissionId || !body.role || !body.answers) {
    throw publicError(400, "提交内容不完整");
  }
  if (body.introConsent !== true) {
    throw publicError(400, "请确认信息授权后再提交");
  }
  const answers = body.answers;
  for (const field of ["name", "wechat", "city", "decision_context", "matching_willingness", "public_profile"]) {
    if (!answers[field] || String(answers[field]).trim() === "") {
      throw publicError(400, "请补充必填项后再提交");
    }
  }
}

function buildFeishuFields(body) {
  const answers = body.answers || {};
  const roleLabel = body.roleLabel || body.role;
  return {
    提交ID: clean(body.submissionId),
    提交时间: clean(body.submittedAt),
    角色: clean(roleLabel),
    "姓名/昵称": clean(answers.name),
    微信号: clean(answers.wechat),
    手机号: clean(answers.phone),
    "公司/组织": clean(answers.org),
    "职位/身份": clean(answers.title || answers.decision_context),
    所在城市: clean(answers.city),
    所属行业: join(withOther(answers, "industry")),
    当前阶段: clean(
      answers["demand.stage"] ||
        answers["supply.capacity"] ||
        answers["resource.time_window"] ||
        answers["observer.future_role"],
    ),
    需求摘要: clean([answers["demand.problem"], answers["demand.goal"], answers["demand.success_metric"]].filter(Boolean).join("\n")),
    能力摘要: clean([answers["supply.offer_summary"], answers["supply.cases"], answers["supply.differentiator"]].filter(Boolean).join("\n")),
    资源摘要: clean([answers["resource.description"], answers["resource.scale"], answers["resource.expected_return"]].filter(Boolean).join("\n")),
    关键标签: join([
      ...withOther(answers, "demand.capabilities"),
      ...withOther(answers, "supply.capabilities"),
      ...withOther(answers, "resource.types"),
      ...withOther(answers, "observer.interests"),
      ...withOther(answers, "supply.industries"),
    ]),
    "预算/合作规模": clean(answers["demand.budget"] || answers["supply.min_budget"] || answers["resource.scale"]),
    "紧急度/时间窗口": clean(answers["demand.timeline"] || answers["resource.time_window"] || answers["supply.cycle"]),
    推荐方式: join(answers.matching_methods),
    公开授权: clean(answers.public_profile),
    原始JSON: clean(JSON.stringify(body, null, 2)),
    来源页面: clean(body.sourcePage),
    浏览器信息: clean(body.userAgent),
  };
}

async function getTenantAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  const response = await fetch(`${FEISHU_BASE_URL}/open-apis/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      app_id: mustEnv("FEISHU_APP_ID"),
      app_secret: mustEnv("FEISHU_APP_SECRET"),
    }),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 0) {
    throw new Error(`Feishu token error: ${JSON.stringify(data)}`);
  }
  cachedToken = data.tenant_access_token;
  tokenExpiresAt = Date.now() + Math.max(60, Number(data.expire || 3600) - 120) * 1000;
  return cachedToken;
}

async function feishuRequest(method, path, token, body) {
  const response = await fetch(`${FEISHU_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || data.code !== 0) {
    throw new Error(`Feishu API error: ${JSON.stringify(data)}`);
  }
  return data;
}

function mustEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env ${name}`);
  }
  return value;
}

function arr(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function withOther(answers, key) {
  return arr(answers[key]).map((item) => {
    if (item === "其他" && answers[`${key}__other`]) {
      return `其他：${answers[`${key}__other`]}`;
    }
    return item;
  });
}

function join(value) {
  return arr(value).filter(Boolean).join("，");
}

function clean(value) {
  return String(value || "").slice(0, 19000);
}

function publicError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}
