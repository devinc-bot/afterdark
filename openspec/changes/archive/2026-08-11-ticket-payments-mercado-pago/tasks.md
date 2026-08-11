## 1. Platform payment configuration

- [x] 1.1 Replace owner OAuth DTOs, validators, env fields, and API route constants with the platform access token, webhook secret, and public API URL contract; remove the no-longer-needed public key.
- [x] 1.2 Remove owner payment-connection DTOs, OAuth callback validation, and dashboard settings scope.

## 2. Database cleanup

- [x] 2.1 Remove the uncommitted `owner_mercado_pago_credentials` schema, migration, repositories, exports, and related `DATABASE.md` documentation.
- [x] 2.2 Keep and verify order, stock, and idempotent `tickets_sold` repositories for the platform merchant payment flow.

## 3. Public tickets on event detail

- [x] 3.1 Extend the public event detail API/mapper to return `tickets` and global `paymentsReady` from platform configuration.
- [x] 3.2 Replace the web “Entradas próximamente” stub with a purchase panel driven by public detail and disabled when `!paymentsReady` or no tickets exist.

## 4. Orders and Mercado Pago Checkout Pro API

- [x] 4.1 Replace the Mercado Pago Orders HTTP adapter with a Checkout Pro adapter (port) that creates preferences and retrieves payments using the platform merchant access token.
- [x] 4.2 Implement the create-pending-order and Checkout Pro preference use case/controller with USER, sale-window, stock, and platform-payment guards.
- [x] 4.3 Store the Checkout Pro preference id and return its hosted checkout URL; remove Brick-token payment contracts and the pay-order endpoint.
- [x] 4.4 Implement the signature-verified payment webhook with idempotent status and `tickets_sold` reconciliation through `external_reference`.
- [x] 4.5 Add Spanish API error codes and i18n for unavailable platform payments, return processing, and payment failures.

## 5. Web checkout UX

- [x] 5.1 Add checkout routes with auth gate, quantity selection, and API call that redirects to the Checkout Pro hosted checkout URL.
- [x] 5.2 Add success, pending, and error return screens that fetch the current buyer-owned order and use Spanish copy via `@repo/i18n`.
- [x] 5.3 Wire guest purchase attempts to login/register with a return URL back to checkout.
- [x] 5.4 Start Checkout Pro directly from the event-detail purchase control with quantity `1`; remove the intermediate ticket checkout route, component, navigation constant, and obsolete checkout copy; preserve authentication and result routes.

## 6. Verification

- [x] 6.1 Add or update repository and API tests for platform credentials, disabled payments, Checkout Pro preference creation, completed payment issuance, and webhook idempotency.
- [x] 6.2 Run `pnpm type-check`, `pnpm lint`, `pnpm format:check`, and `pnpm openspec validate`.
