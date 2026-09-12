# Spec 045 - API Jobs Module

## Context and Objective

Scheduled work in the NestJS API is scattered across `auth`, `orders`, `invitations`,
and `common`. Operators and developers cannot see the full job surface in one place,
and ownership of timers is unclear. This feature consolidates every in-process Nest
scheduler into a dedicated `jobs` module and adds a colocated English catalog
(`JOBS.md`) that lists each job name and what it does, without changing schedules,
retention rules, or job behavior.

## Users / Actors

- API developers maintaining scheduled hygiene and inventory jobs.
- Operators reviewing which jobs exist and what they do.

## User Stories

- H1: As a developer, I want all Nest `@Cron` / `@Interval` providers in one `jobs`
  module so that I can find and change scheduling entry points without hunting domain
  modules.
- H2: As a developer or operator, I want a `JOBS.md` catalog next to that module so that
  I can see each job’s name, schedule, and purpose at a glance.
- H3: As a product owner, I want job behavior to stay identical after the move so that
  inventory expiry and token cleanup keep working as today.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: THE SYSTEM SHALL register all Nest in-process schedulers only from
  `apps/api/src/modules/jobs` (no `@Cron` / `@Interval` providers remain in `auth`,
  `orders`, `invitations`, or `common`).
- RF-2: THE SYSTEM SHALL continue to run the same eight jobs with the same Nest schedule
  expressions / intervals and the same retention and batch semantics as before this
  feature.
- RF-3: THE SYSTEM SHALL provide `apps/api/src/modules/jobs/JOBS.md` listing every job
  by stable name, schedule summary, and short description of what it does.
- RF-4: WHEN a job runs, THE SYSTEM SHALL keep using the shared cleanup shell
  (`runCleanupJob` or its relocated equivalent under `jobs`) so success/failure logging
  behavior is preserved.
- RF-5: THE SYSTEM SHALL wire `JobsModule` into the API application module graph so all
  relocated schedulers remain active under `ScheduleModule.forRoot()`.

## Non-Functional Requirements

- Behavior-preserving refactor: no new HTTP job endpoints, no Cloud Scheduler, no OIDC.
- Feature **042** (`api-cloud-run-scheduler`) is explicitly out of this iteration and will
  be replanned after this consolidation.
- Move existing scheduler unit tests with their providers; do not add new product tests
  unless a regression appears.
- Technical docs in English; no user-facing copy changes.

## Edge Cases

- Import cycles if `JobsModule` wrongly imports heavy domain modules — prefer calling
  `@repo/db` repository helpers from jobs the same way current schedulers do.
- Incomplete move leaving a duplicate scheduler registered in both old and new modules
  (must not happen: remove providers from domain modules when relocating).

## Out of Scope

- Cloud Run, Cloud Scheduler, internal HTTP job routes, OIDC guards (feature 042).
- Changing cron expressions, retention windows, batch sizes, or business rules.
- Extracting job logic into new use-case classes beyond what is required to compile after
  the move.
- Frontend apps, validators, or database schema changes.

## Definition of Done

- All eight schedulers live under `modules/jobs` and are registered only there.
- Domain modules no longer provide those schedulers.
- `JOBS.md` lists name + purpose (+ schedule) for every job.
- Existing scheduler tests relocated and still passing; type-check/lint clean for
  affected packages.
- Spec reviewed; 042 left untouched for later replanning.

## Open Questions

- None blocking; confirmed: ignore 042 for now; module name `jobs`; move all jobs;
  add `JOBS.md` catalog.
