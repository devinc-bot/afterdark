# Tasks 045 - API Jobs Module

- [x] T1: Create `apps/api/src/modules/jobs` scaffold (`jobs.module.ts`, `index.ts`) and add `JOBS.md` with the eight-job catalog (name, schedule, purpose) from `plan.md`.
- [x] T2: Move `runCleanupJob` into `jobs`; update imports; remove it from `common` exports.
- [x] T3: Move all eight schedulers (+ their existing tests) into `jobs`; register them only in `JobsModule`; remove providers from `auth` / `orders` / `invitations` / `common`.
- [x] T4: Wire `JobsModule` into `AppModule` / modules barrel; verify no duplicate schedulers; run affected API tests + type-check/lint/format; quality-reviewer; fix findings.
