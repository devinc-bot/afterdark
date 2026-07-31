## Context

The web header shows “Entradas” for authenticated users. Settings and other authenticated pages live under `/_app` with `RequireAuth` + `PublicAppShell`. Ticket cards list mock purchases. Door-entry needs a larger scannable QR with a short lifetime preview.

## Goals / Non-Goals

**Goals:**

- Authenticated `/tickets` page listing mock purchased tickets as cards.
- Each card: event cover, name, date/time, venue, ticket type, quantity, status, QR visual, and **Abrir QR del ticket**.
- Dialog on open: scannable QR + countdown; at 0 hide QR and show **Obtener nuevo QR**.
- Enable header “Entradas” → `/tickets`.
- Spanish + English i18n.

**Non-Goals:**

- API, DB, validators, purchase, empty state, real rotating secrets from the server.

## Decisions

1. **Route under `/_app/tickets`.** Same pattern as `/_app/settings`.

2. **Module layout.** `apps/web/app/modules/tickets/` with page, card, mock data, and `ticket-qr-dialog.tsx`.

3. **Cards.** `@repo/ui` Card layout with cover, meta, stub QR icon, CTA opening the dialog.

4. **QR library: `react-qr-code`.** Already pinned in `@repo/dashboard` (`2.0.18`). Add the same dep to `@repo/web` instead of `@lglab/react-qr-code` to avoid two QR stacks. Hardcoded payload per ticket (e.g. `afterdark-mock-ticket:{id}`).

5. **Countdown.** Constant `MOCK_QR_TTL_SECONDS = 30` (hardcoded). Timer runs while dialog is open and QR is active; clears on close. Expiry → hide QR, show refresh CTA. Refresh resets timer and shows QR again (same mock value for now).

6. **Dialog.** `@repo/ui` `Dialog` / `DialogContent` (same pattern as sign-out dialog). Title includes event name; countdown visible while QR is shown.

7. **i18n.** `tickets.mine` section extended with dialog keys (`openQr`, dialog title, countdown, expired, refresh).

8. **Nav enablement.** Active Entradas links for authenticated chrome.

9. **No empty state.** Mock list always has ≥1 ticket.

## Risks / Trade-offs

- [Users expect real rotating codes] → Mitigation: mock payload + TTL constant documented; swap when API lands.
- [Two QR libs if we added @lglab] → Mitigation: reuse `react-qr-code`.

## Migration Plan

No DB/API migrations. Rollback: remove dialog + dep + i18n keys.

## Open Questions

- None blocking (TTL hardcoded at 30s for the mock).
