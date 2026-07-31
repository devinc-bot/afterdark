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

### Requirement: Purchased tickets are listed as cards with mock data

The my-tickets page SHALL list the user’s purchased tickets as cards. For this change the list MUST come from local mock data (no API). The page MUST NOT render an empty state. Each card SHALL show: event cover image, event name, date and time, venue, ticket type, quantity, status (`válido` or `usado` via Spanish UI copy), and a QR visual.

#### Scenario: Card fields visible

- **GIVEN** an authenticated user on `/tickets`
- **WHEN** the page renders
- **THEN** at least one ticket card is shown and each card displays cover, name, date/time, venue, ticket type, quantity, status, and a QR

#### Scenario: Both statuses represented in mock data

- **GIVEN** an authenticated user on `/tickets`
- **WHEN** the mock list renders
- **THEN** the list includes at least one ticket with status válido and at least one with status usado

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
