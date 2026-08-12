## Why

Attendees currently cannot review their purchase attempts or remove abandoned pending orders from the web application. Adding a trustworthy order history supports the product goal of helping customers understand and manage their purchases while making the existing pending-order retention policy visible.

## What Changes

- Add an authenticated, paginated API endpoint that returns only the current user's orders with the ticket and event context required by the UI.
- Add an authenticated deletion endpoint restricted to buyer-owned orders whose current status is `pending`.
- Expire the associated Mercado Pago Checkout Pro preference before deleting a pending local order; if expiration fails, retain the local order and report the failure.
- Add a responsive `/orders` page in `apps/web` with loading, error, empty, pagination, and deletion states.
- Show a localized notice above the order list explaining that pending orders older than one month are automatically deleted.
- Add localized status labels, deletion confirmation and feedback, navigation, and page copy in English and Spanish.

## Non-goals

- Retrying or resuming payment from the orders page.
- Filtering, sorting controls, bulk deletion, exports, or administrative order management.
- Deleting completed, rejected, or cancelled orders.
- Changing the existing monthly stale-pending-order cleanup schedule or retention cutoff.
- Adding a database migration or new dependency.

## Capabilities

### New Capabilities

- `web-user-orders`: Authenticated order listing, pending-order deletion, and the responsive buyer-facing orders page.

### Modified Capabilities

- `mercado-pago-orders`: Expire an active Checkout Pro preference before a buyer-requested pending-order deletion.

## Impact

- `apps/api`: add order list/delete use cases and controller routes; extend the Mercado Pago adapter port.
- `apps/web`: add the authenticated orders route, module, navigation entry, queries, mutation, confirmation flow, and responsive UI.
- `packages/db`: add buyer-scoped paginated order lookup and atomic pending-order deletion repositories; no schema migration.
- `packages/types`: add the buyer order-summary response contract.
- `packages/validators`: reuse shared pagination and UUID validation at API boundaries.
- `packages/common`: add shared order API route constants.
- `packages/i18n`: add English and Spanish orders copy and API error messages.
- `packages/ui`: reuse existing primitives; no new shared component is expected.
- `apps/dashboard`: unaffected.
