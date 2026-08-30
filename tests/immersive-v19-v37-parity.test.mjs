import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("../src/landing/V37Immersive.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/landing/premium.css", import.meta.url), "utf8");
const landing = readFileSync(new URL("../src/routes/Landing.tsx", import.meta.url), "utf8");

test("V3.7 gate preserves opt-in sound, silent entry, public anchors and private access", () => {
  for (const marker of ["Entre pelo núcleo.", "Entrar com som", "Entrar sem som", "#cocriacao", "#governanca", "#ecossistema", "#metodo", "#contato", "Acessar Plataforma"]) assert.match(component, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(component, /audio\(\)\?\.play\(\)/);
  assert.match(component, /onPrivateAccess/);
  assert.match(landing, /immersiveExperience: false/);
});

test("V3.7 implementation protects mobile framing and reduced motion without embedded media", () => {
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(component, /data:video|data:image/);
});
