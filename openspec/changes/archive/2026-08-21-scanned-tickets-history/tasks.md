## 1. Shared Types and Validation

- [x] 1.1 Add `ScannedTicketHistoryResponse` (purchaser, operator, ticket, scannedAt) and the operator-role type to `@repo/types`, exported from the barrel.
- [x] 1.2 Add `listScannedTicketsQuerySchema` (`paginationSchema` + required `eventId` `uuidSchema`) and its input type to `@repo/validators`.
- [x] 1.3 Add the `checkInHistory` path to `API_ROUTES.tickets.path` in `@repo/common`.

## 2. Database

- [x] 2.1 Add nullable `checkedInByAccountId` (FK → `accounts.id`) and `checkedInByRole` (`owner` | `staff`) columns to the `tickets_sold` schema.
- [x] 2.2 Generate the timestamp-prefixed migration for the new columns with `drizzle-kit`.
- [x] 2.3 Update `consumeTicketSoldById` to accept and persist the operator account id and role in the same update.
- [x] 2.4 Add `findEventOrganizationByOperator` repository authorizing owner and staff via organization membership.
- [x] 2.5 Add `findScannedTicketsPaginatedByEvent` repository returning checked-in tickets ordered by `used_at` desc, then `id` desc.
- [x] 2.6 Add `findEventsPaginatedByOperator` and the staff organization resolver, and export all new repositories from `repositories/index.ts`.

## 3. API

- [x] 3.1 Update `CheckInTicketUseCase` to pass the resolved operator identity into `consumeTicketSoldById`.
- [x] 3.2 Add `ListScannedTicketsHistoryUseCase` and its mapper returning the paginated history DTO.
- [x] 3.3 Add the `GET /tickets/check-ins/history` controller method guarded by `Roles([OWNER, STAFF])` with the shared query validator.
- [x] 3.4 Extend the events controller and `ListMyEventsUseCase` to accept `staff` and resolve events by organization membership.
- [x] 3.5 Add focused tests for the history use case, mapper, and repositories.

## 4. Dashboard UI

- [x] 4.1 Add the scanned-tickets history service and the events-list service in the ticket-check-ins module.
- [x] 4.2 Add the history and events TanStack Query hooks.
- [x] 4.3 Add the **Historial** tab to the QR Ticket page with an event selector and a paginated scanned-tickets table.

## 5. Localization and Verification

- [x] 5.1 Add English and Spanish `pages.qrTicket.history` copy (selector label, headers, empty state, **No informado** fallback).
- [x] 5.2 Run focused tests, `pnpm type-check`, `pnpm lint`, and `pnpm format:check`.
