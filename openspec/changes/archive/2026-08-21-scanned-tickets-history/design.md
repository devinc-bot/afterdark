## Context

The QR ticket check-in flow (`apps/api/src/modules/tickets`, `apps/dashboard/app/modules/ticket-check-ins`) consumes a sold ticket by setting `tickets_sold.checked_in = true` and `used_at`. Today `consumeTicketSoldById` does not record which operator performed the scan, so there is no way to reconstruct who validated a ticket after the fact. Owners and staff need to review scanned tickets per event from the dashboard.

Events belong to an organization (`events.organization_id`). Owners resolve their organization through `organization_accounts_lnk`; staff are members of an organization through the same link table. The current scan authorization (`findTicketCheckInOperatorForLocation`) is location-scoped, while DOMAIN.md states staff access is authorized by organization membership. The new read path uses organization membership so both owners and staff can review the history of their organization's events.

## Goals / Non-Goals

**Goals:**

- Persist the operator identity (account id + role) when a ticket is scanned.
- Expose a paginated, scan-time-descending list of scanned tickets for one event to `owner` and `staff`.
- Return purchaser, operator, and ticket information for each scanned ticket.
- Let staff list the events of their organization so they can select an event.
- Add a **Historial** tab to the dashboard QR Ticket page with an event selector and a paginated table.

**Non-Goals:**

- Changing the existing location-scoped scan authorization.
- Re-scanning, un-scanning, or editing scanned tickets.
- A separate history/audit table, or backfilling operator identity for pre-migration scans.
- Exposing history or event listing to any role other than `owner` and `staff`.

## Decisions

### Store the operator as nullable columns on `tickets_sold`

Add `checked_in_by_account_id` (FK → `accounts.id`) and `checked_in_by_role` (`owner` | `staff`) to `tickets_sold`, both nullable, via a timestamp-prefixed migration. The check-in use case already resolves the operator row (`accountId`, `role`); it passes these into `consumeTicketSoldById`.

A dedicated history table is unnecessary: a sold ticket is consumed at most once, so `tickets_sold` already contains the full scanned state. Adding columns keeps the change minimal and reuses the existing consume path atomically.

### Record role as a snapshot

`checked_in_by_role` captures the role that performed the scan, independent of any later role-link change. The operator's email is joined from `accounts`; the operator's name is resolved with a `LEFT JOIN` to `owners` (via `owner_account_lnk`) and to `staff` (via `staff_account_lnk`) plus a SQL `COALESCE` — only one side matches for a given account. Pre-migration rows have a null operator and render a localized fallback.

### Authorize history reads by organization membership

A new repository `findEventOrganizationByOperator` verifies the event's organization and returns it only when the requester (owner or staff, by `documentId` + role) is a member of that organization. The history use case treats an unresolved organization as `NotFoundException`, mirroring existing repository→`NotFoundException` conventions and avoiding disclosure.

This differs deliberately from the location-scoped scan authorization: reviews are organization-wide, matching DOMAIN.md.

### Extend event listing to staff through organization membership

Add `findEventsPaginatedByOperator` (owner → sole organization; staff → their organizations) and reuse the existing `eventsWithLocationQuery`. The events controller and `ListMyEventsUseCase` accept both `owner` and `staff`, passing the operator role. Staff resolve their organizations through `staff_account_lnk` → `organization_accounts_lnk` → `organizations`.

### New paginated read endpoint

Add `GET /tickets/check-ins/history` (`checkInHistory` in `API_ROUTES.tickets.path`) guarded by `Roles([OWNER, STAFF])`, with query `{ eventId, page, limit }` validated by a shared schema extending `paginationSchema` with `eventId` (`uuidSchema`). Rows are ordered by `used_at DESC`, then `id DESC` for stable pagination. A new repository `findScannedTicketsPaginatedByEvent` joins `tickets_sold` (checked-in only) → `orders` (completed) → `tickets` → `events` → `users`/`accounts` (purchaser) and the operator profile tables.

### Localized copy

Add a `pages.qrTicket.history` section to the dashboard `en.json` and `es.json` with the event-selector label, table headers (scanned date, purchaser, operator, ticket), empty state, and the **No informado** operator fallback.

## Risks / Trade-offs

- Pre-migration scans have no operator → render the localized "not reported" fallback rather than backfilling.
- The operator name COALESCE join spans three profile/link tables → isolate it in one repository function with a focused test.
- Staff gain a new read surface (event listing) → scope it strictly to organization membership and the existing paginated event contract; no new event response fields.
- Ordering on `used_at` alone can be ambiguous for same-millisecond scans → add a secondary `id DESC` key for deterministic pagination.
- Reusing the consume path means the schema change must be atomic with the use-case change → ship the migration and the `consumeTicketSoldById` signature update together.

## Migration Plan

1. Generate a timestamp-prefixed migration adding the two nullable columns to `tickets_sold`; no data backfill.
2. Update `consumeTicketSoldById` and the check-in use case to record the operator in the same transaction.
3. Add the history repository, endpoint, and dashboard tab; extend event listing to staff.
4. Rollback: redeploy the prior API and client; the new columns are nullable and ignored, so existing scans remain compatible.

## Open Questions

- None.
