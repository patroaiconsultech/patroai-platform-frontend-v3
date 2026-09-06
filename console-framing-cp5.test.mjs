import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/console-immersive.css", import.meta.url), "utf8");
const cp5 = css.split("/* ORKIO UX Foundation — CP5 viewport frame invariant")[1] || "";

test("CP5 reserves a real right viewport gutter on desktop", () => {
  assert.match(cp5, /\.console-shell--immersive\s*\{[\s\S]*padding-right:\s*10px/);
  assert.match(cp5, /\.console-shell--immersive\s*\{[\s\S]*box-sizing:\s*border-box/);
  assert.match(cp5, /\.console-main\s*\{[\s\S]*width:\s*auto/);
});

test("CP5 prevents user messages from crossing the thread content box", () => {
  assert.match(cp5, /\.message\s*\{[\s\S]*max-width:\s*min\(var\(--console-reading-max\),\s*calc\(100% - 2px\)\)/);
  assert.match(cp5, /\.message\.user\s*\{[\s\S]*align-self:\s*flex-end/);
  assert.match(cp5, /\.message\.user\s*\{[\s\S]*margin-right:\s*0/);
});

test("CP5 constrains composer and long runtime payloads", () => {
  assert.match(cp5, /\.composer\s*\{[\s\S]*max-width:\s*calc\(100% - 24px\)/);
  assert.match(cp5, /overflow-wrap:\s*anywhere/);
  assert.match(cp5, /word-break:\s*break-word/);
});
