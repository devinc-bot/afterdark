## Context

The web header shows “Entradas” for authenticated users. Settings and other authenticated pages live under `/_app` with `RequireAuth` + `PublicAppShell`. Ticket cards list mock purchases. Door-entry needs a larger scannable QR with a short lifetime preview.

## Goals / Non-Goals

**Goals:**

- Authenticated `/tickets` page listing real purchased ticket units as cards.
- Each card: event cover, name, date/time, venue, ticket type, quantity, status, QR visual, and **Abrir QR del ticket**.
- Dialog on open: requests a server-issued QR JWT, shows a scannable QR + its 20-minute countdown; at 0 hides QR and shows **Obtener nuevo QR**.
- Enable header “Entradas” → `/tickets`.
- Spanish + English i18n.

**Non-Goals:**

- Purchase, DB schema changes, filtering, pagination, ticket transfer, refund, or PDF download.

## Decisions

1. **Route under `/_app/tickets`.** Same pattern as `/_app/settings`.

2. **Attendee purchases endpoint.** Add `GET /api/tickets/purchased`, guarded by JWT and the `user` role. It resolves the authenticated account’s user profile, then reads only `tickets_sold` whose order belongs to that user and has `completed` payment status. Each row is one entry unit and includes `checkedIn`/`usedAt`, ticket type, event, location, and first event image. It MUST NOT expose the persisted QR token.

3. **Repository and contract.** The Drizzle join lives in `packages/db/src/repositories/`; a new `PurchasedTicketResponse` in `@repo/types` is the shared API/UI contract. No schema migration or request validator is necessary for this read-only endpoint.

4. **Web query.** `apps/web` calls the new endpoint through its existing `QueryFactory` service/query pattern. `MyTicketsPage` renders loading, request-error, zero-purchase, and data states. Cards receive the shared response shape instead of `MockTicket`.

5. **Cards.** `@repo/ui` Card layout with cover, meta, QR icon, CTA opening the dialog. Each card represents a sold ticket unit, so it shows a quantity of one.

6. **QR library: `react-qr-code`.** Reuse the existing dependency. When the dialog opens, the web app requests `GET /api/tickets/purchased/:ticketSoldId/qr`. The API verifies the sold ticket belongs to the authenticated user and has a completed order, generates a JWT containing `userId`, `ticketSoldId`, and `eventId`, persists it in `tickets_sold.qrCode`, and returns it with its expiration and ticket-modal data.

7. **Countdown.** Server-issued JWTs expire after 20 minutes. The dialog derives its countdown from the returned expiration, clears the timer on close, and hides the QR at expiry. Refresh requests a newly generated JWT and updates the displayed code and expiration.

8. **Dialog.** `@repo/ui` `Dialog` / `DialogContent` (same pattern as sign-out dialog). Title includes event name; countdown visible while QR is shown. A checked-in ticket cannot open a QR.

9. **i18n.** `tickets.mine` section includes dialog plus loading, empty, and load-error keys.

10. **Nav enablement.** Active Entradas links for authenticated chrome.

## Risks / Trade-offs

- [A user sees another attendee’s purchase] → Mitigation: ownership filtering occurs in the repository from the JWT subject; the client supplies no user ID.
- [A QR is issued for another user’s ticket] → Mitigation: the API derives ownership from the JWT subject and rejects sold-ticket IDs outside that user’s completed purchases.

## Migration Plan

No DB migrations. Rollback: restore local mocks and remove the read endpoint/contract.

## Open Questions

- The database currently has no checkout flow in scope; endpoint results depend on completed seeded or future checkout rows.
