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
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(component, /data:video|data:image/);
});


test("V3.7.1 is starfield-only and removes the decorative orbital geometry", () => {
  assert.doesNotMatch(component, /v37-lobby__orbit/);
  assert.doesNotMatch(css, /\.v37-lobby__orbit/);
  for (const marker of [
    "v37-stars--base",
    "v37-stars--low",
    "v37-stars--mid",
    "v37-stars--high",
    "v371StarsLow",
    "v371StarsMid",
    "v371StarsHigh",
  ]) {
    assert.match(css + component, new RegExp(marker));
  }
});

test("V3.7.1 keeps the video mounted through a governed exit transition", () => {
  assert.match(component, /type Stage = "lobby" \| "exiting" \| "content"/);
  assert.match(component, /EXIT_DURATION_MS = 820/);
  assert.match(component, /setStage\("exiting"\)/);
  assert.match(component, /finishContentExit/);
  assert.match(css, /\.v37-immersive--exiting/);
  assert.match(css, /Cinematic hand-off/);
  assert.doesNotMatch(component, /setStage\("content"\);[\s\S]{0,120}setTimeout[\s\S]{0,120}60/);
});

test("V3.7.1 dissolves the 16:9 media into the environment instead of a hard circular crop", () => {
  assert.match(css, /\.v37-core \{[\s\S]*aspect-ratio: 16 \/ 9/);
  assert.match(css, /\.v37-core video \{[\s\S]*mask-image: radial-gradient/);
  assert.doesNotMatch(css, /\.v37-core \{[\s\S]{0,450}border-radius:\s*50%/);
  assert.match(component, /role="img"/);
});

test("V3.7.1 keeps private access, reduced-motion and compact mobile layout intact", () => {
  assert.match(component, /enterPrivateAccess/);
  assert.match(component, /void onPrivateAccess\(\)/);
  assert.match(component, /prefersReducedMotion/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0,1fr\)\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
