## Context

The web header shows “Entradas” for authenticated users. Settings and other authenticated pages live under `/_app` with `RequireAuth` + `PublicAppShell`. Ticket cards list mock purchases. Door-entry needs a larger scannable QR with a short lifetime preview.

## Goals / Non-Goals

**Goals:**

- Authenticated `/tickets` page listing real purchased ticket units as cards.
- Each card: event cover, name, date/time, venue, ticket type, quantity, status, QR visual, and **Abrir QR del ticket**.
- Dialog on open: scannable QR + countdown; at 0 hide QR and show **Obtener nuevo QR**.
- Enable header “Entradas” → `/tickets`.
- Spanish + English i18n.

**Non-Goals:**

- Purchase, DB schema changes, filtering, pagination, and real rotating secrets from the server.

## Decisions

1. **Route under `/_app/tickets`.** Same pattern as `/_app/settings`.

2. **Attendee purchases endpoint.** Add `GET /api/tickets/purchased`, guarded by JWT and the `user` role. It resolves the authenticated account’s user profile, then reads only `tickets_sold` whose order belongs to that user and has `completed` payment status. Each row is one entry unit and includes its stable `qrCode`, `checkedIn`/`usedAt`, ticket type, event, location, and first event image.

3. **Repository and contract.** The Drizzle join lives in `packages/db/src/repositories/`; a new `PurchasedTicketResponse` in `@repo/types` is the shared API/UI contract. No schema migration or request validator is necessary for this read-only endpoint.

4. **Web query.** `apps/web` calls the new endpoint through its existing `QueryFactory` service/query pattern. `MyTicketsPage` renders loading, request-error, zero-purchase, and data states. Cards receive the shared response shape instead of `MockTicket`.

5. **Cards.** `@repo/ui` Card layout with cover, meta, QR icon, CTA opening the dialog. Each card represents a sold ticket unit, so it shows a quantity of one.

6. **QR library: `react-qr-code`.** Reuse the existing dependency. The dialog renders the persisted sold-ticket QR value; countdown/refresh remains a UI preview and does not rotate the server value in this increment.

7. **Countdown.** Constant `MOCK_QR_TTL_SECONDS = 30` (hardcoded). Timer runs while dialog is open and QR is active; clears on close. Expiry → hide QR, show refresh CTA. Refresh resets timer and shows the same persisted value again.

8. **Dialog.** `@repo/ui` `Dialog` / `DialogContent` (same pattern as sign-out dialog). Title includes event name; countdown visible while QR is shown. A checked-in ticket cannot open a QR.

9. **i18n.** `tickets.mine` section includes dialog plus loading, empty, and load-error keys.

10. **Nav enablement.** Active Entradas links for authenticated chrome.

## Risks / Trade-offs

- [A user sees another attendee’s purchase] → Mitigation: ownership filtering occurs in the repository from the JWT subject; the client supplies no user ID.
- [Users expect rotating codes] → Mitigation: persisted QR values are rendered now; rotation stays explicitly out of scope.

## Migration Plan

No DB migrations. Rollback: restore local mocks and remove the read endpoint/contract.

## Open Questions

- The database currently has no checkout flow in scope; endpoint results depend on completed seeded or future checkout rows.
