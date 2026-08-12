# web-my-tickets Specification

## Purpose
TBD - created by archiving change web-my-tickets-mockup. Update Purpose after archive.
## Requirements
### Requirement: My tickets route exists and is authenticated

The public site SHALL expose a `/tickets` route registered as `WEB_ROUTES.tickets()` and rendered inside the authenticated `_app` layout (`RequireAuth` + public shell). Visitors without a valid session MUST be redirected to the login page.

#### Scenario: Authenticated access

- **GIVEN** an authenticated user
- **WHEN** they navigate to `/tickets`
- **THEN** the my-tickets page renders inside the public shell (header and footer visible)

#### Scenario: Unauthenticated access

- **GIVEN** a visitor without a valid session
- **WHEN** they navigate to `/tickets`
- **THEN** they are redirected to the login page

### Requirement: Purchased tickets are listed as cards from the authenticated user’s purchases

The API SHALL expose `GET /api/tickets/purchased` for authenticated `user` accounts. It MUST return only sold ticket units whose order belongs to the authenticated user and has completed payment status, and it MUST NOT expose the persisted QR token. The my-tickets page SHALL consume this endpoint and render a card for each returned sold ticket unit. Each card SHALL show: event cover image, event name, date and time, venue, ticket type, status (`válido` or `usado` via Spanish UI copy), and a QR visual.

#### Scenario: Card fields visible

- **GIVEN** an authenticated user with completed purchases on `/tickets`
- **WHEN** the page renders
- **THEN** one card per purchased ticket unit is shown and each card displays cover, name, date/time, venue, ticket type, status, and a QR

#### Scenario: Purchases belong only to the current user

- **GIVEN** purchases exist for two different users
- **WHEN** one user requests `GET /api/tickets/purchased`
- **THEN** the response excludes every ticket unit purchased by the other user

#### Scenario: No completed purchases

- **GIVEN** an authenticated user without completed purchases
- **WHEN** they navigate to `/tickets`
- **THEN** the page renders an empty state in the active locale

### Requirement: Header Entradas navigates to my tickets

For authenticated users (including session-loading chrome), the header “Entradas” control (desktop and mobile) SHALL be an active link to `/tickets`, not a disabled “próximamente” affordance.

#### Scenario: Desktop nav

- **GIVEN** an authenticated user viewing any public page with the header
- **WHEN** they activate the desktop “Entradas” link
- **THEN** they navigate to `/tickets`

#### Scenario: Mobile nav

- **GIVEN** an authenticated user with the mobile nav sheet open
- **WHEN** they activate the “Entradas” link
- **THEN** they navigate to `/tickets` and the sheet closes per existing sheet-link behavior

### Requirement: Server-issued ticket QR dialog with countdown

The API SHALL expose `GET /api/tickets/purchased/:ticketSoldId/qr` for authenticated `user` accounts. It MUST verify that the sold ticket belongs to the authenticated user and has a completed order, generate a JWT with `userId`, `ticketSoldId`, and `eventId`, set its lifetime to 20 minutes, persist it in `tickets_sold.qrCode`, and return the token, expiration, and the ticket information required by the QR dialog. Activating **Abrir QR del ticket** SHALL request this payload and render its token as a scannable QR using `react-qr-code`. While the returned expiration has not elapsed, the QR MUST remain visible. When it expires, the QR MUST be hidden and **Obtener nuevo QR** (Spanish UI) MUST request a fresh payload. Closing the dialog SHALL stop the timer.

#### Scenario: Open dialog shows QR and countdown

- **GIVEN** an authenticated user on `/tickets`
- **WHEN** they activate Abrir QR del ticket on a card
- **THEN** a dialog opens, requests the QR payload, and shows its scannable JWT QR with a countdown derived from its returned expiration

#### Scenario: QR payload is scoped to the authenticated purchase

- **GIVEN** a sold ticket owned by another user or without a completed order
- **WHEN** an authenticated user requests `GET /api/tickets/purchased/:ticketSoldId/qr`
- **THEN** the API rejects the request and does not generate or persist a QR JWT

#### Scenario: Countdown expiry

- **GIVEN** the QR dialog is open with an active countdown
- **WHEN** the countdown reaches zero
- **THEN** the QR is no longer shown and Obtener nuevo QR is visible

#### Scenario: Refresh QR

- **GIVEN** the QR dialog is in the expired state
- **WHEN** the user activates Obtener nuevo QR
- **THEN** the dialog requests a new QR JWT, renders it, and restarts the countdown from its returned 20-minute expiration

