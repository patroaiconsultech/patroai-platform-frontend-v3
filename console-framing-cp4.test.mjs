import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const immersive = fs.readFileSync(new URL("../src/console-immersive.css", import.meta.url), "utf8");
const cp4 = immersive.split("/* ORKIO UX Foundation — CP4 console framing hard-stop")[1] || "";

test("CP4 removes the remaining desktop right-edge overflow source", () => {
  assert.match(cp4, /\.console-shell--immersive \.console-main\s*\{[\s\S]*margin-right:\s*0/);
  assert.match(cp4, /\.thread-viewport,[\s\S]*\.thread\s*\{[\s\S]*overflow-x:\s*hidden/);
  assert.doesNotMatch(cp4, /\.console-main\s*\{[\s\S]{0,160}margin-right:\s*10px/);
});

test("CP4 keeps every message inside the available thread width", () => {
  assert.match(cp4, /\.message\s*\{[\s\S]*width:\s*min\(var\(--console-reading-max\),\s*100%\)/);
  assert.match(cp4, /\.message\.user\s*\{[\s\S]*margin-left:\s*auto/);
  assert.match(cp4, /\.message-markdown\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(cp4, /overflow-wrap:\s*anywhere/);
});

test("CP4 prevents composer and notebook header controls from escaping the main track", () => {
  assert.match(cp4, /\.composer,[\s\S]*\.composer__row,[\s\S]*\.composer textarea[\s\S]*width:\s*100%/);
  assert.match(cp4, /@media \(min-width: 1180px\) and \(max-width: 1519px\)/);
  assert.match(cp4, /\.ghost-link\s*\{[\s\S]*display:\s*none/);
});
