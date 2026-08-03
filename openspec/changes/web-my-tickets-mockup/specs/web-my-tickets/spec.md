## ADDED Requirements

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

The API SHALL expose `GET /api/tickets/purchased` for authenticated `user` accounts. It MUST return only sold ticket units whose order belongs to the authenticated user and has completed payment status. The my-tickets page SHALL consume this endpoint and render a card for each returned sold ticket unit. Each card SHALL show: event cover image, event name, date and time, venue, ticket type, status (`válido` or `usado` via Spanish UI copy), and a QR visual.

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

### Requirement: Ticket QR dialog with countdown

Activating **Abrir QR del ticket** on a card SHALL open a modal dialog that shows a scannable QR code generated with `react-qr-code` from a hardcoded mock payload for that ticket, plus a countdown whose initial duration is a hardcoded mock TTL. While the countdown is greater than zero, the QR MUST remain visible. When the countdown reaches zero, the QR MUST be hidden and a control labeled **Obtener nuevo QR** (Spanish UI) MUST appear. Activating that control SHALL show the QR again and restart the countdown. Closing the dialog SHALL stop the timer.

#### Scenario: Open dialog shows QR and countdown

- **GIVEN** an authenticated user on `/tickets`
- **WHEN** they activate Abrir QR del ticket on a card
- **THEN** a dialog opens showing a scannable QR and a countdown greater than zero

#### Scenario: Countdown expiry

- **GIVEN** the QR dialog is open with an active countdown
- **WHEN** the countdown reaches zero
- **THEN** the QR is no longer shown and Obtener nuevo QR is visible

#### Scenario: Refresh QR

- **GIVEN** the QR dialog is in the expired state
- **WHEN** the user activates Obtener nuevo QR
- **THEN** the QR is shown again and the countdown restarts from the mock TTL
