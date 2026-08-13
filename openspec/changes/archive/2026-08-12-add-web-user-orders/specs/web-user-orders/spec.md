## ADDED Requirements

### Requirement: Paginated buyer order history API

The API SHALL expose an authenticated paginated order-history endpoint for `USER` accounts. It MUST derive the buyer from the authenticated JWT, validate pagination with `@repo/validators`, return only that buyer's orders in newest-first deterministic order, and include public ticket and event context required by the web UI.

#### Scenario: Buyer lists their orders

- **GIVEN** an authenticated user with orders in multiple payment statuses
- **WHEN** the user requests a valid order-history page
- **THEN** the API returns the requested page with pagination metadata and order summaries ordered from newest to oldest

#### Scenario: Orders remain buyer scoped

- **GIVEN** orders belonging to multiple users
- **WHEN** one authenticated user requests an order-history page
- **THEN** the response rows and total include only that user's orders

#### Scenario: Invalid pagination is rejected

- **GIVEN** an authenticated user and pagination input that fails `@repo/validators`
- **WHEN** the user requests their order history
- **THEN** the API rejects the request without querying another user's orders

### Requirement: Buyer deletes a pending order

The API SHALL allow an authenticated `USER` to permanently delete only an order that belongs to that user and is still `pending`. The final database delete MUST atomically constrain the order identity, buyer identity, and pending status. The API MUST NOT disclose whether an inaccessible order belongs to another user.

#### Scenario: Pending order is deleted

- **GIVEN** an authenticated user owns a pending order whose provider preference has been expired or was never created
- **WHEN** the user confirms deletion
- **THEN** the API permanently deletes that pending order and returns a successful empty response

#### Scenario: Non-pending order is retained

- **GIVEN** an authenticated user owns a completed, rejected, or cancelled order
- **WHEN** the user attempts to delete it
- **THEN** the API returns a localized conflict error and leaves the order unchanged

#### Scenario: Missing or foreign order is hidden

- **GIVEN** an order does not exist or belongs to another user
- **WHEN** the authenticated user attempts to delete it
- **THEN** the API returns the same localized not-found response and deletes nothing

#### Scenario: Status changes during deletion

- **GIVEN** an authenticated user starts deleting a pending order
- **WHEN** payment reconciliation changes the order to a non-pending status before the final database delete
- **THEN** the atomic delete does not remove the order and the API reports that it can no longer be deleted

### Requirement: Authenticated web orders page

`apps/web` SHALL expose `/orders` inside the authenticated application shell and link it from authenticated desktop and mobile navigation. The page MUST show localized order summaries, payment-status labels, totals, quantities, dates, pagination, and responsive loading, error, empty, and data states in English and Spanish.

#### Scenario: Orders render on desktop and mobile

- **GIVEN** an authenticated user has orders
- **WHEN** the user opens `/orders` on a desktop or mobile viewport
- **THEN** the page renders a readable responsive list with ticket or event context, localized status, amount, quantity, and order date for each order

#### Scenario: Loading and failure states

- **GIVEN** the order-history request is loading or fails
- **WHEN** the page renders
- **THEN** it shows accessible localized skeleton or inline error feedback and offers retry after a failure

#### Scenario: Empty history guides discovery

- **GIVEN** an authenticated user has no orders
- **WHEN** the user opens `/orders`
- **THEN** the page explains that there are no orders and offers a localized path to discover events

#### Scenario: Navigate order pages

- **GIVEN** the authenticated user's order history has more than one page
- **WHEN** the user selects another page
- **THEN** the page requests and renders that page while preserving clear loading feedback

### Requirement: Pending-order retention notice

The orders page SHALL display a localized informational notice above the order list stating that pending orders older than one month are deleted automatically.

#### Scenario: Retention policy is visible

- **GIVEN** an authenticated user opens `/orders`
- **WHEN** the page header and content render
- **THEN** the retention notice appears above loading, error, empty, or order-list content

### Requirement: Pending-order deletion interaction

The orders page SHALL show a delete action only for pending orders. It MUST require explicit confirmation, prevent duplicate submissions, retain the dialog on failure, and refresh the order history after success.

#### Scenario: User confirms deletion

- **GIVEN** a pending order is visible on the orders page
- **WHEN** the user opens the deletion confirmation and confirms it
- **THEN** the action remains disabled while submitting, the dialog closes after success, localized success feedback appears, and the order list refreshes

#### Scenario: Deletion fails

- **GIVEN** a pending order is visible and the deletion request fails
- **WHEN** the user confirms deletion
- **THEN** the dialog remains available, localized error feedback appears, and the order remains in the list

#### Scenario: Non-pending order has no delete action

- **GIVEN** a completed, rejected, or cancelled order is visible
- **WHEN** the order summary renders
- **THEN** no deletion control is offered for that order
