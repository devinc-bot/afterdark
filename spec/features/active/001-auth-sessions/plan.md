# Plan 001 - Authentication Sessions

## Approach

Extend the existing authentication slice with account-scoped persisted sessions and opaque rotating refresh credentials. Keep access-token verification stateless, place all database operations in `@repo/db` repositories, isolate IP geolocation behind an API port and adapter, and centralize browser refresh/retry behavior in the shared QueryFactory without allowing recursive refresh.

## Data Model

Add an `account_sessions` table using the standard internal `id`, public `documentId`, and timestamps, plus:

- `accountId`: required foreign key to `accounts.id`.
- `clientApp`: required enum identifying `web`, `dashboard`, or `admin`.
- `refreshTokenHash`: required unique deterministic hash of the current opaque credential.
- `refreshTokenVersion`: required non-negative integer incremented on each rotation.
- `expiresAt`: required sliding-expiration boundary.
- `revokedAt`: nullable revocation timestamp.
- `ipAddress`: nullable IPv4 or IPv6 request address because no trustworthy public address is guaranteed.
- `device`: nullable human-readable browser and operating-system label parsed through a maintained user-agent parser.
- `userAgent`: nullable bounded raw user-agent for diagnostics.
- `city`, `state`, `country`: nullable provider-derived geographic values.

Index account lookup and terminal-time cleanup. Derive `locationLabel` when mapping session metadata instead of storing a duplicate concatenated string. A daily scheduler deletes rows 30 days after the earliest of expiration or revocation.

## Contracts

- Extend `JwtPayload` with a public session identifier claim.
- Add a session client-app enum for `web`, `dashboard`, and `admin` and bind each session to one value.
- Keep access tokens in existing client-readable storage until a broader BFF migration is specified; reduce their lifetime from one day to 15 minutes.
- Add refresh and logout API contracts using `API_ROUTES`.
- Send refresh credentials only through app-specific `HttpOnly` cookies.
- Represent each opaque credential as `<sessionDocumentId>.<rotationVersion>.<256-bit-random-secret>.<mac>`. Compute `mac` with HMAC-SHA-256 and a dedicated `REFRESH_TOKEN_SECRET` over the preceding segments; persist only the hash of the random secret and the current version.
- Add repository contract types only where needed by `@repo/db` consumers.

## API Flow

1. Resolve the authenticating account and role as today.
2. Read trusted request IP and user-agent metadata at the controller boundary.
3. Resolve approximate geography through a timeout-bounded port; continue with null geography on failure.
4. Generate an opaque refresh credential and persist its secret hash. In an account-serialized transaction, revoke the oldest active session ordered by `createdAt` then `id` until fewer than ten remain, then create the new session.
5. Sign a short-lived access JWT containing the account profile `documentId`, role, email, and session `documentId`.
6. Set the refresh cookie and return the access token.
7. On refresh, verify the credential MAC in constant time before loading its session. Then compare the presented version and secret and conditionally update the current version, replacement secret hash, and `expiresAt = now + 30 days` in one atomic operation.
8. If a MAC-authenticated credential's version is older than the persisted version, revoke only that session as replay. If its version is current but the secret hash differs, reject without revocation. An invalid MAC never triggers session lookup or revocation.
9. On logout, revoke the current session idempotently and clear the cookie.
10. On password reset, consume the reset credential, update the password, and revoke all account sessions in one database transaction.

## Client Flow

- Provide each QueryFactory instance with explicit refresh behavior and fresh access-token resolution.
- Call authentication endpoints directly from the browser so the API origin sets and receives its `HttpOnly` cookie without a server-function forwarding boundary.
- Deduplicate parallel refresh attempts with a single in-flight promise.
- Retry an eligible failed request once after successful refresh.
- Exclude login, refresh, and logout from automatic refresh.
- Restore a session from the `HttpOnly` refresh cookie even when no readable access token remains.
- Call server logout before clearing local state; clear local state even if idempotent logout cannot reach the API.
- After Google OAuth, redirect without an access token in the URL and bootstrap the app by refreshing with the newly set app-specific cookie.

## Security

- Generate refresh credentials with Node cryptographic randomness and store only a deterministic cryptographic hash.
- Rotate using a conditional database update so only one concurrent request can consume a credential.
- Validate the `Origin` of refresh and logout against an exact app-to-origin map from `WEB_URL`, `DASHBOARD_URL`, and a new `ADMIN_URL`; reject a claimed app/origin mismatch before selecting its cookie.
- Configure Express trusted-proxy behavior explicitly for the deployed single reverse-proxy hop and use the resulting `request.ip`; authentication code does not parse `X-Forwarded-For` itself.
- Use host-only cookies (no `Domain`) named `repo.web.auth.refresh`, `repo.dashboard.auth.refresh`, and `repo.admin.auth.refresh`. Set `Path=/api/auth`, `HttpOnly`, `SameSite=Lax`, `Max-Age=30 days`, and `Secure` except for local development. Clear with matching options.
- Require the API and all configured frontend origins to remain under one schemeful site in supported deployments so `SameSite=Lax` cookies work on direct credentialed requests. Document this deployment invariant and cover the production URL examples with a configuration test.
- Avoid token values in URLs, logs, exceptions, and error recording.

## Geographic Provider

Extract a small port returning nullable `city`, `state`, and `country` from the existing `IpQueryLocatorAdapter` in `apps/api/src/modules/geo/adapters/ipquery.locator.ts`. Add a 1.5-second abort timeout to that adapter and reuse it from authentication through a failure-tolerant session metadata service. Authentication does not fail if IpQuery fails, while the existing geo endpoint retains its translated provider-error contract.

## Verification

- Repository tests for creation, atomic rotation, replay, revocation, expiration, and session-limit enforcement.
- Repository concurrency tests prove account-serialized creation preserves the ten-session maximum and password reset is atomic with revocation.
- API use-case tests for every issuance path, refresh, logout, metadata fallbacks, and cookie options.
- Shared QueryFactory tests for one refresh, one retry, concurrency deduplication, and loop prevention.
- Client tests for startup restoration and logout in all three apps.
- Run affected tests, `pnpm type-check`, `pnpm lint`, `pnpm format:check`, and `git diff --check`.

## Confirmed Decisions

- App-specific sessions and refresh cookies isolate web, dashboard, and admin.
- Browser clients call authentication endpoints directly.
- Access tokens expire after 15 minutes.
- The existing IpQuery adapter supplies session geography behind a port.
- Refresh-token replay revokes only the affected session.
- Password reset revokes every session for the affected account.
- Session metadata includes a readable device label and bounded raw user-agent.
- Expired or revoked sessions and their metadata are retained for 30 days.
- Refresh cookies use the exact host-only app-specific contract documented above and are selected only after exact origin/app validation.
- Refresh credentials authenticate their session id, version, and random secret with a dedicated `REFRESH_TOKEN_SECRET` before replay logic runs.
