## Context

Each sold ticket already stores its current QR JWT in `tickets_sold.qr_code`, together with `checked_in` and `used_at`. The attendee QR issuer signs `userId`, `ticketSoldId`, and `eventId` with a 20-minute lifetime and replaces the persisted token whenever it issues a new QR. The dashboard already depends on `@yudiel/react-qr-scanner` but has no scanner route or API integration.

This change adds an online scanner for owners and staff without introducing history, audit records, schema changes, or migrations.

## Goals and non-goals

### Goals

- Validate only authentic, current, unexpired ticket QR JWTs.
- Restrict owners to owned event locations and staff to assigned event locations.
- Mark a valid sold ticket used exactly once under concurrent scans.
- Show event and purchaser information only after authorization and successful usage.
- Provide clear invalid, expired, used, success, and camera-error states.

### Non-goals

- Scan history, audit tables, or operator attribution.
- Offline scanning or manual token entry.
- Public-web QR changes, checkout, payments, refunds, transfers, or inventory changes.
- Native applications or dedicated scanning hardware.

## Shared contracts

Add to `@repo/types`:

- A check-in response containing `checkedInAt`, ticket document ID/name/type, event document ID/name/start time, location document ID/name, and purchaser document ID/full name/email/nullable phone.
- Outcome constants for `success`, `invalid`, `expired`, and `used` when useful to keep UI/API state free of magic strings.

Add `ticketCheckInSchema` to `@repo/validators` for `{ token: string }`. The controller validates the body through `ZodValidationPipe`. Add `API_ROUTES.tickets.path.checkIns()` in `@repo/common` for `/check-ins`.

The success response never returns the QR token.

## Repository design

Add repository functions under `packages/db/src/repositories/ticket-check-ins/`, exported through the DB barrels:

1. Resolve the sold-ticket graph from the signed claim IDs and exact persisted token. Join `tickets_sold -> orders -> tickets -> events -> locations -> users -> user_accounts_lnk -> accounts`, returning usage state, order status, event/location, ticket type, and purchaser data.
2. Resolve operator access for a location:
   - Owner: `owners -> owner_account_lnk -> accounts -> locations`, requiring matching owner document ID and location.
   - Staff: `staff -> staff_account_lnk -> accounts -> staff_location_lnk`, requiring matching staff document ID and assigned location.
3. Atomically consume with one conditional update:
   - `UPDATE tickets_sold SET checked_in = true, used_at = serverNow, updated_at = serverNow WHERE id = ? AND checked_in = false RETURNING ...`.
   - A returned row means success.
   - No returned row means another request already consumed it, so the API returns the used outcome.

Because consumption is one conditional SQL statement, no multi-write transaction, table, or migration is needed.

## JWT verification and outcome precedence

The API use case performs checks in this order:

1. Verify the JWT signature while temporarily ignoring expiration. Signature failure or malformed required claims returns the generic invalid outcome.
2. Resolve the ticket by `ticketSoldId`, `eventId`, `userId`, and exact equality with the currently persisted `qr_code`. Exact equality makes replaced QRs invalid immediately.
3. Require a completed-payment order.
4. Resolve the authenticated operator and require access to the event location. Failure uses the same generic invalid result and exposes no ticket data.
5. If the matching ticket is already checked in, return the used outcome even when the JWT is also expired.
6. Enforce JWT expiration. An expired unused QR returns the expired outcome.
7. Execute the conditional update. If it loses a race, return used; otherwise map and return success details.

QR tokens must never be logged.

## API design

Extend the existing tickets vertical slice:

- `application/check-in-ticket.use-case.ts`
- a pure mapper for the success DTO
- `POST /api/tickets/check-ins` in `tickets.controller.ts`
- provider registration in `tickets.module.ts`

The endpoint uses `JwtAuthGuard`, `RolesGuard`, and `@Roles([USER_ROLE.OWNER, USER_ROLE.STAFF])`. It receives `JwtPayload.sub` and `JwtPayload.role` for repository authorization.

HTTP mapping:

- `200 OK`: **Ticket escaneado correctamente** plus the success DTO.
- `400 Bad Request`: malformed body rejected by Zod.
- `401 Unauthorized`: missing or invalid operator session.
- `403 Forbidden`: authenticated role is not owner/staff.
- `409 Conflict`: matching ticket already used or conditional update lost a race.
- `410 Gone`: matching unused QR expired.
- `422 Unprocessable Entity`: invalid/foreign/replaced QR, incomplete payment, or unauthorized location. These cases share one public message.

Extend ticket error codes and localized error messages without exposing which protected `422` validation failed.

## Dashboard design

Add `DASHBOARD_ROUTES.qrTicket()`, a literal TanStack route at `routes/_app/qr-ticket.tsx`, and **QR Ticket** with a `QrCode` icon in the role-aware sidebar. Add the path to both staff and owner allowlists.

Create `apps/dashboard/app/modules/ticket-check-ins/` with:

- API service using `QueryFactory`, `API_ROUTES`, and `buildApiPath`.
- A TanStack mutation for check-in.
- Scanner and result components.
- Small state helpers/constants for scanner states and duplicate-frame protection.

The page is mobile-first and supports dark/light themes. Scanner behavior:

1. Request camera access while the scanner view is active.
2. Prefer the rear camera with `facingMode: environment` and restrict decoding to `qr_code`.
3. On the first decoded value, pause detection immediately and allow only one mutation in flight.
4. Render one result state:
   - success: **Ticket escaneado correctamente** and all approved event/purchaser fields;
   - invalid;
   - expired;
   - already used;
   - camera unavailable/permission denied with **Reintentar**.
5. **Escanear siguiente ticket** clears the result and reactivates scanning.

If purchaser phone is absent, render **No informado**. The UI must never infer authorization from client state; the API response is authoritative.

## Internationalization and accessibility

Add Spanish and English keys under the tickets/dashboard namespaces for the nav item, page title/instructions, camera states, approved outcome messages, field labels, **Escanear siguiente ticket**, **Reintentar**, and **No informado**.

Use semantic `status`/`alert` regions and `aria-live` so one result is announced without repeatedly announcing camera frames. Camera controls need visible focus, result colors need sufficient contrast in both themes, and motion must respect `prefers-reduced-motion`.

## Verification

- Repository verification for exact-token matching, owner/staff location scope, completed payment, conditional update, and two-request race behavior.
- API verification for role guards, JWT verification order, used-over-expired precedence, status codes, and no protected data in `422` responses.
- Dashboard verification for camera permission/error, one mutation per decoded QR, paused result states, next-scan reset, responsive layout, and missing-phone fallback.
- Run targeted type-checks, Oxlint, Oxfmt, i18n checks, and dashboard/API builds.
- Perform manual mobile-browser QA over HTTPS or localhost with a real rear camera.

## Risks and mitigations

- **Repeated camera frames:** pause immediately and guard the mutation in flight.
- **Concurrent operators:** single conditional update guarantees one winner.
- **Replaced QR replay:** require exact equality with the persisted token.
- **Information disclosure:** generic `422` before returning any event or purchaser data.
- **Used plus expired ambiguity:** verify signature and matching ticket first, then prioritize used before expiration.
