## 1. Routes & i18n

- [x] 1.1 Add `WEB_ROUTES.tickets()` and create `/_app/tickets` route (page title wiring only; shell can be a stub)
- [x] 1.2 Extend existing `tickets` locales (ES/EN) with a `mine` section for page title, heading, card labels, and status (`válido` / `usado`)

## 2. Mock data & ticket cards UI

- [x] 2.1 Add `modules/tickets` mock data (cover, name, date/time, venue, type, quantity, status) with ≥1 válido and ≥1 usado
- [x] 2.2 Implement `TicketCard` + `MyTicketsPage` (Card layout, QR SVG mock, no empty state) and wire the route to the page

## 3. Navigation

- [x] 3.1 Enable header “Entradas” links (desktop + mobile) to `/tickets` for authenticated chrome; remove disabled “próximamente” affordance
