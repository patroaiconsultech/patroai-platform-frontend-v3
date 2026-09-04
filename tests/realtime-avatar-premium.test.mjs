import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../src/routes/AppConsole.tsx", import.meta.url), "utf8");
const panel = fs.readFileSync(new URL("../src/components/ImmersivePresencePanel.tsx", import.meta.url), "utf8");
const avatar = fs.readFileSync(new URL("../src/components/RealtimeAvatar.tsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/console-immersive.css", import.meta.url), "utf8");

test("immersive avatar is not mounted while realtime is idle", () => {
  assert.match(app, /realtimeState !== "idle"/);
  assert.match(app, /<ImmersivePresencePanel/);
});

test("voice-message state cannot impersonate realtime avatar state", () => {
  const stateFn = panel.slice(panel.indexOf("function presenceState"), panel.indexOf("const stateCopy"));
  assert.doesNotMatch(stateFn, /voiceState/);
  assert.match(stateFn, /realtimeState === "listening"/);
  assert.match(stateFn, /realtimeState === "speaking"/);
});

test("rendered SVG mouth is wired to the same reactive selector used by speaking CSS", () => {
  assert.match(
    avatar,
    /className="realtime-avatar__mouth realtime-avatar__mouth--reactive"/,
  );
  assert.match(css, /\.realtime-avatar__mouth--reactive/);
  assert.match(avatar, /--avatar-speech-level/);
});

test("visual waveform analysis is structurally isolated from canonical audible playback", () => {
  const analysisStart = app.indexOf("async function startRealtimeAudioAnalysis");
  const analysisEnd = app.indexOf("function stopRealtimeSegmentAudio", analysisStart);
  const analysis = app.slice(analysisStart, analysisEnd);

  assert.match(analysis, /blob\.arrayBuffer\(\)/);
  assert.match(analysis, /decodeAudioData/);
  assert.match(analysis, /audio\.currentTime/);
  assert.doesNotMatch(analysis, /createMediaElementSource/);
  assert.doesNotMatch(analysis, /\.connect\(/);
  assert.doesNotMatch(analysis, /audio\.pause\(/);
  assert.doesNotMatch(analysis, /audio\.src\s*=/);
});

test("canonical playback starts before optional visual analysis", () => {
  const playbackStart = app.indexOf("async function playNextRealtimeAudioSegment");
  const playbackEnd = app.indexOf("async function playCanonicalMessageVoice", playbackStart);
  const playback = app.slice(playbackStart, playbackEnd);
  const playIndex = playback.indexOf("await audio.play()");
  const analysisIndex = playback.indexOf("void startRealtimeAudioAnalysis(next.blob, audio)");
  assert.ok(playIndex >= 0);
  assert.ok(analysisIndex > playIndex);
});

test("visual analysis failures fail open and teardown invalidates pending work", () => {
  const analysisStart = app.indexOf("async function startRealtimeAudioAnalysis");
  const analysisEnd = app.indexOf("function stopRealtimeSegmentAudio", analysisStart);
  const analysis = app.slice(analysisStart, analysisEnd);

  assert.match(app, /realtimeAnalysisGenerationRef\.current \+= 1/);
  assert.match(app, /cancelAnimationFrame/);
  assert.match(analysis, /generation !== realtimeAnalysisGenerationRef\.current/);
  assert.match(analysis, /context\.close\(\)/);
  assert.match(analysis, /setRealtimeSpeechLevel\(0\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("speech signal remains bounded before reaching avatar CSS variables", () => {
  assert.match(app, /Math\.max\(0, Math\.min\(1, \(rms - 0\.018\) \/ 0\.20\)\)/);
  assert.match(panel, /speechLevel=\{state === "speaking" \? speechLevel : 0\}/);
  assert.match(avatar, /Math\.max\(0, Math\.min\(1, speechLevel\)\)/);
});
