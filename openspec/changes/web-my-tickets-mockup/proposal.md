## Why

Authenticated attendees need a place to see the tickets they bought. The current page validates card UX with local mock data, but cannot show a user’s actual purchases.

## What Changes

- Add an authenticated web route `/tickets` (`WEB_ROUTES.tickets()`) under the `_app` layout (`RequireAuth`).
- Add an authenticated attendee endpoint that returns the user’s purchased ticket units, joined with their ticket type, event, location, and event cover.
- Replace the local mock list in `/tickets` with cards rendered from that endpoint. Each card shows: event cover, event name, date/time, venue, ticket type, status (`válido` / `usado`), and its QR visual.
- Activate the header “Entradas” nav link (desktop + mobile) for authenticated users so it navigates to `/tickets`.
- **Abrir QR del ticket** opens a dialog with a scannable QR (`react-qr-code`, same as dashboard), a hardcoded countdown, and when it hits 0 the QR is replaced by **Obtener nuevo QR** (resets countdown + shows QR again).
- Add Spanish/English i18n keys for the page, cards, and QR dialog.

## Non-goals

- Purchase flow, payment, or inventory.
- DB schema changes or server-issued rotating codes.
- Ticket detail page, transfer, refund, or PDF download.
- Dashboard / owner-facing ticket views.
- Filtering, sorting, pagination, ticket transfer, refund, or PDF download.

## Capabilities

### New Capabilities

- `web-my-tickets`: Authenticated public-site “my tickets” page that lists the user’s purchased tickets as cards, with a QR modal + countdown mock for entry preview.

### Modified Capabilities

- (none)

## Impact

- **Apps:** `apps/api` (attendee tickets endpoint), `apps/web` (route and tickets module).
- **Packages:** `packages/db` (read repository), `packages/types` (response contract), `packages/i18n` (empty/error copy if needed).
