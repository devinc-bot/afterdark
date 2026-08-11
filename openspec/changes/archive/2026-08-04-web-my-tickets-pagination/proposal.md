# Proposal: Paginate purchased tickets

## Why

The purchased-tickets endpoint currently returns every ticket unit in one response. Pagination keeps the API response and the My Tickets page responsive as a user accumulates purchases.

## Scope

Add page/limit pagination to the authenticated purchased-tickets endpoint and expose page navigation in the web My Tickets view. Reuse the existing shared pagination contract and validator conventions.

## Non-goals

- Changing ticket ownership or payment filtering rules.
- Adding pagination to owner ticket-management endpoints.
- Changing database schema or ticket-card content.

## Affected areas

- `packages/types`: paginated purchased-ticket response type.
- `packages/db`: paginated query and count for completed purchases.
- `apps/api`: query validation, use case, and controller response.
- `apps/web`: query parameters, pagination controls, and i18n copy.
