## ADDED Requirements

### Requirement: Expire Checkout Pro preference before manual deletion

The system SHALL expire an order's active Mercado Pago Checkout Pro preference before permanently deleting that order at the buyer's request. If the order has a persisted preference id and Mercado Pago does not confirm the expiration update, the system MUST retain the local order and return a localized error. An order without a persisted preference id MAY proceed directly to pending-only local deletion.

#### Scenario: Active preference is expired before deletion

- **GIVEN** an authenticated buyer owns a pending order with a persisted Checkout Pro preference id
- **WHEN** the buyer confirms deletion
- **THEN** the API expires the preference through the Mercado Pago adapter before attempting the local database delete

#### Scenario: Preference expiration fails

- **GIVEN** an authenticated buyer owns a pending order with a persisted Checkout Pro preference id
- **WHEN** Mercado Pago rejects or fails the expiration update
- **THEN** the API returns a localized deletion error and keeps the local order

#### Scenario: Pending order has no preference id

- **GIVEN** an authenticated buyer owns a pending order whose Checkout Pro preference was never persisted
- **WHEN** the buyer confirms deletion
- **THEN** the API skips provider expiration and applies the buyer-scoped pending-only local delete
