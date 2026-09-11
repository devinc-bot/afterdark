# Tasks 044 - DRY Client Auth Session Stack

- [x] T1: Add `SESSION_DURATION_MS` (+ optional cookie-name map by `CLIENT_APP`) to `@repo/common`; point three apps’ auth-storage constants at it; delete duplicate constant files if unused.
- [x] T2: Add `createAuthStorage`; migrate web/dashboard/admin `auth-storage.utils.ts` to thin wrappers; keep cookie names; update imports/tests as needed.
- [x] T3: Add `createSessionCleanup` + `createSessionService`; migrate three `session-cleanup.ts` / `session.service.ts` pairs; inject i18n message getters; preserve `SessionFetchError` export.
- [x] T4: Extract shared QueryFactory auth/refresh options helper; thin `apps/*/app/config/api.ts`; verify SSR omits refresh and `{ app }` matches each `CLIENT_APP`.
- [x] T5: Verification pass (tests/type-check on touched packages), quality review, fix findings; archive 044 when Done.
