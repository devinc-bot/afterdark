## 1. Shared Contracts

- [x] 1.1 Add the paginated buyer order-summary DTO and shared list/delete API route constants, then run focused type-check, oxlint, and oxfmt checks.

## 2. Database Repositories

- [x] 2.1 Add and test the buyer-scoped paginated order-summary repository with public ticket/event context and deterministic newest-first ordering.
- [x] 2.2 Add and test the atomic buyer-owned pending-order deletion repository, including non-pending, foreign, and missing order cases.

## 3. Mercado Pago Integration

- [x] 3.1 Extend the Checkout Pro port and SDK adapter to expire an existing preference while preserving required preference data, and cover success/failure mapping with adapter tests.

## 4. Orders API

- [x] 4.1 Add the authenticated paginated order-history use case and controller endpoint with shared pagination validation, mapping, and tests.
- [x] 4.2 Add the authenticated pending-order deletion use case and controller endpoint with provider-first expiration, atomic status enforcement, translated errors, and race/error tests.

## 5. Web Data Layer

- [ ] 5.1 Add typed order list/delete services plus TanStack Query query and mutation hooks with pagination keys and cache invalidation.

## 6. Web Orders UI

- [ ] 6.1 Add the authenticated `/orders` route, web route constant, and desktop/mobile navigation entry without editing the generated route tree.
- [ ] 6.2 Build the responsive orders page and order summaries with the retention notice, localized statuses, shared formatters, skeleton/error/empty states, pagination, and dark/light support.
- [ ] 6.3 Add the pending-only deletion confirmation and feedback flow, prevent duplicate submission, keep failures recoverable, and reconcile pagination after success.

## 7. Internationalization

- [ ] 7.1 Add and register matching English and Spanish `orders` resources, navigation labels, and API error translations; run the i18n parity check.

## 8. Verification

- [ ] 8.1 Run affected package tests, repository-wide type-check, oxlint, oxfmt check, OpenSpec validation, and responsive accessibility checks for the orders page.
