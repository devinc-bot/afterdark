# mercado-pago-orders Specification

## Purpose
TBD - created by archiving change ticket-payments-mercado-pago. Update Purpose after archive.
## Requirements
### Requirement: Create pending order for ticket purchase

The system SHALL allow an authenticated `USER` to create a pending order for a ticket of a published event, validated via `@repo/validators`. The order MUST reference the buyer user and ticket, store amount and quantity, set `provider` to `mercado_pago`, and set status to `pending`. Creation MUST fail when the ticket is not on sale, inactive, out of stock for the requested quantity, or Afterdark's Mercado Pago account is not configured.

#### Scenario: Successful pending order

- **GIVEN** a logged-in user, an on-sale active ticket with sufficient remaining stock, and a configured Afterdark Mercado Pago account
- **WHEN** the user submits a valid create-order request
- **THEN** the API creates an `orders` row with status `pending` and returns the order identity needed for payment

#### Scenario: Reject when platform payments are not configured

- **GIVEN** Afterdark's Mercado Pago account is not configured
- **WHEN** the user attempts to create an order
- **THEN** the API rejects the request with a Spanish error via i18n error codes and no order is created

#### Scenario: Reject unauthenticated buyer

- **GIVEN** no valid user session
- **WHEN** a create-order request is sent
- **THEN** the API responds unauthorized and no order is created

### Requirement: Create Checkout Pro preference for pending order

The system SHALL create a Mercado Pago Checkout Pro preference for a pending order using Afterdark's merchant access token. The preference MUST contain the order line item, `external_reference` for the local order, notification URL, and approved, pending, and failure return URLs. The API MUST return only the Checkout Pro redirect URL needed by the web client and persist the Mercado Pago preference id in `orders.externalOrderId` for reconciliation. The system MUST NOT accept or process raw card PAN or payment tokens.

#### Scenario: Preference starts hosted checkout

- **GIVEN** a pending order owned by the current user
- **WHEN** the user starts checkout
- **THEN** the API creates a Checkout Pro preference, stores its id in `externalOrderId`, and returns its redirect URL without processing payment data in Afterdark

#### Scenario: Cannot start another user's order

- **GIVEN** a pending order belonging to user A
- **WHEN** user B attempts to start checkout for that order
- **THEN** the API rejects the request and the order status is unchanged

### Requirement: Webhook reconciles order status

The system SHALL expose a Mercado Pago webhook endpoint that verifies authenticity per Mercado Pago guidance, retrieves the notified payment from Mercado Pago using platform credentials, resolves its `external_reference` to the local order, and updates status to `completed`, `rejected`, or `cancelled` as applicable. On first transition to `completed`, the system MUST create missing `tickets_sold` rows (idempotent if already issued).

#### Scenario: Webhook completes pending order

- **GIVEN** a pending order with a Checkout Pro preference id
- **WHEN** a verified webhook reports a payment whose `external_reference` identifies that order as approved
- **THEN** the local order becomes `completed`, `paidAt` is set if unset, and `tickets_sold` exist for the order quantity

#### Scenario: Duplicate webhook is idempotent

- **GIVEN** an order already `completed` with `tickets_sold` issued
- **WHEN** the same approved webhook is delivered again
- **THEN** the system does not create duplicate `tickets_sold` rows and leaves status `completed`

#### Scenario: Unverified webhook is rejected

- **GIVEN** a webhook request that fails signature / authenticity checks
- **WHEN** the endpoint processes it
- **THEN** the API rejects the request and no order is mutated

### Requirement: Platform merchant credentials

The system SHALL read the Mercado Pago access token and webhook secret from validated platform environment configuration. It MUST NOT obtain, store, or refresh payment credentials for an event owner.

#### Scenario: Payment uses platform credentials

- **GIVEN** Afterdark's Mercado Pago account is configured
- **WHEN** the API creates a Checkout Pro preference or retrieves a payment for reconciliation
- **THEN** it uses the platform merchant access token and does not query owner payment credentials

