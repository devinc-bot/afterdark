## REMOVED Requirements

### Requirement: Ticket modal remains available on the tickets list

**Reason**: The tickets list now uses the same full-page create pattern as locations and events; keeping a parallel modal is inconsistent and redundant now that `/tickets/new` exists.

**Migration**: The list create action navigates to `/tickets/new` instead of opening a dialog. Delete `TicketCreateDialog` once unused.

## MODIFIED Requirements

### Requirement: Full-page ticket authoring route

The dashboard SHALL provide a full-page route at `/tickets/new` for creating a ticket. The page SHALL present the ticket fields — event selector (`eventId`), name, type, status, price, quantity, sale start (`saleStartsAt`), sale end (`saleEndsAt`), and description — and SHALL validate them using the ticket schema from `@afterdark/validators`. All UI copy SHALL be in Spanish. The tickets management list create action SHALL navigate to this route (not open a modal).

#### Scenario: Ticket create page renders all fields

- **WHEN** the user opens `/tickets/new`
- **THEN** the page displays the event selector and every ticket field (name, type, status, price, quantity, sale start, sale end, description) on a single page

#### Scenario: Create from the tickets list goes to the page

- **WHEN** the user opens the tickets management list and triggers the create action
- **THEN** the app navigates to `/tickets/new` and does not open a create modal

#### Scenario: Submitting a valid ticket creates it

- **WHEN** the user selects an event and fills all required ticket fields with valid values, and submits
- **THEN** the system creates the ticket and shows a success confirmation

#### Scenario: Submitting an invalid ticket shows validation errors

- **WHEN** the user submits with missing or invalid required fields
- **THEN** the system blocks submission and shows validation messages in Spanish for the invalid fields

## ADDED Requirements

### Requirement: Full-page ticket edit route

The dashboard SHALL provide a full-page route at `/tickets/$documentId/edit` for editing an existing ticket owned by the current owner. The page SHALL reuse the same shared ticket form fields and `@afterdark/validators` validation as create. The tickets management list edit action SHALL navigate to this route (not open an edit modal). On success, the app SHALL return to the tickets list. All UI copy SHALL be in Spanish.

#### Scenario: Edit from the tickets list goes to the page

- **WHEN** the user triggers edit on a ticket row in the tickets management list
- **THEN** the app navigates to `/tickets/{documentId}/edit` and does not open an edit modal

#### Scenario: Edit page loads existing ticket values

- **WHEN** the user opens `/tickets/{documentId}/edit` for a ticket they own
- **THEN** the page shows the shared ticket form prefilled with that ticket's current values

#### Scenario: Submitting a valid edit updates the ticket

- **WHEN** the user changes fields with valid values and submits on the edit page
- **THEN** the system updates the ticket, shows a success confirmation, and navigates back to the tickets list

#### Scenario: Missing or unauthorized ticket on edit

- **WHEN** the user opens `/tickets/{documentId}/edit` for a ticket that does not exist or is not owned by them
- **THEN** the page shows a not-found (or equivalent) state with a way to return to the tickets list

### Requirement: Owner can fetch a single ticket by document id

The API SHALL expose an authenticated owner endpoint to retrieve one ticket by `documentId`, returning the same ticket response shape used by the list, and SHALL reject access when the ticket is missing or not owned by the caller.

#### Scenario: Owner fetches their ticket

- **WHEN** an authenticated owner requests their ticket by `documentId`
- **THEN** the system returns that ticket's data

#### Scenario: Owner fetches a missing or foreign ticket

- **WHEN** an authenticated owner requests a `documentId` that does not exist or belongs to another owner
- **THEN** the system responds with not-found (or equivalent unauthorized-as-not-found) and does not return ticket data
