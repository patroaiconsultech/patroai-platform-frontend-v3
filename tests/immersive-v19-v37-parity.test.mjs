import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("../src/landing/V37Immersive.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/landing/premium.css", import.meta.url), "utf8");
const landing = readFileSync(new URL("../src/routes/Landing.tsx", import.meta.url), "utf8");

test("V3.8 gates the animated lobby before public anchors and private access", () => {
  for (const marker of ["#cocriacao", "#governanca", "#ecossistema", "#metodo", "#contato", "Acessar Plataforma", "patroai-v37-logo-loop.mp4"]) assert.match(component, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(component, /Esta é uma página imersiva\./);
  assert.match(component, /Entrar com som/);
  assert.match(component, /Entrar sem som/);
  assert.match(component, /autoPlay/);
  assert.match(component, /muted/);
  assert.match(component, /loop/);
  assert.match(component, /preload="metadata"/);
  assert.match(component, /onPrivateAccess/);
});

test("V3.8.1 starts first-party audio directly after explicit user consent", () => {
  assert.match(component, /const enterImmersive = async \(withSound: boolean\)/);
  assert.match(component, /getImmersiveAudio/);
  assert.match(component, /const playPromise = track\.play\(\)/);
  assert.match(component, /const toggleAudio/);
  assert.doesNotMatch(component, /immersiveSoundEntry/);
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

test("V3.8 keeps the video mounted through a governed exit transition", () => {
  assert.match(component, /type Stage = "intro" \| "lobby" \| "exiting" \| "content"/);
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


test("V3.8 starts with an explicit immersive audio consent gate", () => {
  assert.match(component, /type Stage = "intro" \| "lobby" \| "exiting" \| "content"/);
  assert.match(component, /useState<Stage>\("intro"\)/);
  assert.match(component, /Esta é uma página imersiva\./);
  assert.match(component, /Entrar com som/);
  assert.match(component, /Entrar sem som/);
});

test("V3.8 removes the explanatory 'Escolha por onde' copy from the component", () => {
  assert.doesNotMatch(component, /Escolha por onde deseja entrar/);
  assert.doesNotMatch(component, /O núcleo permanece vivo enquanto você navega/);
});

test("V3.8 uses aurora bands and the existing music-reactive CSS variables", () => {
  assert.match(component, /v38-aurora__band--gold/);
  assert.match(component, /v38-aurora__band--cyan/);
  assert.match(component, /v38-aurora__band--violet/);
  assert.match(css, /--v38-low:\s*var\(--music-low,\s*0\)/);
  assert.match(css, /--v38-mid:\s*var\(--music-mid,\s*0\)/);
  assert.match(css, /--v38-high:\s*var\(--music-high,\s*0\)/);
  assert.match(css, /--v38-beat:\s*var\(--music-beat,\s*0\)/);
});

test("V3.8 mobile is the authority layout with thumb-sized 2x3 navigation", () => {
  const mobileAuthority = css.slice(css.indexOf("/* Mobile authority layout. */"));
  assert.match(mobileAuthority, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,1fr\)\)/);
  assert.match(mobileAuthority, /min-height:\s*44px/);
  assert.match(mobileAuthority, /width:\s*max\(128vw,\s*74dvh\)/);
  assert.match(css, /@media \(max-width:\s*390px\)/);
  assert.match(css, /@media \(min-width:\s*721px\)/);
});

test("V3.8 keeps private access contract and external media", () => {
  assert.match(component, /onPrivateAccess/);
  assert.match(component, /\/media\/patroai-v37-logo-loop\.mp4/);
  assert.doesNotMatch(component, /data:video\//);
});


test("V3.8.1 invokes AudioContext resume and audio play inside the explicit sound gesture", () => {
  assert.match(component, /const enterImmersive = async \(withSound: boolean\)/);
  assert.match(component, /resumePromise = bridge\.context\.resume\(\)/);
  assert.match(component, /const playPromise = track\.play\(\)/);
  assert.match(component, /await Promise\.all\(\[resumePromise, playPromise\]\)/);
});

test("V3.8.1 owns one shared audio bridge and does not delegate to the disabled legacy gate", () => {
  assert.match(component, /let sharedAudioBridge: SharedAudioBridge \| null = null/);
  assert.match(component, /createMediaElementSource\(track\)/);
  assert.match(component, /track\.dataset\.patroaiAudioBridge = "v381"/);
  assert.doesNotMatch(component, /auditedEntry\.click\(\)/);
  assert.doesNotMatch(component, /immersiveSoundEntry/);
});

test("V3.8.1 publishes live music bands for aurora and starfield", () => {
  for (const variable of ["--music-low", "--music-mid", "--music-high", "--music-beat"]) {
    assert.match(component, new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(component, /getByteFrequencyData/);
  assert.match(component, /startReactiveFrame\(bridge\)/);
});

test("V3.8.1 never reports playing before HTMLMediaElement play succeeds", () => {
  const soundHandler = component.slice(
    component.indexOf("const enterImmersive"),
    component.indexOf("const toggleAudio"),
  );
  const playIndex = soundHandler.indexOf("const playPromise = track.play()");
  const successStateIndex = soundHandler.indexOf("setPlaying(true)");
  assert.ok(playIndex >= 0);
  assert.ok(successStateIndex > playIndex);
  assert.match(soundHandler, /catch \{/);
  assert.match(soundHandler, /setPlaying\(false\)/);
});
