## Why

Pending Checkout Pro orders that never receive a payment remain in the database indefinitely. Removing stale records keeps the payment data set focused on actionable orders without affecting completed ticket purchases.

## What Changes

- Add a monthly background cleanup for pending orders created before the equivalent calendar date in the previous month.
- Permanently delete only orders that still have `pending` status when the cleanup runs.
- Record successful cleanup activity and errors through the API scheduler logger.

## Capabilities

### New Capabilities
- `stale-pending-order-cleanup`: Monthly retention of pending ticket-payment orders that are older than one calendar month.

### Modified Capabilities

- None.

## Non-goals

- Canceling orders with Mercado Pago before deletion.
- Deleting rejected, cancelled, or completed orders.
- Changing ticket stock allocation, payment reconciliation, or buyer-facing checkout behavior.
- Adding a manual cleanup endpoint or dashboard control.

## Impact

- Affected apps: `api`.
- Affected packages: `db`.
- Unaffected apps/packages: `web`, `dashboard`, `ui`, `validators`, and `i18n`.
- No schema migration or public API contract change is required.
