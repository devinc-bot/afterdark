## Why

Authenticated attendees need a place to see the tickets they bought. The header already surfaces “Entradas”; the list mock validates card UX before purchase/API work. Opening a scannable QR in a modal with a short-lived countdown previews door-entry UX before real ticket codes exist.

## What Changes

- Add an authenticated web route `/tickets` (`WEB_ROUTES.tickets()`) under the `_app` layout (`RequireAuth`).
- Render a mockup list of purchased tickets as **cards** (no API, no empty state). Each card shows: event cover, event name, date/time, venue, ticket type, quantity, status (`válido` / `usado`), and a QR visual.
- Activate the header “Entradas” nav link (desktop + mobile) for authenticated users so it navigates to `/tickets`.
- **Abrir QR del ticket** opens a dialog with a scannable QR (`react-qr-code`, same as dashboard), a hardcoded countdown, and when it hits 0 the QR is replaced by **Obtener nuevo QR** (resets countdown + shows QR again).
- Add Spanish/English i18n keys for the page, cards, and QR dialog.

## Non-goals

- Purchase flow, payment, or inventory.
- Real ticket API, DB schema, or server-issued rotating codes.
- Empty state when the user has no tickets.
- Ticket detail page, transfer, refund, or PDF download.
- Dashboard / owner-facing ticket views.
- Filtering, sorting, or pagination beyond a simple static mock list.

## Capabilities

### New Capabilities

- `web-my-tickets`: Authenticated public-site “my tickets” page that lists the user’s purchased tickets as cards, with a QR modal + countdown mock for entry preview.

### Modified Capabilities

- (none)

## Impact

- **Apps:** `apps/web` (route, tickets module, header nav, QR dialog).
- **Packages:** `packages/i18n` (page/card/dialog copy).
- **Deps:** `react-qr-code` on `@repo/web` (already used by dashboard; prefer over a second QR library).
