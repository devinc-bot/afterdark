# Tasks 043 - Remove Realtime Module

- [x] T1: Remove SSE routes from `@repo/common` and Nest orders/events; delete `apps/api/src/modules/realtime`; clean SSE rate-limit usage; update API tests.
- [x] T2: Stop outbox appends; remove outbox repositories/schema/exports/`OUTBOX_*` types; add timestamped migration dropping `domain_outbox_events`; adjust DB tests.
- [x] T3: Remove web SSE hooks, order/availability `refetchInterval` helpers, and dead `fetch-sse` if unused; mount-only queries; update docs.
- [x] T4: Update 042 open questions; run verification and quality review.
