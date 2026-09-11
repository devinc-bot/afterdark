# Spec 042 - API Cloud Run and Scheduler Jobs

## Context and Objective

Prepare the NestJS API to run on Google Cloud Run with scale-to-zero, while moving
in-process Nest `@Cron` / `@Interval` work that must survive idle periods onto
HTTP endpoints invoked by Google Cloud Scheduler. The existing VPS Compose/Caddy/GHCR
path (feature 029) remains the current production control plane for frontends and is
not replaced in this iteration. Operators need a secure, idempotent job surface,
health/readiness probes, safe database pooling under multi-instance scale-out, and
English operational documentation for Artifact Registry, Cloud Run, Secret Manager,
IAM, Scheduler, and one-shot migrations.

## Users / Actors

- Platform operators deploying and operating the API on GCP.
- Cloud Scheduler (service account) invoking internal job endpoints.
- Existing API clients (`web`, `dashboard`, `admin`, Mercado Pago webhooks) — unchanged
  contracts except that production jobs no longer depend on a permanently awake Nest process.

## User Stories

- H1: As an operator, I want the API container to run correctly on Cloud Run so that
  instances can scale to zero and restart without orphaned connections.
- H2: As an operator, I want scheduled ticket and hygiene jobs to run via Cloud Scheduler
  so that work continues when no user traffic is keeping an instance warm.
- H3: As an operator, I want internal job endpoints protected with Google identity
  (OIDC) so that anonymous internet callers cannot trigger inventory or cleanup work.
- H4: As a developer, I want local `pnpm dev` and manual job HTTP triggers so that I can
  exercise the same job code paths without Cloud Scheduler.
- H5: As an operator, I want migrations to remain a separate one-shot step so that
  concurrent Cloud Run instances never race on schema changes.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN the API process starts, THE SYSTEM SHALL listen on `0.0.0.0` using
  `process.env.PORT` (validated configuration; local default remains 3000).
- RF-2: WHEN the process receives SIGTERM/SIGINT, THE SYSTEM SHALL shut down Nest
  gracefully and close the PostgreSQL pool (existing shutdown hooks retained or extended
  only if gaps are found).
- RF-3: THE SYSTEM SHALL expose `GET /api/health/` (liveness) and `GET /api/health/ready`
  (readiness including a cheap database connectivity check) without requiring job auth.
- RF-4: WHEN Cloud Scheduler (or a local operator) sends an authorized `POST` to an
  internal job route, THE SYSTEM SHALL execute exactly one named job and return HTTP 2xx
  on success or an appropriate error on failure, with structured job logs including job
  name, status, and duration.
- RF-5: THE SYSTEM SHALL provide internal job endpoints for: purchase reservation expiry;
  pending legacy order cleanup; API error retention cleanup; user registration token
  cleanup; owner registration token cleanup; password reset token cleanup; account
  session cleanup; and staff invitations cleanup. Domain outbox publish is out of scope
  (removed in feature 043).
- RF-6: WHILE `NODE_ENV=production` (or an explicit disable flag), THE SYSTEM SHALL NOT
  rely on Nest `@Cron` / `@Interval` for the migrated jobs so scale-to-zero cannot skip
  them. Local development MAY keep in-process schedulers and/or call the same HTTP
  endpoints manually.
- RF-7: WHEN an unauthorized caller invokes an internal job route, THE SYSTEM SHALL
  reject the request (401/403) without running the job.
- RF-8: WHEN Scheduler retries or concurrent instances invoke purchase expiry, THE SYSTEM
  SHALL remain safe for ticket inventory (reuse existing transactional
  `releaseReservationOnce` semantics; add claim/`SKIP LOCKED` only if required by
  observed races).
- RF-9: THE SYSTEM SHALL validate required runtime configuration at startup via the
  existing Zod env schema (extended only for new job-auth / pool settings).
- RF-10: THE SYSTEM SHALL document a Cloud Run deployment path for the API and migrator
  images without changing the VPS Compose release scripts as the default frontend path.
- RF-11: WHEN the pool configuration is set for Cloud Run, THE SYSTEM SHALL allow
  operators to cap PostgreSQL connections per instance via environment configuration so
  horizontal scale-out does not exhaust Neon.

## Non-Functional Requirements

- Security: no secrets in images or Git; no service-account JSON in the repo; prefer
  Google OIDC for Scheduler → API job routes over a static shared API key as the sole
  control.
- Compatibility: local `pnpm dev` / `pnpm dev:api` continues to work; feature 029 VPS
  flows remain valid and untouched as the frontend deploy path.
- Observability: Nest `Logger` with structured job fields; no new logging library unless
  a clear Cloud Run gap appears.
- Performance: job HTTP handlers must finish within Cloud Run request timeouts; batch
  sizes stay bounded (purchase expiry already batches 100).
- Tests: high importance — focused automated tests for authorization, success/failure,
  and job behavior (especially purchase expiry idempotency).

## Edge Cases

- Duplicate Scheduler deliveries and overlapping minute ticks on purchase expiry.
- Cold start: first Scheduler hit may pay cold-start latency; jobs must tolerate it.
- Migration job must not run inside every Cloud Run instance boot.
- In-memory rate-limit counters remain per-instance (already true on VPS replicas).

## Out of Scope

- Migrating `web`, `dashboard`, or `admin` to Cloud Run.
- Replacing VPS Compose/Caddy/GHCR workflows from feature 029.
- Introducing Terraform/Pulumi automatically.
- Building a full GCP CI/CD pipeline without a separate decision (document recommended
  flow and parameterized scripts only).
- Pub/Sub / Cloud Tasks workers (propose later only if a job exceeds HTTP timeout).
- Changing Mercado Pago webhook contracts or checkout business rules beyond expiry
  scheduling transport.
- Realtime/SSE/outbox (removed in feature 043).

## Definition of Done

- Acceptance criteria above are implemented and covered by focused API tests where
  applicable.
- Migrated jobs are invocable via internal POST routes; production does not depend on
  Nest in-process crons for those jobs.
- Dockerfile/health/shutdown remain Cloud Run compatible; pool and env docs updated.
- English ops doc covers build, Artifact Registry, Cloud Run, secrets, IAM, Scheduler,
  manual test, logs, rollback, and migrator-before-traffic.
- Local development path documented and verified.
- Feature review complete; VPS deploy scripts unchanged.

## Open Questions

- [NEEDS CLARIFICATION] Job authentication model (see diagnosis recommendation **B*** /
  public service + Nest OIDC validation on `/internal/*`). Confirm before apply.
- ~~[NEEDS CLARIFICATION] Cloud Run `min-instances` for SSE (recommendation: **0** for
  this iteration; document reconnect behavior).~~ **Superseded by 043** — SSE removed
  (including table drop of `domain_outbox_events`); min-instances for sticky streams is
  no longer applicable.
- ~~[NEEDS CLARIFICATION] Outbox publisher strategy (recommendation: optional 1-minute
  Scheduler job or defer if `published_at` has no external consumer).~~ **Superseded by
  043** — realtime outbox publisher removed; purchase paths no longer append domain
  outbox events; `domain_outbox_events` is dropped.
