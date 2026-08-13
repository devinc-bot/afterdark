## Context

The orders module currently creates pending orders, fetches one buyer-owned order, reconciles Mercado Pago webhooks, and deletes stale pending rows on a monthly schedule. It has no collection endpoint or user-triggered deletion. `apps/web` already provides authenticated `/tickets` and `/settings` routes, TanStack Query service patterns, bilingual copy, shared pagination, dialogs, toasts, and responsive page primitives.

A pending order may already reference a live Mercado Pago Checkout Pro preference. Deleting only the local row could allow a checkout already opened by the buyer to complete without a local order to reconcile. The user selected provider expiration followed by local deletion as the intended behavior.

## Goals / Non-Goals

**Goals:**

- Return a paginated, buyer-scoped order history with enough ticket and event context to render without per-row requests.
- Permit hard deletion only for the authenticated buyer's currently pending orders.
- Expire an active Checkout Pro preference before local deletion and retain the order when expiration fails.
- Deliver a responsive, accessible, bilingual orders page that clearly communicates the existing retention policy.
- Preserve current architecture boundaries and require no database migration.

**Non-Goals:**

- Payment retry or checkout resumption.
- User-selectable filters, sorting, bulk actions, exports, or dashboard order management.
- Changes to automatic cleanup timing or retention semantics.
- Deletion of non-pending orders.
- General cleanup of the existing single-order `ticketId` contract.

## Decisions

### Use a dedicated paginated order-summary contract

Add a buyer order-summary DTO and return `PaginatedResponse<BuyerOrderSummaryResponse>` from `GET /orders?page={page}&limit={limit}`. Each item will include order identity, status, amount, quantity, provider, order/payment timestamps, ticket public identity/name/type, and nullable event public identity/name/start time.

The repository will resolve the authenticated user's internal id, query only that buyer's rows, join tickets and left-join events, sort by `orders.createdAt DESC` with `orders.id DESC` as a deterministic tie-breaker, and compute the total in a separate count query. Pagination input uses the shared `paginationSchema` from `@repo/validators`.

This avoids N+1 client requests and avoids expanding the existing checkout response with list-only display fields. Returning internal integer foreign keys or accepting a user id from the browser is rejected because public contracts use document ids and ownership comes from the JWT subject.

### Expire the provider preference before deleting locally

Extend `MercadoPagoCheckoutProPort` with an operation that expires a Checkout Pro preference. With the installed SDK, the adapter will retrieve the preference to preserve its required items and update it with an enabled expiration window ending at the request time. A successful provider response is required before local deletion when `externalOrderId` is present. A pending order without `externalOrderId` has no successfully-created hosted checkout and can proceed directly to local deletion.

If provider expiration fails, the API returns a translated failure and keeps the local order. This is preferred over best-effort deletion because it prevents knowingly discarding reconciliation state while an active checkout remains available.

### Enforce ownership and status in the delete statement

`DELETE /orders/:documentId` will require an authenticated `USER` and validate the path with the shared UUID schema. The use case first loads the buyer-owned order to distinguish not-found from non-pending conflicts, expires its provider preference when needed, and then calls a repository delete whose SQL predicate includes document id, internal user id, and `status = pending` with `RETURNING`.

This final predicate protects against a webhook changing the status during the external call. A foreign or missing order returns not found without revealing ownership; an owned non-pending order returns conflict. If the final delete returns no row, the use case re-reads the order to report a concurrent status change rather than claiming success.

### Present orders as a structured responsive list

Add authenticated `/orders` navigation beside Events and Tickets. The page uses the established web shell, page header, atmosphere wash, shared formatters, badges, skeletons, inline load-error banner, pagination, dialog, and toast primitives. Orders render as a vertically stacked list rather than a dense table or identical card grid: event/ticket context leads, status and amount remain scannable, and the destructive action appears only on pending items.

The retention notice appears between the page header and list in a low-emphasis informational surface and states in each locale that pending orders older than one month are deleted automatically. Empty state copy links users to event discovery. The delete confirmation names the order context, remains persistent while submitting, and only closes after success.

### Keep list cache coherent after deletion

The delete mutation invalidates the orders query family after success. The page clamps or redirects pagination when deletion removes the final item on the active page. Initial failures remain inline with retry; mutation outcomes use localized toasts. No polling is introduced in this scope; normal query focus/refetch behavior and explicit invalidation provide freshness without continuous traffic.

### Add a dedicated i18n namespace

Add `orders` English and Spanish locale resources and register them in client/server loaders and resource typing. Add navigation copy to `landing` and translated API error codes for non-pending deletion and provider-expiration/deletion failures. All user-facing labels, status names, notice text, dialog copy, accessibility text, empty/loading/error states, and feedback come from i18n.

## Risks / Trade-offs

- [A payment is already being processed when the preference is expired] -> The atomic pending-only delete prevents deleting an order already reconciled as completed, but a provider payment whose webhook has not arrived can still race. Preserve provider-expiration errors, log unexpected reconciliation misses, and cover the status race in tests.
- [Mercado Pago rejects an expiration update] -> Keep the local order and show a retryable localized error instead of partially completing deletion.
- [The current page becomes empty after deletion] -> Reconcile the active page against the refreshed `totalPages` and move to the preceding valid page when necessary.
- [Historical ticket/event data is incomplete] -> Inner-join the required ticket relation, left-join the nullable event relation, and render localized fallbacks for missing event context.
- [Large user histories make the listing query expensive] -> Use bounded pagination and deterministic indexed document-id ownership resolution; defer a composite order index until measured volume requires a migration.

## Migration Plan

1. Ship shared contracts/routes and repository operations.
2. Ship API list/delete endpoints and Mercado Pago preference expiration with tests.
3. Ship i18n resources and the authenticated web route/UI.
4. Verify dark/light themes, EN/ES parity, responsive layouts, and deletion race/error states.

No schema or data migration is required. Rollback removes the web route and API endpoints; existing orders and automatic cleanup remain unchanged.

## Open Questions

None.
