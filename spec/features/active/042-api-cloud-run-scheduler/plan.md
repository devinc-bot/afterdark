# Plan 042 - API Cloud Run and Scheduler Jobs

## Approach

Reuse the existing production Dockerfile, health module, Zod env validation, migrator
image target, and repository job logic. Extract callable use-cases from Nest schedulers,
expose them under `POST /api/internal/jobs/...`, protect those routes with Google OIDC
validation suitable for Cloud Scheduler, disable in-process crons in production, and add
GCP-oriented operator documentation and parameterized scripts. Do not alter the VPS
Compose release path from feature 029.

## Confirmed Decisions

- Deploy scope: **API (+ migrator) on Cloud Run documentation/scripts only**; frontends
  stay on the existing VPS path (option 4B).
- Tests: **high importance** — `test-engineer` then `implementation-engineer`, then
  `quality-reviewer`; incremental apply (one `tasks.md` item per turn unless batched).
- Spec-first: this feature folder is the source of truth before code.
- Prerequisite **043**: realtime/SSE and `domain_outbox_events` removed; no outbox job;
  `min-instances` not required for sticky streams.

## Recommended Decisions (awaiting confirmation)

### 1) Job authentication — recommend **public Cloud Run + Nest OIDC on `/internal/*`**

Cloud Run IAM “require authentication” applies to the **whole service**, not per path.
This API must remain reachable without a Google identity for:

- Browser clients (`web` / `dashboard` / `admin`)
- Mercado Pago webhooks
- Public health probes (unless wired differently)

Therefore pure “only IAM, no app check” on a single public API service is not workable
without an extra edge (Load Balancer / API Gateway) or a second private Cloud Run
service.

**Recommended design:**

1. Cloud Run service allows unauthenticated invocation (same as today’s public HTTP API).
2. Cloud Scheduler attaches an **OIDC token** for a dedicated scheduler service account.
3. Nest guard on `/api/internal/jobs/*` verifies the Google-signed JWT (issuer, audience,
   and allowed service-account email from env).
4. No static `x-api-key` as the only control; optional local bypass only for development
   (e.g. skip OIDC when `NODE_ENV=development` and a documented local header/flag — exact
   local DX chosen during implementation without weakening production).

Alternative (heavier): split a private “jobs” Cloud Run service with IAM-only access —
out of scope unless operators prefer two services later.

## Architecture

```text
Cloud Scheduler (OIDC, scheduler SA)
        |
        v
Cloud Run API (public HTTP for product routes)
        |
        +--> Nest public controllers (auth, orders, webhooks, health)
        |
        +--> Nest POST /api/internal/jobs/* (OIDC guard)
                |
                v
         existing @repo/db repositories / transactions
                |
                v
         Neon PostgreSQL (pooled DATABASE_URL)
```

Migrations:

```text
build images -> push Artifact Registry -> run migrator job (DATABASE_MIGRATION_URL)
  -> deploy/revise Cloud Run -> Scheduler targets new revision URL
```

## Internal Job Catalog

| Job | Method / path (under API prefix) | Suggested schedule | Notes |
|-----|----------------------------------|--------------------|-------|
| Expire purchase reservations | `POST .../internal/jobs/expire-purchase-reservations` | `* * * * *` | Critical; batch 100; idempotent release |
| Cleanup stale pending orders | `POST .../internal/jobs/cleanup-stale-pending-orders` | `0 0 1 * *` | Legacy hygiene |
| Cleanup API error records | `POST .../internal/jobs/cleanup-api-error-records` | `0 0 * * *` | 30-day retention |
| Cleanup user registration tokens | `POST .../internal/jobs/cleanup-user-registration-tokens` | `0 0 * * *` | |
| Cleanup owner registration tokens | `POST .../internal/jobs/cleanup-owner-registration-tokens` | `0 0 * * *` | |
| Cleanup password reset tokens | `POST .../internal/jobs/cleanup-password-reset-tokens` | `0 0 * * *` | |
| Cleanup account sessions | `POST .../internal/jobs/cleanup-account-sessions` | `0 0 * * *` | Replaces unreliable 14-day `@Interval` |
| Cleanup staff invitations | `POST .../internal/jobs/cleanup-staff-invitations` | `0 0 * * *` | |

Exact `API_ROUTES` constants follow existing kebab/English conventions in `@repo/common`.

## Configuration Additions (expected)

| Variable | Sensitivity | Role |
|----------|-------------|------|
| Existing API/runtime vars | mixed | Unchanged contract from `deploy/env` |
| `DATABASE_POOL_MAX` (name TBD) | public | Cap `pg` Pool `max` per instance |
| `INTERNAL_JOBS_OIDC_AUDIENCE` | public | Expected JWT audience (Cloud Run URL or custom) |
| `INTERNAL_JOBS_OIDC_ALLOWED_SERVICE_ACCOUNTS` | public | Comma-separated SA emails allowed to invoke jobs |
| `ENABLE_IN_PROCESS_SCHEDULERS` | public | Default true in development, false in production |

Secrets stay in Secret Manager / runtime injection (same classes as today: DB URLs, JWT,
MP, R2, optional AWS keys).

## Documentation / Scripts

Add English `deploy/CLOUD_RUN.md` (or equivalent under `deploy/`) covering:

1. Build API + migrator images  
2. Push to Artifact Registry  
3. Deploy Cloud Run  
4. Env + Secret Manager  
5. IAM (runtime SA, scheduler SA, `roles/run.invoker` only if a private service is used later)  
6. Create Scheduler jobs with OIDC  
7. Manual curl/test with identity token  
8. Logs  
9. Rollback revision  
10. Migrator-before-traffic  

Parameterized shell helpers under `deploy/scripts/` (PROJECT_ID, REGION, SERVICE_NAME,
IMAGE, SCHEDULER_SA). No hardcoded GCP project values. Do not introduce Terraform in this
feature.

## Verification

- Focused tests: OIDC/guard rejection; authorized happy path; job failure mapping;
  purchase expiry idempotency under duplicate invocation (reuse/extend existing scheduler
  and repository tests).
- `pnpm --filter @repo/api test` (affected), `pnpm type-check`, `pnpm lint`,
  `pnpm format:check`.
- Manual: local POST to internal jobs; document `gcloud` identity-token probe for staging.

## Risks

- Misconfigured audience/SA list locks out Scheduler or leaves jobs open — fail closed in
  production when OIDC config is incomplete.
- Pool exhaustion under high max-instances — document Neon pooler + low per-instance max.
- Operators forgetting migrator step — docs must order migrate → revise.
- SSE UX regression under scale-to-zero — document clearly.
