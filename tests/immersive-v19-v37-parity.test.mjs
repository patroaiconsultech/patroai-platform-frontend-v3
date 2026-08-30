import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("../src/landing/V37Immersive.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/landing/premium.css", import.meta.url), "utf8");
const landing = readFileSync(new URL("../src/routes/Landing.tsx", import.meta.url), "utf8");

test("V3.7 opens directly on the animated lobby with public anchors and private access", () => {
  for (const marker of ["#cocriacao", "#governanca", "#ecossistema", "#metodo", "#contato", "Acessar Plataforma", "patroai-v37-logo-loop.mp4"]) assert.match(component, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(component, /Entre pelo núcleo\.|Entrar com som|Entrar sem som/);
  assert.match(component, /autoPlay/);
  assert.match(component, /muted/);
  assert.match(component, /loop/);
  assert.match(component, /preload="metadata"/);
  assert.match(component, /onPrivateAccess/);
  assert.match(landing, /immersiveExperience: false/);
});

test("V3.7 reuses the first-party audio element without forcing playback at entry", () => {
  assert.match(component, /const toggleAudio/);
  assert.doesNotMatch(component, /audio\(\)\?\.play\(\)/);
});

test("V3.7 implementation protects mobile framing and reduced motion without embedded media", () => {
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(component, /data:video|data:image/);
});
