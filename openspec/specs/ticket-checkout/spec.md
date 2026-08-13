# ticket-checkout Specification

## Purpose
TBD - created by archiving change ticket-payments-mercado-pago. Update Purpose after archive.
## Requirements
### Requirement: Ticket selection on public event detail

On `/events/$documentId`, when the public detail payload includes one or more purchasable tickets, `apps/web` SHALL replace the “Entradas próximamente” placeholder with a purchase panel listing those tickets (name, price, availability signals). UI copy MUST be Spanish via `@repo/i18n`.

#### Scenario: Tickets listed for purchase

- **GIVEN** the public detail includes purchasable tickets and payments are ready
- **WHEN** a visitor views the event detail page
- **THEN** the purchase panel lists those tickets with price and a control to start purchase

#### Scenario: Payments not ready

- **GIVEN** tickets exist but Afterdark payments are not configured (`paymentsReady` false)
- **WHEN** a visitor views the event detail page
- **THEN** purchase CTAs are disabled or blocked with Spanish copy explaining that sales are unavailable

#### Scenario: No tickets

- **GIVEN** the public detail has an empty tickets list
- **WHEN** a visitor views the event detail page
- **THEN** the UI shows a Spanish empty/soon state instead of an active purchase flow

### Requirement: Authenticated Checkout Pro flow

`apps/web` SHALL start checkout directly from the purchase control for a selected ticket on event detail with quantity `1`; it MUST NOT expose an intermediate `/checkout/$ticketId` route. The purchase control requires a logged-in `USER`. Guests MUST be directed to login/register and return to the selected event to continue. Starting checkout MUST create a pending order and Checkout Pro preference via the API, then redirect the browser to the returned Mercado Pago hosted checkout URL. The web application MUST NOT load a payment Brick or collect payment tokens. The fixed quantity MUST follow `@repo/validators`.

#### Scenario: Guest prompted to authenticate

- **GIVEN** a guest on event detail with purchasable tickets
- **WHEN** they activate buy
- **THEN** they are sent to login/register and can resume checkout from the selected event after authenticating as `USER`

#### Scenario: Buyer is redirected to Checkout Pro

- **GIVEN** a logged-in user activates the purchase control for a valid ticket on event detail
- **WHEN** the client creates an order with quantity `1` and the API returns a Checkout Pro redirect URL
- **THEN** the browser navigates to Mercado Pago's hosted checkout without handling payment data in Afterdark

#### Scenario: Intermediate checkout route is unavailable

- **GIVEN** any visitor
- **WHEN** they attempt to navigate to `/checkout/$ticketId`
- **THEN** the application does not expose an intermediate ticket checkout page

#### Scenario: Return from Mercado Pago shows current order status

- **GIVEN** a logged-in user returns from Mercado Pago to an approved, pending, or failed return URL
- **WHEN** the corresponding Afterdark screen loads
- **THEN** it fetches the buyer-owned local order and displays its current status in Spanish without trusting query-string payment status alone

### Requirement: Checkout success and error routes

`apps/web` SHALL expose dedicated success, pending, and error experiences reachable from Checkout Pro return URLs. Each screen MUST fetch the buyer-owned local order to determine the displayed status. Success MUST NOT display secrets or full provider payloads. Copy MUST be Spanish via `@repo/i18n`.

#### Scenario: Success confirms purchase

- **GIVEN** the user lands on the success experience for their completed order
- **WHEN** the page renders
- **THEN** they see confirmation in Spanish that the purchase succeeded

#### Scenario: Error allows retry context

- **GIVEN** the user lands on the error experience after a failed payment
- **WHEN** the page renders
- **THEN** they see a Spanish error message and a path back toward the event or retry when applicable

#### Scenario: Pending return waits for reconciliation

- **GIVEN** the buyer returns from Checkout Pro while the local order remains `pending`
- **WHEN** the pending experience renders
- **THEN** it explains in Spanish that payment confirmation is being processed and does not claim tickets were issued

