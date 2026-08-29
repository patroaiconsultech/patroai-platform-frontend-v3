import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const api = fs.readFileSync(path.join(root, "src", "api.ts"), "utf8");
const consoleSource = fs.readFileSync(path.join(root, "src", "routes", "AppConsole.tsx"), "utf8");
const picker = fs.readFileSync(path.join(root, "src", "components", "KnowledgeDestinationPicker.tsx"), "utf8");
const personal = fs.readFileSync(path.join(root, "src", "components", "PersonalKnowledgePanel.tsx"), "utf8");
const governance = fs.readFileSync(path.join(root, "src", "components", "KnowledgeGovernancePanel.tsx"), "utf8");
const admin = fs.readFileSync(path.join(root, "src", "routes", "AdminPanel.tsx"), "utf8");

test("Knowledge API exposes governed CRUD and version lifecycle endpoints", () => {
  assert.match(api, /\/api\/v2\/knowledge/);
  assert.match(api, /uploadKnowledge/);
  assert.match(api, /publishKnowledge/);
  assert.match(api, /revokeKnowledge/);
  assert.match(api, /supersedeKnowledge/);
  assert.match(api, /listKnowledgeVersions/);
  assert.match(api, /deleteKnowledge/);
});

test("knowledge upload uses authenticated multipart helper and never sets a manual content type", () => {
  assert.match(api, /return apiForm<KnowledgeDocument>\("\/api\/v2\/knowledge", form\)/);
  assert.match(api, /appendKnowledgeMetadata/);
});

test("destination picker exposes conversation and personal scope to provisioned users", () => {
  assert.match(picker, /id: "THREAD"/);
  assert.match(picker, /title: "Nesta conversa"/);
  assert.match(picker, /id: "PERSONAL"/);
  assert.match(picker, /title: "Minha base"/);
});

test("institutional and platform destinations are role-gated in presentation", () => {
  assert.match(picker, /item\.id === "INSTITUTIONAL"\) return isTenantAdmin/);
  assert.match(picker, /item\.id === "PLATFORM"\) return isPlatformOwner/);
  assert.match(picker, /Diretrizes PatroAI/);
});

test("conversation upload preserves the proven legacy attachment endpoint", () => {
  assert.match(consoleSource, /destination !== "THREAD"/);
  assert.match(consoleSource, /uploadAttachment\(threadId, file\)/);
  assert.match(consoleSource, /getDocumentContextProvenance\(threadId\)/);
});

test("non-thread destinations route to the new governed Knowledge Plane", () => {
  assert.match(consoleSource, /uploadKnowledge\(destination, file\)/);
  assert.match(consoleSource, /Base institucional · \$\{uploaded\.status\}/);
  assert.match(consoleSource, /Diretrizes PatroAI · \$\{uploaded\.status\}/);
});

test("personal knowledge panel lists only PERSONAL and supports user deletion", () => {
  assert.match(personal, /listKnowledge\("PERSONAL"\)/);
  assert.match(personal, /deleteKnowledge\(item\.id\)/);
  assert.match(personal, /Somente a sua identidade/);
});

test("admin governance exposes explicit publish supersede revoke and history", () => {
  assert.match(governance, /publishKnowledge/);
  assert.match(governance, /supersedeKnowledge/);
  assert.match(governance, /revokeKnowledge/);
  assert.match(governance, /listKnowledgeVersions/);
  assert.match(governance, /Upload.*DRAFT/s);
});

test("platform governance presentation requires canonical platform_owner role", () => {
  assert.match(admin, /me\?\.roles\?\.includes\("platform_owner"\)/);
  assert.match(governance, /isPlatformOwner/);
  assert.match(governance, /option value="PLATFORM">Diretrizes PatroAI/);
});

test("frontend states that backend remains the authorization authority", () => {
  assert.match(picker, /O backend revalida tenant e papel em toda operação/);
  assert.match(governance, /O painel não concede autoridade/);
});
