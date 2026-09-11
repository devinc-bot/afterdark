# Spec 043 - Remove Realtime Module

## Context and Objective

The Nest `realtime` module exists only to serve SSE purchase/availability streams and an
unused outbox publisher cron backed by `domain_outbox_events`. This feature removes that
module, all client realtime transports for orders and event availability, and the outbox
table itself. Clients use a single HTTP GET on page load (React Query defaults on
remount/navigation). No SSE and no interval polling.

## Users / Actors

- Buyers on `web` viewing order/checkout result pages.
- Anonymous visitors on public event detail.
- Operators preparing the API for Cloud Run (feature 042).

## User Stories

- H1: As a buyer, I want order status from a normal page load GET so checkout does not need
  a long-lived connection.
- H2: As a visitor, I want event availability from the public event detail GET on load.
- H3: As an operator, I want no outbox publisher cron, SSE endpoints, or unused outbox table.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: THE SYSTEM SHALL NOT ship `apps/api/src/modules/realtime`.
- RF-2: THE SYSTEM SHALL NOT expose purchase or event availability SSE endpoints.
- RF-3: WHEN a buyer opens an order page, THE WEB CLIENT SHALL load order state via the
  existing authenticated order GET once (React Query on mount). THE SYSTEM SHALL NOT use
  SSE or `refetchInterval` polling for orders.
- RF-4: WHEN a visitor opens a published event detail page, THE WEB CLIENT SHALL load
  availability via the public event detail GET on mount. THE SYSTEM SHALL NOT use SSE or
  interval polling for availability.
- RF-5: WHEN purchase lifecycle transitions run, THE SYSTEM SHALL succeed without appending
  domain outbox events or depending on realtime services.
- RF-6: THE SYSTEM SHALL remove unused stream route helpers and SSE-only rate-limit wiring
  when nothing else references them.
- RF-7: Non-SSE order and event HTTP contracts SHALL remain compatible.
- RF-8: THE SYSTEM SHALL drop the `domain_outbox_events` table via a new timestamped Drizzle
  migration, remove the Drizzle schema and outbox repositories, and remove unused
  `OUTBOX_*` type constants.

## Non-Functional Requirements

- Keep the change minimal: delete dead code; do not add refresh buttons or new transports.
- High test importance for payment/controller/migration regressions.
- Do not rewrite historical migrations; add a new forward migration to DROP the table.

## Edge Cases

- Order still PENDING after Mercado Pago return: page shows pending until the user reloads
  or navigates again.
- Environments that never applied the concurrent-payments migration: DROP IF EXISTS is
  preferred for safety if project conventions allow; otherwise plain DROP matching Drizzle
  generate output.

## Out of Scope

- Cloud Run / Scheduler (042).
- Interval polling, SSE, WebSockets, Pub/Sub.
- Manual refresh UI.

## Definition of Done

- Realtime module gone; web has no order/availability streams or poll intervals; purchase
  paths do not write outbox; table dropped by migration; schema/repos/types cleaned; tests
  and checks pass; 042 updated.

## Open Questions

- None.
