## Why

Clients can discover events on `web` but cannot buy tickets. Roadmap item `008-checkout-payments` depends on auth, tickets, and catalog; those foundations exist. Mercado Pago Checkout Pro unlocks paid ticket sales through Mercado Pago's hosted checkout while every charge settles into Afterdark's Mercado Pago account.

## What Changes

- **Platform Mercado Pago account:** Afterdark processes every charge with its single Mercado Pago merchant access token; no owner OAuth, seller credential storage, or dashboard payment connection UI remains.
- **Public purchasable tickets:** event detail on `web` exposes on-sale tickets (price, remaining stock, sale window) when platform payments are configured.
- **Authenticated checkout (web):** a logged-in `USER` starts Checkout Pro directly from a ticket's purchase control on event detail with quantity `1`, is redirected to Mercado Pago's hosted checkout, and returns to an Afterdark success or error screen. The intermediate `/checkout/$ticketId` route is removed.
- **Orders API:** create pending `orders` and their Mercado Pago Checkout Pro preferences with Afterdark's merchant credentials; handle return status and webhooks to move status to `completed` / `rejected` / `cancelled`, set `paidAt`, and create `tickets_sold` rows (QR) on success.
- **Config:** platform Mercado Pago access token and webhook secret in env (validators). The application never handles card PANs or payment tokens.
- **Removal:** remove the owner credentials schema, repositories, migration, OAuth endpoints, callback validator, DTOs, routes, and dashboard settings scope introduced for the prior seller model.
- **i18n:** Spanish UI copy and API error codes for checkout and payment failures.

### Decisions (locked)

| Topic              | Choice                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| Checkout product   | **Checkout Pro** (Mercado Pago-hosted redirect)                                                               |
| Who receives funds | Afterdark's single Mercado Pago merchant account; organizers do not link Mercado Pago accounts in this change |
| MVP scope          | Full purchase path: create order → pay → webhook → status + success/error UI on `web`                         |
| Buyer identity     | Must be logged-in `USER` (`orders.userId` NOT NULL; aligns with web registration specs)                       |

### Non-goals

- Guest / anonymous checkout in Afterdark. Mercado Pago may offer its own guest-payment option after an authenticated buyer is redirected.
- Split payments, marketplace fee withholding, or payout/settlement workflows for organizers in this change.
- Buyer “mis compras” / ticket wallet listing (follow-up).
- Staff QR check-in UX (schema exists; out of scope).
- Refunds, chargebacks UI, or dispute tooling.
- Enabling purchase when Afterdark's Mercado Pago configuration is incomplete (tickets may show as unavailable / CTA blocked).
- Migrating legacy `spec/features/008-*` folder (none exists); this OpenSpec change is the source of truth.

## Capabilities

### New Capabilities

- `mercado-pago-orders`: API payment orchestration — create order and Checkout Pro preference with the platform merchant account, webhook reconciliation, and `tickets_sold` issuance.
- `ticket-checkout`: Web checkout UX — ticket selection on event detail, Checkout Pro redirect, and return status screens; requires auth.

### Modified Capabilities

- `public-events-discovery`: Public event detail must include purchasable ticket offers (and payment-readiness signals) so checkout can start from the event page.

## Impact

- **Apps:** `apps/api` (orders module and webhooks), `apps/web` (checkout UI). `apps/dashboard` is not affected.
- **Packages:** `packages/db` (remove owner MP credential storage; retain order/tickets_sold repositories), `packages/validators`, `packages/types`, `packages/i18n`, `packages/common` (API routes), optionally `packages/ui`.
- **External:** Mercado Pago Developers application for Afterdark's merchant account, Checkout API Orders, webhooks.
- **Deps:** Official Mercado Pago SDK or HTTP client for Checkout Pro preferences and payment retrieval; no frontend payment SDK is required.
- **Security:** Protect the platform access token as an API-only secret, verify webhook signatures, and never log secrets or payment data.
