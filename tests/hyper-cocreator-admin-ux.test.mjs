import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync("src/routes/AppConsole.tsx", "utf8");
const admin = fs.readFileSync("src/routes/AdminPanel.tsx", "utf8");
const access = fs.readFileSync("src/routes/AccessPortal.tsx", "utf8");
const api = fs.readFileSync("src/api.ts", "utf8");

test("ordinary user remains single Hyper Co-Criador while admin may open internal agent catalog", () => {
  assert.match(app, /me\?\.admin_access && showAgents \? \(/);
  assert.match(app, /onClick=\{\(\) => setShowAgents\(true\)\}/);
  assert.match(
    app,
    /me\?\.admin_access && selectedAgent\?\.slug \? selectedAgent\.slug : "orkio"/,
  );
});

test("co-creator can be renamed and ordinary-user target remains canonical orkio", () => {
  assert.match(api, /\/api\/v2\/me\/co-creator/);
  assert.match(app, /Renomear Co-Criador/);
  assert.match(app, /selectedAgent\.slug : "orkio"/);
});

test("admin panel loads canonical admin agents teams users governance and security contracts", () => {
  assert.match(admin, /getAdminAgents\(\)/);
  assert.match(admin, /getAdminTeams\(\)/);
  assert.match(admin, /getAdminUsers\(\)/);
  assert.match(admin, /getAdminGovernance\(\)/);
  assert.match(admin, /getAdminSecurityStatus\(\)/);
  assert.match(admin, /PAINEL DIGITAL DE OPERAÇÕES/);
});

test("access portal surfaces access gate configuration failure", () => {
  assert.match(access, /ACCESS_GATE_DISABLED/);
  assert.match(access, /ACCESS_CODE_INVALID/);
});

test("persisted agent authorship remains canonical regardless of current Hyper selection", () => {
  assert.doesNotMatch(app, /const AGENT = "Josué"/);

  const visibleAuthorMatch = app.match(
    /const visibleAgentAuthor = \(itemAgentName\?: string \| null\) =>\s*([\s\S]*?);/,
  );

  assert.ok(visibleAuthorMatch);
  assert.match(
    visibleAuthorMatch[1],
    /itemAgentName\?\.trim\(\) \|\| "Agente"/,
  );
  assert.doesNotMatch(
    visibleAuthorMatch[1],
    /me\?\.admin_access/,
  );
  assert.doesNotMatch(
    visibleAuthorMatch[1],
    /selectedAgentName/,
  );

  assert.match(app, /\{executionTargetName\}/);
});

test("admin catalog is role-aware and explicit agent selection is wired to the stream target", () => {
  assert.match(
    app,
    /setAgents\(me\?\.admin_access \? catalog : hyper \? \[hyper\] : \[\]\)/,
  );
  assert.match(app, /setSelectedAgent\(agent\)/);
  assert.match(
    app,
    /technicalAgentTarget\([\s\S]*selectedAgent\?\.slug[\s\S]*"orkio"/,
  );
  assert.match(app, /Selecionar formação Team governada/);
  assert.match(app, /disabled=\{!accountReady\}/);
});
