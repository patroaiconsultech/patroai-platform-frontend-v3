import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync(new URL("../src/api.ts", import.meta.url), "utf8");
const navigator = readFileSync(new URL("../src/components/KnowledgeNavigator.tsx", import.meta.url), "utf8");
const personal = readFileSync(new URL("../src/components/PersonalKnowledgePanel.tsx", import.meta.url), "utf8");
const governance = readFileSync(new URL("../src/components/KnowledgeGovernancePanel.tsx", import.meta.url), "utf8");

test("knowledge navigator uses bounded B2 APIs", () => {
  assert.match(api, /getKnowledgeStructure/);
  assert.match(api, /processKnowledgeDocument/);
  assert.match(api, /saveKnowledgeSelection/);
  assert.match(api, /getKnowledgeContent/);
  assert.match(navigator, /Modo automático/);
  assert.match(navigator, /Seleção manual/);
  assert.match(navigator, /getKnowledgeContent\(documentId, ids, 40_000\)/);
});

test("knowledge panels expose Navigator without changing conversation attachments", () => {
  assert.match(personal, /KnowledgeNavigator/);
  assert.match(personal, /Navegar/);
  assert.match(governance, /KnowledgeNavigator/);
  assert.match(governance, /Navegar/);
});
