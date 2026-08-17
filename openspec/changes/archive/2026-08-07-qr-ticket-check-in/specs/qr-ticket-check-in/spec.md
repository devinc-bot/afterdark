## ADDED Requirements

### Requirement: Owner and staff can access QR Ticket

The dashboard SHALL expose an authenticated **QR Ticket** sidebar entry and page for `owner` and `staff` accounts. The API MUST enforce the same allowed roles independently of the dashboard UI.

#### Scenario: Owner opens QR Ticket

- **GIVEN** an authenticated `owner`
- **WHEN** they activate **QR Ticket** in the sidebar
- **THEN** the dashboard opens the QR ticket scanner

#### Scenario: Staff opens QR Ticket

- **GIVEN** an authenticated `staff` member
- **WHEN** they activate **QR Ticket** in the sidebar
- **THEN** the dashboard opens the QR ticket scanner

#### Scenario: Another role requests the scanner API

- **GIVEN** an authenticated account whose role is neither `owner` nor `staff`
- **WHEN** it requests the ticket-scanning endpoint
- **THEN** the API rejects the request without exposing ticket, event, or purchaser information

### Requirement: Operators can scan tickets only for authorized event locations

An owner SHALL be authorized only for events at locations they own. Staff SHALL be authorized only for events at locations to which they are assigned. A validly signed ticket outside the operator's scope MUST be presented as invalid and MUST NOT expose its data.

#### Scenario: Owner scans a ticket for an owned location

- **GIVEN** a ticket belongs to an event at a location owned by the authenticated owner
- **WHEN** the owner scans its valid QR
- **THEN** the API permits ticket validation

#### Scenario: Staff scans a ticket for an assigned location

- **GIVEN** a ticket belongs to an event at a location assigned to the authenticated staff member
- **WHEN** the staff member scans its valid QR
- **THEN** the API permits ticket validation

#### Scenario: Operator scans a ticket outside their scope

- **GIVEN** a validly signed ticket belongs to an event outside the authenticated operator's authorized locations
- **WHEN** the operator scans it
- **THEN** the dashboard shows the generic invalid-QR result and exposes no event or purchaser information

### Requirement: A valid scan consumes the sold ticket exactly once

The API MUST validate the scanned QR, require its sold ticket to belong to a completed-payment order, and atomically change an unused ticket to `checkedIn = true` with `usedAt` set from the server clock. The ticket SHALL be consumed automatically without a separate confirmation action.

#### Scenario: Valid unused ticket is consumed

- **GIVEN** an authorized operator scans a valid, unexpired, unused ticket from a completed-payment order
- **WHEN** the API validates the scan
- **THEN** the ticket is marked used exactly once before success is returned

#### Scenario: Ticket order is not completed

- **GIVEN** a sold ticket is associated with an order whose payment is not completed
- **WHEN** an operator scans its QR
- **THEN** the scan is rejected as invalid and the ticket remains unused

#### Scenario: Concurrent scans target the same ticket

- **GIVEN** two authorized operators scan the same unused ticket concurrently
- **WHEN** both requests attempt to consume it
- **THEN** exactly one succeeds and the other receives the already-used result

### Requirement: Scan outcomes are explicit

The dashboard SHALL distinguish invalid or foreign QR codes, expired QR codes, already-used tickets, and successful scans. Invalid, expired, used, or unauthorized scans MUST NOT modify the ticket.

#### Scenario: Invalid or foreign QR

- **GIVEN** the scanned value is not a valid ticket QR issued by Event Flow
- **WHEN** the operator scans it
- **THEN** the dashboard shows **El ticket no es válido o no pertenece a Event Flow**

#### Scenario: Expired QR

- **GIVEN** an unused ticket QR has expired
- **WHEN** the operator scans it
- **THEN** the dashboard shows **El código QR del ticket venció** and leaves the ticket unused

#### Scenario: Already-used ticket

- **GIVEN** a ticket was already consumed, whether or not its matching QR has since expired
- **WHEN** an authorized operator scans its matching QR again
- **THEN** the dashboard shows **Este ticket ya fue usado** and preserves its original usage time

#### Scenario: Replaced QR is scanned

