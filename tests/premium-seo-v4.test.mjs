import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public landing is PatroAI/platform-only and contains no ORKIO public reference", () => {
  for (const path of [
    "index.html",
    "src/routes/Landing.tsx",
    "src/landing/premiumMarkup.ts",
    "src/landing/premiumInteractions.ts",
    "src/landing/V37Immersive.tsx",
    "public/manifest.webmanifest",
    "public/offline.html",
  ]) {
    assert.doesNotMatch(read(path), /\bORKIO\b/i, path);
  }
});

test("SEO uses the branded PatroAI canonical surface", () => {
  const index = read("index.html");
  const robots = read("public/robots.txt");
  const sitemap = read("public/sitemap.xml");
  assert.match(index, /rel="canonical" href="https:\/\/www\.patroai\.com\/"/);
  assert.match(index, /"@type": "WebSite"/);
  assert.match(index, /"@type": "Service"/);
  assert.match(index, /Plataforma de inteligência artificial governada/);
  assert.match(robots, /Sitemap: https:\/\/www\.patroai\.com\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/www\.patroai\.com\/<\/loc>/);
  assert.match(sitemap, /talentos\/candidatura/);
});

test("private console and auth surfaces emit noindex headers", () => {
  const server = read("server.mjs");
  assert.match(server, /X-Robots-Tag/);
  assert.match(server, /noindex, nofollow, noarchive/);
  assert.match(server, /pathname === "\/app"/);
  assert.match(server, /pathname === "\/access"/);
  assert.match(server, /pathname === "\/admin"/);
});
