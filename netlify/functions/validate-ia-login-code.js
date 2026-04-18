const { timingSafeEqual } = require("node:crypto");

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function normalizeCode(value) {
  return String(value == null ? "" : value).trim();
}

function isDigitsOnly(value) {
  return /^\d+$/.test(value);
}

function safeEquals(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

const CONFIGURED_CODE = "6062";

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (_error) {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const submittedCode = normalizeCode(payload.code);
  const configuredCode = CONFIGURED_CODE;

  if (!isDigitsOnly(submittedCode)) {
    return json(400, { ok: false, error: "invalid_code" });
  }

  if (safeEquals(submittedCode, configuredCode)) {
    return json(200, { ok: true });
  }

  return json(401, { ok: false, error: "invalid_code" });
};
