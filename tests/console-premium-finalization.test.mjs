import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../src/routes/AppConsole.tsx", import.meta.url), "utf8");
const chronology = fs.readFileSync(new URL("../src/utils/chronology.ts", import.meta.url), "utf8");
const immersive = fs.readFileSync(new URL("../src/console-immersive.css", import.meta.url), "utf8");

test("visible message chronology includes canonical date and time", () => {
  assert.match(chronology, /messageDateTimeFormatter/);
  assert.match(chronology, /pick\("day"\).*pick\("month"\).*pick\("year"\)/s);
  assert.match(chronology, /pick\("hour"\).*pick\("minute"\)/s);
  assert.match(app, /dateTime=\{item\.created_at\}/);
  assert.match(app, /formatMessageTimestamp\(item\.created_at\)/);
});

test("copy action targets only the last complete persisted turn", () => {
  assert.match(app, /function lastCompleteTurn/);
  assert.match(app, /activeAgents\.length > 0/);
  assert.match(app, /sending \|\|\s*loading \|\|\s*Boolean\(streamingText\)/s);
  assert.match(app, /navigator\.clipboard\?\.writeText/);
  assert.match(app, /Copiar último turno completo/);
});

test("console viewport is bounded and only conversation region scrolls", () => {
  assert.match(app, /className="thread-viewport"/);
  assert.match(app, /ref=\{threadRef\}/);
  assert.match(immersive, /\.console-main[\s\S]*height: calc\(100svh - 20px\)/);
  assert.match(immersive, /\.thread-viewport[\s\S]*overflow: hidden/);
  assert.match(immersive, /\.thread[\s\S]*overflow-y: auto/);
});

test("auto-follow respects manual reading and exposes a return-to-end affordance", () => {
  assert.match(app, /autoFollowRef\.current = nearEnd/);
  assert.match(app, /if \(autoFollowRef\.current\)/);
  assert.match(app, /setShowJumpToEnd\(true\)/);
  assert.match(app, /Ir para o fim/);
  assert.doesNotMatch(app, /scrollIntoView\(\{[^}]*behavior[^}]*\}\)/);
});

test("mobile framing uses dynamic viewport and safe-area composer clearance", () => {
  assert.match(immersive, /height: 100dvh/);
  assert.match(immersive, /env\(safe-area-inset-bottom\)/);
  assert.match(immersive, /\.copy-turn-button__label[\s\S]*display: none/);
});
