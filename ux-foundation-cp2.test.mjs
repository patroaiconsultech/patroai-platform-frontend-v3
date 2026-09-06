import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const immersive = fs.readFileSync(new URL("../src/console-immersive.css", import.meta.url), "utf8");
const admin = fs.readFileSync(new URL("../src/admin.css", import.meta.url), "utf8");

test("console uses a bounded focal column on wide desktop", () => {
  assert.match(immersive, /--console-focus-max:\s*960px/);
  assert.match(
    immersive,
    /grid-template-columns:\s*248px minmax\(0,\s*var\(--console-focus-max\)\) 304px/,
  );
  assert.match(immersive, /justify-content:\s*center/);
});

test("conversation reading width remains bounded and centered by geometry", () => {
  assert.match(immersive, /--console-reading-max:\s*760px/);
  assert.match(immersive, /\.message\s*\{[\s\S]*max-width:\s*var\(--console-reading-max\)/);
  assert.match(immersive, /calc\(\(100% - var\(--console-focus-max\)\) \/ 2\)/);
});

test("composer is anchored to the bottom without becoming a viewport overlay", () => {
  assert.match(
    immersive,
    /\.console-shell--immersive \.composer\s*\{[\s\S]*position:\s*sticky;[\s\S]*bottom:\s*0;/,
  );
  assert.doesNotMatch(
    immersive,
    /\.console-shell--immersive \.composer\s*\{[\s\S]{0,220}position:\s*fixed;/,
  );
  assert.match(immersive, /env\(safe-area-inset-bottom\)/);
});

test("console preserves a visible keyboard focus treatment", () => {
  assert.match(immersive, /:focus-visible/);
  assert.match(immersive, /outline:\s*2px solid var\(--immersive-cyan\)/);
});

test("admin workspace is bounded and keeps keyboard focus visible", () => {
  assert.match(admin, /--admin-workspace-max:\s*1360px/);
  assert.match(admin, /max-width:\s*var\(--admin-workspace-max\)/);
  assert.match(admin, /\.admin-ops button:focus-visible/);
  assert.match(admin, /outline:\s*2px solid var\(--admin-blue\)/);
});
