# FRONTEND-DEPLOY-001 — stale admin test

## Apply
Replace only:

`tests/hyper-cocreator-admin-ux.test.mjs`

Do not change `src/routes/AdminPanel.tsx` to satisfy the stale test.

## Expected result
The admin UX test must assert the canonical admin helpers:

- `getAdminAgents()`
- `getAdminTeams()`
- `getAdminUsers()`
- `getAdminGovernance()`
- `getAdminSecurityStatus()`

and the Operations Command Center heading.

## Rollback
Restore the previous test file only. No runtime/backend/DB/migration rollback exists for this patch.