- **GIVEN** an unused ticket received a replacement QR
- **WHEN** an operator scans the previously persisted QR before its signed expiration
- **THEN** the dashboard shows the generic invalid-QR result and leaves the ticket unused

### Requirement: Successful scan shows event and purchaser details

After the ticket has been consumed, the dashboard SHALL show **Ticket escaneado correctamente** in Spanish, with equivalent localized English copy, plus event name, event date and time, location, ticket type, purchaser full name, purchaser email, and purchaser phone.

#### Scenario: Successful scan details are visible

- **GIVEN** an authorized operator successfully consumes a ticket
- **WHEN** the success result renders
- **THEN** the dashboard shows the success message and all required event, location, ticket, and purchaser fields

### Requirement: Scanning resumes only on operator action

The scanner SHALL pause after receiving any scan result to prevent repeated submissions. The result view SHALL provide **Escanear siguiente ticket**, which clears the previous result and resumes the camera.

#### Scenario: Scan result pauses the scanner

- **GIVEN** the scanner is active
- **WHEN** any scan result is received
- **THEN** further camera detections are ignored while that result remains visible

#### Scenario: Operator scans the next ticket

- **GIVEN** a scan result is visible
- **WHEN** the operator activates **Escanear siguiente ticket**
- **THEN** the result is cleared and QR scanning resumes

#### Scenario: Camera permission or availability fails

- **GIVEN** camera permission is denied or no compatible camera is available
- **WHEN** the scanner attempts to start
- **THEN** the page shows a localized camera error with **Reintentar** and does not offer manual token entry

### Requirement: Check-in API contract is explicit and validated

The API SHALL expose `POST /api/tickets/check-ins` for authenticated `owner` and `staff` accounts. Its `{ token }` request body MUST be validated through `@repo/validators`. It SHALL return `200` after a successful scan, `409` for an already-used ticket, `410` for an expired unused QR, and `422` for an invalid or foreign QR, incomplete-payment ticket, or ticket outside the operator's authorized locations. A `422` response MUST use the same public message and MUST NOT reveal which protected validation failed.

#### Scenario: Valid request succeeds

- **GIVEN** an authorized operator submits a valid unused ticket QR from a completed order
- **WHEN** `POST /api/tickets/check-ins` completes
- **THEN** it returns `200` with the success details after marking the ticket used

#### Scenario: Request body is malformed

- **GIVEN** a request without a valid token string
- **WHEN** it reaches `POST /api/tickets/check-ins`
- **THEN** the shared Zod validator rejects it before ticket lookup or mutation

#### Scenario: Protected validation fails

- **GIVEN** a QR is invalid, foreign, associated with incomplete payment, or outside the operator's scope
- **WHEN** it is submitted
- **THEN** the API returns `422` with the generic invalid-ticket message and no protected ticket data

### Requirement: QR Ticket has a role-aware dashboard route

The dashboard SHALL register `/qr-ticket`, add **QR Ticket** to the role-aware sidebar, and permit that route for `owner` and `staff`. Other dashboard roles MUST NOT be granted route access.

#### Scenario: Authorized role navigates directly

- **GIVEN** an authenticated owner or staff member
- **WHEN** they navigate directly to `/qr-ticket`
- **THEN** the QR Ticket page renders

#### Scenario: Unauthorized role navigates directly

- **GIVEN** an authenticated account with another role
- **WHEN** it navigates directly to `/qr-ticket`
- **THEN** the dashboard applies its existing role-route fallback behavior

### Requirement: Existing sold-ticket fields store usage state

The implementation SHALL reuse `tickets_sold.qr_code`, `tickets_sold.checked_in`, and `tickets_sold.used_at`. It MUST NOT add a table, column, or migration for this feature.

#### Scenario: Successful scan persists existing fields

- **GIVEN** a valid unused ticket
- **WHEN** its scan succeeds
- **THEN** `checked_in` becomes true and `used_at` stores the server timestamp without creating another persistence record

### Requirement: Missing purchaser phone has a localized fallback

When purchaser phone is absent, the success result SHALL show **No informado** in Spanish, with equivalent localized English copy, instead of an empty value.

#### Scenario: Purchaser phone is absent

- **GIVEN** a successfully scanned ticket whose purchaser has no phone number
- **WHEN** the success details render
- **THEN** the phone field shows **No informado**
