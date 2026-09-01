# FRONTEND-DEPLOY-002 — Admin API export reconciliation

## Urgent apply
Replace only:

`src/api.ts`

with the canonical Command Center version contained in this patch.

Do not remove `getAdminUsers()`/`getAdminAgents()`/`getAdminTeams()`/`getAdminGovernance()` from `AdminPanel.tsx`.

## Why
Railway proved that `AdminPanel.tsx` already imports these helpers while the deployed `src/api.ts` does not export them.

## Required next deploy gates
1. `npm test` must pass.
2. `npm run build` must pass.
3. `npm run verify:dist` must pass.
4. `npm run build:evidence` must pass.

Only after those four gates should the deployment be treated as build-proven.

## Rollback
Restore only the previous `src/api.ts`.
No backend, DB, migration, tenant, Realtime or SSE rollback is involved.
