import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync(new URL("../src/routes/AppConsole.tsx", import.meta.url), "utf8");
const presence = readFileSync(
  new URL("../src/components/ImmersivePresencePanel.tsx", import.meta.url),
  "utf8",
);
const css = readFileSync(new URL("../src/console-immersive.css", import.meta.url), "utf8");
const boundary = readFileSync(
  new URL("../scripts/verify-package-boundary.mjs", import.meta.url),
  "utf8",
);

test("immersive console preserves runtime-driven Realtime and Voice controls", () => {
  assert.match(app, /ImmersivePresencePanel/);
  assert.match(app, /onRealtimeToggle=\{handleRealtimeButton\}/);
  assert.match(app, /onVoiceToggle=\{handleVoiceButton\}/);
  assert.match(presence, /runtimeProven/);
  assert.match(presence, /ownershipLocked/);
  assert.match(presence, /realtimeReady/);
});

test("presence layer never claims runtime ownership", () => {
  assert.match(
    presence,
    /A presença visual reflete o estado do runtime; ela nunca substitui tenant,\s*autoria, ownership ou persistência\./,
  );
  assert.doesNotMatch(presence, /setSelectedAgent|persistAgentResponse|tenant_id=/);
});

test("immersive console has desktop presence and mobile fallback", () => {
  assert.match(css, /grid-template-columns:\s*248px minmax\(0,\s*1fr\) 304px/);
  assert.match(css, /@media \(max-width: 1179px\)/);
  assert.match(css, /\.immersive-presence\s*\{\s*display:\s*none/);
  assert.match(css, /prefers-reduced-motion/);
});

test("frontend boundary gate blocks backend-only root artifacts", () => {
  for (const name of [
    "005_legacy_claim_on_demand.py",
    "alembic.ini",
    "conftest.py",
    "pyproject.toml",
    "requirements-test.lock.txt",
    "requirements.lock.txt",
    "uv.lock",
  ]) {
    assert.match(boundary, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
