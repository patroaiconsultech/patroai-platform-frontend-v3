import { existsSync } from "node:fs";
import { relative, resolve } from "node:path";

const root = process.cwd();
const forbidden = [
  "005_legacy_claim_on_demand.py",
  "alembic.ini",
  "conftest.py",
  "pyproject.toml",
  "requirements-test.lock.txt",
  "requirements.lock.txt",
  "uv.lock",
];

const found = forbidden.filter((name) => existsSync(resolve(root, name)));
if (found.length) {
  console.error("FRONTEND_PACKAGE_BOUNDARY_FAILED");
  for (const item of found) console.error(`- ${relative(root, resolve(root, item))}`);
  process.exit(1);
}

console.log("FRONTEND_PACKAGE_BOUNDARY_PASS");
