import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const admin = fs.readFileSync("src/routes/AdminPanel.tsx", "utf8");

test("admin command center resolves operational domains independently", () => {
  assert.match(admin, /Promise\.allSettled\(/);
  for (const domain of ["overview", "users", "agents", "teams", "security", "governance"]) {
    assert.match(admin, new RegExp(`${domain}: .*status === "fulfilled" \\? "ok" : "unavailable"`));
  }
});

test("partial governance failure does not route through the structural access error", () => {
  assert.match(admin, /if \(governanceStatus\.status === "fulfilled"\) setGovernance\(governanceStatus\.value\)/);
  assert.match(admin, /DomainBadge state=\{domainState\.governance\}/);
  assert.match(admin, /getMe\(\)/);
  assert.match(admin, /!profile\.admin_access/);
});

test("partial security failure preserves other operational domains", () => {
  assert.match(admin, /if \(securityStatus\.status === "fulfilled"\) setSecurity\(securityStatus\.value\)/);
  assert.match(admin, /Security status indisponível/);
  assert.match(admin, /Usuários, agentes, Teams e demais domínios preservam seus próprios estados/);
});

test("agent and team sensors degrade locally instead of blacking out the command center", () => {
  assert.match(admin, /Catálogo de agentes indisponível/);
  assert.match(admin, /Teams indisponíveis/);
  assert.match(admin, /domainState\.agents === "ok" \? agents\.length : "—"/);
  assert.match(admin, /domainState\.teams === "ok" \? teams\.length : "—"/);
});

test("structural authorization remains fail-closed", () => {
  assert.match(admin, /setError\("Acesso administrativo não autorizado\."\)/);
  assert.match(admin, /Não foi possível carregar o centro de operações\./);
  assert.match(admin, /if \(error\)/);
});
