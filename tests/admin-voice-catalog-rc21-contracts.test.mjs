import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const adminPanel = resolve(here, "../src/routes/AdminPanel.tsx");

test("Admin Voice Catalog view is materialized inside the frontend repository", () => {
  const text = readFileSync(adminPanel, "utf8");
  assert.match(text, /view\s*===\s*["']voices["']/);
  assert.match(text, /voiceCatalog\.map/);
  assert.match(text, /voiceAssignments\.map/);
});
