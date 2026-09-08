export const PUBLIC_CONFIG_KEYS = Object.freeze([
  "VITE_STREAM_TIMEOUT_MS",
]);

const PUBLIC_CONFIG_KEY_SET = new Set(PUBLIC_CONFIG_KEYS);

function own(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function clean(raw) {
  return String(raw ?? "").trim();
}

function validTimeout(value) {
  if (!value) return { ok: true, value: "" };
  if (!/^\d+$/.test(value)) return { ok: false, value: "", reason: "TIMEOUT_NOT_INTEGER" };
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return { ok: false, value: "", reason: "TIMEOUT_OUT_OF_RANGE" };
  }
  return { ok: true, value: String(parsed) };
}

export function validatePublicConfigValue(key, raw) {
  if (!PUBLIC_CONFIG_KEY_SET.has(key)) {
    return { ok: false, value: "", reason: "KEY_NOT_ALLOWLISTED" };
  }
  const value = clean(raw);
  if (key === "VITE_STREAM_TIMEOUT_MS") return validTimeout(value);
  return { ok: false, value: "", reason: "VALIDATOR_MISSING" };
}

export function resolvePublicConfigValue(key, runtimeConfig = {}, buildConfig = {}) {
  const source = own(runtimeConfig, key) ? "runtime" : "build";
  const raw = source === "runtime" ? runtimeConfig[key] : buildConfig[key];
  const validated = validatePublicConfigValue(key, raw);
  return { ...validated, source };
}

export function collectPublicRuntimeConfig(env = {}) {
  const config = {};
  const errors = [];
  for (const key of PUBLIC_CONFIG_KEYS) {
    if (!own(env, key)) continue;
    const validated = validatePublicConfigValue(key, env[key]);
    if (validated.ok) {
      config[key] = validated.value;
    } else {
      config[key] = "";
      errors.push({ key, reason: validated.reason });
    }
  }
  return {
    config: Object.freeze(config),
    errors: Object.freeze(errors),
  };
}

export function runtimeEnvScript(config) {
  const serialized = JSON.stringify(config)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `window.__ORKIO_ENV__ = Object.freeze(${serialized});\n`;
}
