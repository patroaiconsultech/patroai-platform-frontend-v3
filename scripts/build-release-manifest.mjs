import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

function sha256(path) {
  try {
    return createHash("sha256").update(readFileSync(path)).digest("hex");
  } catch {
    return null;
  }
}

function git(...args) {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

const manifest = {
  product: "PatroAI Platform",
  component: "frontend",
  repository: process.env.GITHUB_REPOSITORY || null,
  branch: process.env.GITHUB_REF_NAME || git("branch", "--show-current"),
  commit_sha: process.env.GITHUB_SHA || git("rev-parse", "HEAD"),
  dirty_tree: git("status", "--porcelain") ? true : false,
  ci_run_id: process.env.GITHUB_RUN_ID || null,
  build_timestamp: new Date().toISOString(),
  runtime: {
    node: process.version,
    npm: process.env.npm_config_user_agent || null,
  },
  locks: {
    package_lock_sha256: sha256("package-lock.json"),
  },
};

mkdirSync("build-evidence", { recursive: true });
writeFileSync(
  "build-evidence/release-manifest.json",
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
console.log("FRONTEND_RELEASE_MANIFEST=PASS");
