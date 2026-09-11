# Tasks 042 - API Cloud Run and Scheduler Jobs

- [ ] T1: Confirm Open Questions (job auth, min-instances/SSE, outbox strategy) and lock them in `spec.md` / `plan.md` before coding.
- [ ] T2: Add `@repo/common` `API_ROUTES` (and any shared constants) for internal job endpoints; extend API env schema for OIDC audience/allowed SAs, in-process scheduler toggle, and DB pool max.
- [ ] T3: Extract job use-cases from existing Nest schedulers; add internal jobs module/controller with structured logging; wire production to disable in-process `@Cron`/`@Interval` for migrated jobs while keeping local DX.
- [ ] T4: Implement production OIDC guard for internal job routes (fail closed); document local invoke path without weakening production auth.
- [ ] T5: Make PostgreSQL `Pool` `max` configurable for Cloud Run multi-instance; keep graceful `pool.end()` on shutdown.
- [ ] T6: Add/adjust focused automated tests (authz, success/error, purchase-expiry idempotency/behavior) via test-engineer workflow.
- [ ] T7: Add `deploy/CLOUD_RUN.md` and parameterized gcloud helper scripts; update `deploy/env` examples/README for new vars; leave VPS Compose scripts unchanged.
- [ ] T8: Run affected verification (`api` tests, type-check, lint, format check); quality-reviewer pass; fix findings.
