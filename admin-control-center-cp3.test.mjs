import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api = fs.readFileSync(new URL("../src/api.ts", import.meta.url), "utf8");
const admin = fs.readFileSync(new URL("../src/routes/AdminPanel.tsx", import.meta.url), "utf8");
const immersive = fs.readFileSync(new URL("../src/console-immersive.css", import.meta.url), "utf8");

test("CP3-A keeps desktop shell fluid and collapses presence before it can overflow", () => {
  assert.match(immersive, /grid-template-columns:\s*248px minmax\(0,\s*1fr\) 304px/);
  assert.match(immersive, /@media \(min-width: 1180px\) and \(max-width: 1519px\)/);
  assert.match(immersive, /grid-template-columns:\s*248px minmax\(0,\s*1fr\)/);
  assert.match(immersive, /overflow-x:\s*clip/);
  assert.match(immersive, /\.message[\s\S]*overflow-wrap:\s*anywhere/);
});

test("CP3-A keeps composer anchored at the bottom without imposing a fixed main width", () => {
  assert.match(immersive, /\.console-shell--immersive \.composer[\s\S]*position:\s*sticky/);
  assert.match(immersive, /bottom:\s*0/);
  const cp3 = immersive.split("/* ORKIO UX Foundation — CP3-A viewport framing correction")[1] || "";
  assert.match(cp3, /grid-template-columns:\s*248px minmax\(0,\s*1fr\) 304px/);
  assert.doesNotMatch(cp3, /var\(--console-focus-max\)/);
});

test("admin runtime surface uses real health and readiness contracts", () => {
  assert.match(api, /getRuntimeHealth[\s\S]*\/api\/v2\/health/);
  assert.match(api, /getRuntimeReadiness[\s\S]*\/api\/v2\/ready/);
  assert.match(admin, /view === "runtime"/);
  assert.match(admin, /migration_current/);
  assert.match(admin, /runtimeHealth\?\.sha/);
});

test("voice assignment uses the proven admin PUT contract and explicit confirmation", () => {
  assert.match(api, /updateAdminAgentVoiceAssignment/);
  assert.match(api, /\/api\/v2\/admin\/agents\/\$\{encodeURIComponent\(agentSlug\)\}\/voice-assignment/);
  assert.match(admin, /window\.confirm/);
  assert.match(admin, /Criar vínculo em DRAFT/);
  assert.match(admin, /curation_status === "APPROVED"/);
});
