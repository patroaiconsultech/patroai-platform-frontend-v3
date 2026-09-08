import test from "node:test";
import assert from "node:assert/strict";
import {
  collectPublicRuntimeConfig,
  resolvePublicConfigValue,
  validatePublicConfigValue,
} from "../public-config.js";

test("backend upstream URL is not a public runtime configuration key", () => {
  for (const key of ["VITE_API_BASE_URL", "ORKIO_API_UPSTREAM_URL"]) {
    assert.deepEqual(
      validatePublicConfigValue(key, "https://api.example.test"),
      { ok: false, value: "", reason: "KEY_NOT_ALLOWLISTED" },
    );
  }
});

test("timeout must be a positive safe integer", () => {
  assert.deepEqual(
    validatePublicConfigValue("VITE_STREAM_TIMEOUT_MS", "300000"),
    { ok: true, value: "300000" },
  );
  assert.equal(validatePublicConfigValue("VITE_STREAM_TIMEOUT_MS", "-1").ok, false);
  assert.equal(validatePublicConfigValue("VITE_STREAM_TIMEOUT_MS", "abc").ok, false);
});

test("unknown public keys fail closed", () => {
  assert.deepEqual(
    validatePublicConfigValue("VITE_OIDC_SCOPE", "openid profile email"),
    { ok: false, value: "", reason: "KEY_NOT_ALLOWLISTED" },
  );
});

test("runtime wins for the remaining public timeout setting", () => {
  const runtimeWins = resolvePublicConfigValue(
    "VITE_STREAM_TIMEOUT_MS",
    { VITE_STREAM_TIMEOUT_MS: "30000" },
    { VITE_STREAM_TIMEOUT_MS: "60000" },
  );
  assert.equal(runtimeWins.ok, true);
  assert.equal(runtimeWins.source, "runtime");
  assert.equal(runtimeWins.value, "30000");

  const buildFallback = resolvePublicConfigValue(
    "VITE_STREAM_TIMEOUT_MS",
    {},
    { VITE_STREAM_TIMEOUT_MS: "60000" },
  );
  assert.equal(buildFallback.ok, true);
  assert.equal(buildFallback.source, "build");
  assert.equal(buildFallback.value, "60000");
});

test("invalid runtime timeout fails closed and never revives build fallback", () => {
  const resolved = resolvePublicConfigValue(
    "VITE_STREAM_TIMEOUT_MS",
    { VITE_STREAM_TIMEOUT_MS: "-1" },
    { VITE_STREAM_TIMEOUT_MS: "60000" },
  );
  assert.equal(resolved.source, "runtime");
  assert.equal(resolved.ok, false);
  assert.equal(resolved.value, "");
});

test("explicit empty optional runtime timeout overrides build fallback", () => {
  const resolved = resolvePublicConfigValue(
    "VITE_STREAM_TIMEOUT_MS",
    { VITE_STREAM_TIMEOUT_MS: "" },
    { VITE_STREAM_TIMEOUT_MS: "300000" },
  );
  assert.equal(resolved.source, "runtime");
  assert.equal(resolved.ok, true);
  assert.equal(resolved.value, "");
});

test("runtime collector serializes only timeout and never upstream URLs or secrets", () => {
  const { config, errors } = collectPublicRuntimeConfig({
    VITE_API_BASE_URL: "https://legacy-api.example.test",
    ORKIO_API_UPSTREAM_URL: "https://private-api.example.test",
    VITE_STREAM_TIMEOUT_MS: "300000",
    VITE_OIDC_CLIENT_ID: "client-123",
    OPENAI_API_KEY: "must-not-leak",
  });
  assert.deepEqual(Object.keys(config), ["VITE_STREAM_TIMEOUT_MS"]);
  assert.equal(config.VITE_STREAM_TIMEOUT_MS, "300000");
  assert.equal(errors.length, 0);
});
