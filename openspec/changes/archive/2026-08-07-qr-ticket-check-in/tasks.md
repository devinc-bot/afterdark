## 1. Shared contracts and routes

- [x] 1.1 Add the check-in response/outcome contracts in `@repo/types`, the `{ token }` Zod schema in `@repo/validators`, and the `/check-ins` API route builder in `@repo/common`.

## 2. Database repositories

- [x] 2.1 Add sold-ticket graph lookup with exact persisted-token/claim matching and owner/staff location-authorization repositories; export them from `@repo/db`.
- [x] 2.2 Add the single-statement conditional ticket-consumption repository and verify that concurrent attempts produce exactly one successful update. No schema or migration changes.

## 3. API check-in flow

- [x] 3.1 Add `CheckInTicketUseCase` with signature verification, claim validation, completed-payment check, location authorization, used-before-expired precedence, conditional consumption, and success mapping.
- [x] 3.2 Add the guarded `POST /tickets/check-ins` controller endpoint, module wiring, shared error codes, and focused API verification for `200`, `409`, `410`, and protected `422` behavior.

## 4. Dashboard route and data flow

- [x] 4.1 Add `/qr-ticket`, owner/staff route permissions, the **QR Ticket** sidebar item, API service, mutation, and scanner-state constants.

## 5. Dashboard scanner UI

- [x] 5.1 Build the mobile-first QR scanner with rear-camera preference, QR-only decoding, camera permission/loading/error states, immediate pause, and single in-flight submission.
- [x] 5.2 Build success/invalid/expired/used result states with approved event and purchaser fields, **No informado**, **Escanear siguiente ticket**, accessibility behavior, and responsive dark/light styling.

## 6. Internationalization and quality

- [x] 6.1 Add complete Spanish/English navigation, scanner, result, field-label, fallback, camera, and API error translations with the exact approved Spanish copy.
- [ ] 6.2 Run repository/API verification, targeted type-checks, Oxlint, Oxfmt, i18n checks, dashboard/API builds, and manual mobile-camera QA.
