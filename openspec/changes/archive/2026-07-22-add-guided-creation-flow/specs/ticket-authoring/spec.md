## ADDED Requirements

### Requirement: Full-page ticket authoring route

The dashboard SHALL provide a full-page route at `/tickets/new` for creating a ticket. The page SHALL present the same fields as the ticket create modal — event selector (`eventId`), name, type, status, price, quantity, sale start (`saleStartsAt`), sale end (`saleEndsAt`), and description — and SHALL validate them using the ticket schema from `@repo/validators`. All UI copy SHALL be in Spanish.

#### Scenario: Ticket create page renders all fields

- **WHEN** the user opens `/tickets/new`
- **THEN** the page displays the event selector and every ticket field (name, type, status, price, quantity, sale start, sale end, description) on a single page

#### Scenario: Submitting a valid ticket creates it

- **WHEN** the user selects an event and fills all required ticket fields with valid values, and submits
- **THEN** the system creates the ticket and shows a success confirmation

#### Scenario: Submitting an invalid ticket shows validation errors

- **WHEN** the user submits with missing or invalid required fields
- **THEN** the system blocks submission and shows validation messages in Spanish for the invalid fields

### Requirement: Ticket modal remains available on the tickets list

Adding the `/tickets/new` route SHALL NOT remove the ticket creation modal on the tickets management list; both entry points SHALL create tickets using the same shared form and validation.

#### Scenario: Modal still opens from the tickets list

- **WHEN** the user opens the tickets management list and triggers the create action
- **THEN** the ticket create modal opens with the same fields as the `/tickets/new` page
