import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync(new URL("../src/api.ts", import.meta.url), "utf8");
const consoleSource = readFileSync(new URL("../src/routes/AppConsole.tsx", import.meta.url), "utf8");

test("agent catalog is backend-driven", () => {
  assert.match(api, /apiJson<unknown>\("\/api\/v2\/agents"\)/);
  assert.match(consoleSource, /await listAgents\(\)/);
  assert.doesNotMatch(consoleSource, /\["Orkio",\s*"Auditor"/);
});

test("ordinary-user Hyper Co-Criador keeps canonical orkio fallback", () => {
  assert.match(api, /export function technicalAgentTarget/);
  assert.match(api, /return `id:\$\{normalized\}`/);
  assert.match(consoleSource, /selectedAgent\.slug : "orkio"/);
  assert.match(consoleSource, /const DEFAULT_COCREATOR_LABEL = "Co-Criador"/);
  assert.match(consoleSource, /me\?\.co_creator_name \|\| DEFAULT_COCREATOR_LABEL/);
});

test("multi-agent catalog is admin-only while Team is selectable when the account is ready", () => {
  assert.match(consoleSource, /type ExecutionMode = "individual" \| "team"/);
  assert.match(consoleSource, /streamTeamMessage\(/);
  assert.match(consoleSource, /me\?\.admin_access && showAgents/);
  assert.match(consoleSource, /Selecionar formação Team governada/);
  assert.match(consoleSource, /disabled=\{!accountReady\}/);
});

test("participant invite remains a separate capability", () => {
  assert.match(consoleSource, /\+ Convidar/);
  assert.match(consoleSource, /setShowInvite\(true\)/);
});
