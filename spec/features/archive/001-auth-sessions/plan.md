# Plan 001 - Authentication Sessions

## Approach

Extend the authentication slice with account-scoped persisted sessions and opaque rotating refresh credentials. Keep access-token verification stateless, place database operations in `@repo/db` repositories, isolate IP geolocation behind a port, and centralize browser refresh/retry behavior in QueryFactory without recursive refresh.

## Data Model

Add `account_sessions` with standard base columns plus `accountId`, `clientApp`, `refreshTokenHash`, `refreshTokenVersion`, `expiresAt`, `revokedAt`, nullable `ipAddress`, `device`, `userAgent`, `city`, `state`, and `country`. Derive `locationLabel` when mapping session metadata. A daily scheduler deletes rows 30 days after the earliest of expiration or revocation.

## Contracts

- Add a client-app enum for `web`, `dashboard`, and `admin` and bind each session to one value.
- Extend `JwtPayload` with a public session identifier claim.
- Keep access tokens in current client-readable storage but reduce them to 15 minutes.
- Add refresh and logout contracts through `API_ROUTES`.
- Represent refresh credentials as `<sessionDocumentId>.<rotationVersion>.<256-bit-random-secret>.<mac>`. Compute `mac` with HMAC-SHA-256 and a dedicated `REFRESH_TOKEN_SECRET`; persist only the random secret hash and the current version.

## API Flow

1. Resolve the authenticating account and role.
2. Read `request.ip` and user-agent metadata at the controller boundary.
3. Resolve approximate geography through a 1.5-second timeout-bounded port; continue with null geography on failure.
4. Create the session inside an account-serialized transaction that revokes the oldest active session until fewer than ten remain.
5. Sign a 15-minute JWT containing profile `documentId`, role, email, and session `documentId`.
6. Set the app-specific refresh cookie and return the access token.
7. Verify the credential MAC before session lookup; atomically replace its version, secret hash, and expiry.
8. Revoke only on MAC-authenticated stale-version reuse.
9. Logout revokes the session idempotently and clears the matching cookie.
10. Password reset consumes its token, changes the password, and revokes all account sessions in one transaction.

## Security

- Validate refresh/logout origin against the exact app-to-origin map from `WEB_URL`, `DASHBOARD_URL`, and `ADMIN_URL`.
- Configure Express trusted-proxy behavior explicitly and use `request.ip`.
- Use host-only cookies named `app.web.auth.refresh`, `app.dashboard.auth.refresh`, and `app.admin.auth.refresh`, with `Path=/api/auth`, `HttpOnly`, `SameSite=Lax`, `Max-Age=30 days`, and `Secure` except locally.
- Clear cookies with matching options.
- Require all configured frontend origins and API URL to share one schemeful site.

## Verification

- Test contracts/configuration, session repository behavior, API use cases, QueryFactory refresh, and app restoration/logout.
- Run focused tests, type-check, lint, format check, and `git diff --check`.

## Confirmed Decisions

- App-specific sessions and refresh cookies isolate web, dashboard, and admin.
- Browser clients call authentication endpoints directly.
- Access tokens expire after 15 minutes; refresh sessions slide for 30 days and cap at ten per account.
- Existing IpQuery supplies geography with non-blocking timeout behavior.
- Replay revokes only the affected session; password reset revokes all sessions.
- Session metadata includes readable device label and bounded raw user-agent, retained for 30 days after terminal state.
