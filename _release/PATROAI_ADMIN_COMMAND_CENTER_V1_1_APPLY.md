# PatroAI Operations Command Center V1.1 — Operational Resilience

Base esperada: Command Center V1 aplicado sobre a cadeia RC2 SANITIZED + Hardening V1.0 + V1.1.

## Delta
Modificados:
- `src/routes/AdminPanel.tsx`
- `src/admin.css`

Adicionado:
- `tests/admin-command-center-resilience.test.mjs`

## Finding fechado
`ADMIN-OPS-001`: os seis sensores administrativos deixam de ser all-or-nothing. `getMe()` e `admin_access` permanecem fail-closed; os demais domínios usam resolução independente e degradam localmente.

## Validação
- `npm run verify:boundary` PASS
- `node --check server.mjs` PASS
- `node --check public/sw.js` PASS
- `npm test` 372/372 PASS
- `npm run build` NÃO COMPROVADO: `vite: Permission denied`

## Rollback
Restaurar `src/routes/AdminPanel.tsx` e `src/admin.css` à V1 e remover `tests/admin-command-center-resilience.test.mjs`.
Nenhum rollback backend/DB/migration/tenant/Realtime/SSE.
