import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("../src/landing/V37Immersive.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/landing/premium.css", import.meta.url), "utf8");
const landing = readFileSync(new URL("../src/routes/Landing.tsx", import.meta.url), "utf8");
const interactions = readFileSync(new URL("../src/landing/premiumInteractions.ts", import.meta.url), "utf8");

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

test("V3.8.2 starts first-party audio through the canonical controller after explicit consent", () => {
  assert.match(component, /const enterImmersive = async \(withSound: boolean\)/);
  assert.match(component, /sendAudioCommand\("start", true\)/);
  assert.match(interactions, /const playbackReady = immersiveAudio\.play\(\)/);
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


test("V3.8.2 invokes canonical analyser and audio playback from the synchronous command event", () => {
  assert.match(component, /AUDIO_COMMAND_EVENT/);
  assert.match(interactions, /const analyserReady = ensureAudioReactiveLogo\(\)/);
  assert.match(interactions, /const playbackReady = immersiveAudio\.play\(\)/);
  assert.match(interactions, /await Promise\.all\(\[analyserReady, resumeReady, playbackReady\]\)/);
});

test("V3.8.2 removes the V37 private MediaElementSource and delegates to premiumInteractions", () => {
  assert.doesNotMatch(component, /SharedAudioBridge/);
  assert.doesNotMatch(component, /createMediaElementSource\(track\)/);
  assert.doesNotMatch(component, /patroaiAudioBridge = "v381"/);
  assert.match(component, /patroai:v38-audio-command/);
  assert.match(interactions, /createMediaElementSource\(immersiveAudio\)/);
});

test("V3.8.2 canonical analyser publishes live music bands for aurora and starfield", () => {
  for (const variable of ["--music-bass", "--music-mid", "--music-high", "--music-beat"]) {
    assert.match(interactions, new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(interactions, /getByteFrequencyData/);
  assert.match(interactions, /startAudioReactiveLogo/);
});

test("V3.8.2 reports playing from the real media element result instead of optimistic local state", () => {
  assert.match(component, /setPlaying\(result\.playing\)/);
  assert.match(interactions, /playing: Boolean\(immersiveAudio && !immersiveAudio\.paused\)/);
  assert.match(interactions, /emitV38AudioResult\(detail\.requestId, true\)/);
});

test("V3.8.2 delegates audio to the canonical premiumInteractions graph", () => {
  assert.match(component, /patroai:v38-audio-command/);
  assert.match(component, /patroai:v38-audio-result/);
  assert.match(interactions, /onV38AudioCommand/);
  assert.match(interactions, /const playbackReady = immersiveAudio\.play\(\)/);
  assert.match(interactions, /const analyserReady = ensureAudioReactiveLogo\(\)/);
  assert.match(interactions, /rampMasterGain\(0\.48, 0\.12\)/);
});

test("V3.8.2 keeps the legacy visual gate inert while retaining canonical audio", () => {
  assert.match(interactions, /const legacyImmersiveUiEnabled = immersiveExperience !== false/);
  assert.match(interactions, /immersiveGate\.hidden = true/);
  assert.match(interactions, /patroai:v38-audio-command/);
});

test("V3.8.2 mobile core is centered outside grid flow and cannot widen the viewport", () => {
  const v382 = css.slice(css.indexOf("V3.8.2 — MOBILE STABILIZATION"));
  assert.match(v382, /@media \(max-width: 720px\)/);
  assert.match(v382, /position:\s*absolute/);
  assert.match(v382, /left:\s*50%/);
  assert.match(v382, /translate3d\(-50%,\s*-50%,\s*0\)/);
  assert.match(v382, /max-width:\s*100vw/);
  assert.match(v382, /width:\s*min\(calc\(100vw - 28px\),\s*470px\)/);
});

test("V3.8.2 mobile music response removes rapid twinkle and beat scaling", () => {
  const v382 = css.slice(css.indexOf("V3.8.2 — MOBILE STABILIZATION"));
  assert.match(v382, /v371StarsBase 72s/);
  assert.match(v382, /v371StarsLow 58s/);
  assert.match(v382, /v371StarsMid 51s/);
  assert.match(v382, /v371StarsHigh 45s/);
  assert.doesNotMatch(v382, /var\(--v38-beat\).*scale/);
});
