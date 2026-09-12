# Plan 045 - API Jobs Module

## Approach

Create `apps/api/src/modules/jobs` as the single Nest home for in-process schedulers.
Move the eight existing scheduler classes and the shared `runCleanupJob` helper into that
module, unregister them from `auth` / `orders` / `invitations` / `common`, register
`JobsModule` in `AppModule`, relocate colocated tests, and add `JOBS.md` as the operator
catalog. No schedule or business-rule changes. Feature 042 stays draft and is not updated
in this work.

## Confirmed Decisions

- Module name: `jobs`.
- Ignore / do not extend feature **042** in this iteration (replan later).
- All eight Nest jobs move into `jobs` (no schedulers left in domain modules).
- Catalog file: `apps/api/src/modules/jobs/JOBS.md` (English; name + what it does +
  schedule).
- Keep calling `@repo/db` helpers from schedulers (same as today).
- Incremental apply: one `tasks.md` item per turn unless the user batches.

## Target Layout

```text
apps/api/src/modules/jobs/
  JOBS.md
  jobs.module.ts
  index.ts
  run-cleanup-job.ts          # moved from common
  schedulers/
    purchase-expiry.scheduler.ts
    pending-order-cleanup.scheduler.ts
    api-error-retention.scheduler.ts
    user-registration-cleanup.scheduler.ts
    owner-registration-cleanup.scheduler.ts
    password-reset-cleanup.scheduler.ts
    account-session-cleanup.scheduler.ts
    invitations-cleanup.scheduler.ts
  *.test.ts                   # relocated beside schedulers or under schedulers/
```

Exact file names may keep current `*.scheduler.ts` basenames for git history clarity.

## Job Catalog (draft for `JOBS.md`)

| Name                                | Schedule                    | What it does                                                                                                |
| ----------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `expire-purchase-reservations`      | Every minute                | Finds up to 100 expired active inventory reservations and releases each (purchase + reservation → expired). |
| `cleanup-stale-pending-orders`      | 1st of month, midnight      | Deletes stale pending legacy orders older than the start of the previous month.                             |
| `cleanup-api-error-records`         | Daily midnight              | Deletes API error records older than 30 days.                                                               |
| `cleanup-user-registration-tokens`  | Daily midnight              | Deletes expired user registration tokens.                                                                   |
| `cleanup-owner-registration-tokens` | Daily midnight              | Deletes expired owner registration tokens.                                                                  |
| `cleanup-password-reset-tokens`     | Daily midnight              | Deletes expired password-reset tokens.                                                                      |
| `cleanup-account-sessions`          | Every 14 days (`@Interval`) | Deletes expired or revoked account sessions older than 7 days.                                              |
| `cleanup-staff-invitations`         | Daily midnight              | Deletes expired and cancelled staff invitations.                                                            |

Stable catalog names above are documentation identifiers (kebab-case). Nest class names stay
PascalCase (`PurchaseExpiryScheduler`, etc.) unless a later feature renames them.

## Module Wiring

- Add `JobsModule` providers for all eight schedulers (+ export nothing required unless
  tests need it).
- Import `JobsModule` from `AppModule` (or `modules/index` re-export pattern used by
  peers).
- Remove scheduler providers from `AuthModule`, `OrdersModule`, `InvitationsModule`,
  `CommonModule`.
- Move `runCleanupJob` out of `common`; update `common/index.ts` so nothing outside
  `jobs` depends on it (or leave a thin deprecated re-export only if needed for one
  transitional task — prefer delete and fix imports in the same task).

## Verification

- Relocate existing scheduler tests; run affected `@repo/api` tests.
- `pnpm type-check`, `pnpm lint`, `pnpm format:check` on touched packages (or repo
  scripts as applicable).
- Grep: no remaining `@Cron` / `@Interval` under `modules/{auth,orders,invitations,common}`.
- Quality-reviewer after implementation.

## Risks

- Accidental double registration if a provider is left in a domain module.
- Import path churn in tests.
- 042 docs still describe scattered schedulers — acceptable until 042 is replanned.
