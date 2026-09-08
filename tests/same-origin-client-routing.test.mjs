import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api = fs.readFileSync("src/api.ts", "utf8");
const server = fs.readFileSync("server.mjs", "utf8");
const publicConfig = fs.readFileSync("public-config.js", "utf8");
const vite = fs.readFileSync("vite.config.ts", "utf8");
const dockerfile = fs.readFileSync("Dockerfile", "utf8");
const boundary = fs.readFileSync("scripts/verify-package-boundary.mjs", "utf8");

test("browser API requests are constrained to same-origin /api paths", () => {
  assert.match(api, /const API_PREFIX = "\/api"/);
  assert.match(api, /function apiUrl\(path: string\)/);
  assert.match(api, /!path\.startsWith\(`\$\{API_PREFIX\}\/`\)/);
  assert.doesNotMatch(api, /VITE_API_BASE_URL/);
  assert.doesNotMatch(api, /https?:\/\/[^"'`\s]+/);
});

test("server proxy uses a private upstream configuration", () => {
  assert.match(server, /process\.env\.ORKIO_API_UPSTREAM_URL/);
  assert.match(server, /process\.env\.VITE_API_BASE_URL/);
  assert.match(server, /VITE_API_BASE_URL is deprecated as a server upstream/);
  assert.match(server, /function proxyApiRequest/);
  assert.match(server, /if \(isApiRequest\(pathname\)\)/);
});

test("runtime public config cannot expose API upstream URLs", () => {
  assert.doesNotMatch(publicConfig, /"VITE_API_BASE_URL"/);
  assert.doesNotMatch(publicConfig, /"ORKIO_API_UPSTREAM_URL"/);
  assert.match(publicConfig, /"VITE_STREAM_TIMEOUT_MS"/);
});

test("vite development server proxies /api without embedding the upstream in the browser bundle", () => {
  assert.match(vite, /loadEnv/);
  assert.match(vite, /ORKIO_API_UPSTREAM_URL/);
  assert.match(vite, /"\/api"/);
  assert.match(vite, /proxy/);
});

test("production build no longer accepts API upstream as a client build argument", () => {
  assert.doesNotMatch(dockerfile, /ARG VITE_API_BASE_URL/);
});

test("package boundary rejects the root API/test duplicates that caused source divergence", () => {
  assert.equal(fs.existsSync("api.ts"), false);
  assert.equal(fs.existsSync("same-origin-api-proxy.test.mjs"), false);
  assert.match(boundary, /"api\.ts"/);
  assert.match(boundary, /"same-origin-api-proxy\.test\.mjs"/);
});
