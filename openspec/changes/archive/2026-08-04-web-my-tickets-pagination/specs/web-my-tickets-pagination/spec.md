# Web My Tickets pagination

## Requirements

### Requirement: Paginated purchased-ticket API

The API SHALL expose `GET /api/tickets/purchased?page={page}&limit={limit}` for authenticated `user` accounts and SHALL return `PaginatedResponse<PurchasedTicketResponse>`.

#### Scenario: First page

- **GIVEN** an authenticated user with completed purchased ticket units
- **WHEN** the user requests `GET /api/tickets/purchased?page=1&limit=10`
- **THEN** the response contains at most 10 ticket units, the total matching units, the requested page and limit, and the computed total pages

#### Scenario: Only the authenticated user's purchases are returned

- **GIVEN** completed purchases belonging to multiple users
- **WHEN** one user requests any purchased-ticket page
- **THEN** rows and total include only that user's completed purchases

#### Scenario: Invalid pagination input

- **GIVEN** a request with a page below 1, a limit below 1, or a limit above 100
- **WHEN** the endpoint validates the query
- **THEN** it rejects the request using the shared `paginationSchema` rules

### Requirement: Paginated My Tickets UI

The My Tickets page SHALL request the active page and limit and SHALL render pagination controls when more than one page exists.

#### Scenario: Navigate pages

- **GIVEN** a paginated response with more than one page
- **WHEN** the user selects another page
- **THEN** the page requests that page and renders only its returned cards

#### Scenario: Single page or empty result

- **GIVEN** a response with zero or one total page
- **THEN** pagination controls are hidden and existing empty/loading/error states remain unchanged
