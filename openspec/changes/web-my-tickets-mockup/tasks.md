## 1. Routes & i18n

- [x] 1.1 Add `WEB_ROUTES.tickets()` and create `/_app/tickets` route (page title wiring only; shell can be a stub)
- [x] 1.2 Extend existing `tickets` locales (ES/EN) with a `mine` section for page title, heading, card labels, and status (`válido` / `usado`)

## 2. Mock data & ticket cards UI

- [x] 2.1 Add `modules/tickets` mock data (cover, name, date/time, venue, type, quantity, status) with ≥1 válido and ≥1 usado
- [x] 2.2 Implement `TicketCard` + `MyTicketsPage` (Card layout, QR SVG mock, no empty state) and wire the route to the page

## 3. Navigation

- [x] 3.1 Enable header “Entradas” links (desktop + mobile) to `/tickets` for authenticated chrome; remove disabled “próximamente” affordance

## 4. QR dialog

- [x] 4.1 Add `react-qr-code` to `@repo/web` (same version as dashboard) and i18n keys for the QR dialog (title, countdown, expired, refresh)
- [x] 4.2 Implement `TicketQrDialog` (scannable QR, hardcoded TTL countdown, expiry → Obtener nuevo QR) and wire Abrir QR on `TicketCard`

## 5. Real purchased tickets

- [x] 5.1 Add `PurchasedTicketResponse`, the `GET /tickets/purchased` route contract, and a DB repository that returns completed purchases owned by the authenticated user.
- [x] 5.2 Add the JWT + `user`-role API use case/controller endpoint, mapping the purchased-ticket rows and their event cover to the shared response.
- [x] 5.3 Replace `MOCK_TICKETS` with a web service/query and render loading, error, empty, and purchased-ticket card states; pass each persisted QR value into the dialog.
- [x] 5.4 Add ES/EN copy for the new page states and verify type-check, lint, format, and i18n.
