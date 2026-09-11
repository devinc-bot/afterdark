# Plan 043 - Remove Realtime Module

## Approach

Delete realtime and SSE routes. Stop outbox writes. Drop `domain_outbox_events` with a new
timestamped migration. Remove schema, repositories, and unused enums. Simplify web to
mount-only React Query fetches.

## Confirmed Decisions

- No SSE, no interval polling, no refresh button.
- Fetch on page load / remount / navigation only.
- Drop `domain_outbox_events` (new migration; keep old CREATE migration history).
- 042 waits on this cleanup.

## Migration

- Add `packages/db/src/migrations-postgresql/<timestamp>_drop_domain_outbox_events.sql`
  (or drizzle-kit generate after removing schema). Prefer project convention:
  `pnpm drizzle-kit generate` from `packages/db` after schema removal.
- Update `DATABASE.md` only if it documents the outbox table.

## Verification

- Update/remove SSE, polling, and outbox tests.
- Purchase/reconcile tests without outbox.
- type-check, lint, format on touched packages.
