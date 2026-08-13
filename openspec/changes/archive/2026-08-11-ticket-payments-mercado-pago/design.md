## Context

Afterdark already models `orders` (buyer `userId`, ticket, amount, quantity, `provider=mercado_pago`, status, `externalOrderId`, JSON `metadata`, `paidAt`) and `tickets_sold` (QR per unit). The API `orders` module is a stub; web purchase UI is disabled (`TICKETS_AVAILABLE = false`). Public event detail does not return tickets. This change initially introduced an owner Mercado Pago OAuth model, but payments must settle only into Afterdark's Mercado Pago account.

Locked product choices: Checkout Pro; Afterdark's single merchant account receives all funds; full web checkout (create -> redirect -> return/webhook -> success/error); buyers must be authenticated `USER` in Afterdark.

## Goals / Non-Goals

**Goals:**

- Process every order with Afterdark's configured Mercado Pago merchant access token.
- Expose purchasable tickets + `paymentsReady` on public event detail based on platform payment configuration.
- End-to-end ticket purchase on `web` with Checkout Pro, return handling, webhook reconciliation, and `tickets_sold` issuance.
- Remove owner OAuth credentials and every owner payment-connect surface introduced for the previous model.
- Keep API modules and repositories aligned with ARCHITECTURE.md.

**Non-Goals:**

- Owner Mercado Pago OAuth, seller credentials, token refresh, or dashboard connect/disconnect UI.
- Guest checkout in Afterdark, embedded card entry or payment tokenization, platform fee / split, owner payout or settlement workflows, buyer ticket wallet, refunds UI, staff check-in.

## Decisions

### 1. Single platform merchant account

- **Choice:** The API reads `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, and shared `API_PUBLIC_URL` from validated environment configuration. The access token is API-only; `API_PUBLIC_URL` identifies the public API origin used for Mercado Pago notifications (same origin as Google OAuth callbacks).
- **Why:** All money must settle to Afterdark, with no seller onboarding or credential resolution per event owner.
- **Alternatives:** Per-owner OAuth (rejected: funds settle to owners); manual owner access tokens (rejected: still creates a per-owner seller model).

### 2. Remove owner credential persistence

- **Choice:** Remove `owner_mercado_pago_credentials`, its repositories, exports, DTOs, OAuth validator, OAuth API routes, and dashboard settings work. Because the migration is uncommitted, remove it rather than producing a compensating migration.
- **Why:** Platform configuration belongs in deployment environment, not in tenant-owned database records.
- **Alternatives:** Retain dormant owner credentials (rejected: unnecessary secrets and confusing future behavior).

### 3. Checkout Pro preference and redirect

- **Choice:** The backend creates one Checkout Pro preference per pending local order, using the platform merchant access token. The preference includes its line item, `external_reference` with the local order identity, notification URL, and approved/pending/failure return URLs. The event-detail purchase control creates the order with quantity `1` and redirects the buyer to the returned Checkout Pro URL; it replaces the intermediate `/checkout/$ticketId` route and page.
- **Why:** Mercado Pago owns the payment experience, supports its available online and offline payment methods, and keeps payment data out of Afterdark.
- **Alternatives:** Checkout API Orders + Card Brick (rejected: requires maintaining an embedded payment integration).

### 4. Order lifecycle and availability

```text
USER selects ticket on event detail -> POST create order (quantity 1) + Checkout Pro preference (pending)
  -> redirect to Mercado Pago Checkout Pro
  -> Mercado Pago return and/or webhook -> completed | rejected | cancelled
  -> on completed: insert tickets_sold (qty), set paidAt
```

- Stock: compute remaining as `ticket.quantity - count(completed orders' quantities)`; reject create when insufficient. Prefer transactional checks in create/pay use cases.
- `externalOrderId`: Mercado Pago preference id for reconciliation (indexed UNIQUE). Webhooks retrieve the Mercado Pago payment and resolve its `external_reference` to the local order.
- `paymentsReady`: derive solely from the required platform payment configuration being available; it must not query owner records.

### 5. API module layout

- `modules/mercado-pago/` contains the platform Checkout Pro adapter and unauthenticated signature-verified webhook controller.
- Expand `modules/orders/` vertical slice: create preference, get-by-documentId (buyer), and return-status support.
- Public events detail use case joins tickets and derives the global configuration flag.
- All DB access remains in `packages/db` repositories; API services do not use raw `db` queries.

### 6. Environment configuration

Extend `@repo/validators` env + `apps/api` `ENV` with:

- `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, shared `API_PUBLIC_URL`, and optional `MERCADOPAGO_TEST_MODE`.
- Remove `MERCADOPAGO_CLIENT_ID`, `MERCADOPAGO_CLIENT_SECRET`, and `MERCADOPAGO_REDIRECT_URI` because OAuth is not used.

## Risks / Trade-offs

- **[Risk] Platform access token is misconfigured or unavailable** -> Mitigation: fail closed for create/pay, return Spanish payment-unavailable errors, and expose `paymentsReady=false`.
- **[Risk] Webhook vs sync race** -> Mitigation: idempotent completion and QR issuance; status transitions only move forward where possible.
- **[Risk] Oversell under concurrency** -> Mitigation: check stock in a transaction; optional reservation holds remain out of scope.
- **[Risk] Checkout Pro return can arrive before a webhook is processed** -> Mitigation: success and error screens query the buyer-owned local order and display pending processing until reconciliation completes.
- **[Trade-off] All money settles to Afterdark** -> Organizer payout/accounting needs a separate product and operational workflow.

## Migration Plan

1. Remove the uncommitted owner OAuth schema, migration, repositories, types, validators, routes, and dashboard scope.
2. Replace OAuth configuration with the platform access token environment contract.
3. Extend public event detail DTO + purchase panel using global payment readiness.
4. Implement Checkout Pro preference creation, payment webhook reconciliation, and `tickets_sold` with platform credentials.
5. Implement web redirect and return-status success/error experiences.
6. Rollback: keep CTAs disabled if platform configuration is incomplete; do not drop order history.

## Open Questions

- Exact Checkout Pro preference and payment-webhook payload fields for AR must be confirmed against current Mercado Pago documentation during implementation.
