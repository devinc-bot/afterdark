## Why

Authenticated attendees need a place to see the tickets they bought. The header already surfaces “Entradas” as disabled (“próximamente”); enabling a mock list unlocks the navigation path and validates card UX before purchase/API work lands.

## What Changes

- Add an authenticated web route `/tickets` (`WEB_ROUTES.tickets()`) under the `_app` layout (`RequireAuth`).
- Render a mockup list of purchased tickets as **cards** (no API, no empty state). Each card shows: event cover, event name, date/time, venue, ticket type, quantity, status (`válido` / `usado`), and a QR code (static mock).
- Activate the header “Entradas” nav link (desktop + mobile) for authenticated users so it navigates to `/tickets`.
- Add Spanish/English i18n keys for the page and card labels.

## Non-goals

- Purchase flow, payment, or inventory.
- Real ticket API, DB schema, or QR generation from ticket codes.
- Empty state when the user has no tickets.
- Ticket detail page, transfer, refund, or PDF download.
- Dashboard / owner-facing ticket views.
- Filtering, sorting, or pagination beyond a simple static mock list.

## Capabilities

### New Capabilities

- `web-my-tickets`: Authenticated public-site “my tickets” page that lists the user’s purchased tickets as cards (mock data for this change).

### Modified Capabilities

- (none — header “Entradas” enablement is part of `web-my-tickets` navigation requirements)

## Impact

- **Apps:** `apps/web` (route, page/module components, header nav).
- **Packages:** `packages/i18n` (page/card copy); possibly `packages/common` if a shared client route constant is added; no `api`, `db`, `validators`, or `dashboard` changes.
- **Deps:** a lightweight QR mock (e.g. placeholder image or a small QR lib with a fixed payload) — decided in design.
