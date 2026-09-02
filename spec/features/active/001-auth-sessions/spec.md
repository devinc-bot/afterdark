# Spec 001 - Authentication Sessions

## Context and Objective

Lumina currently issues one-day access tokens without persisted sessions, refresh support, or server-side revocation. This change introduces account-scoped sessions for web, dashboard, and admin so authenticated users can renew short-lived access safely, sign out server-side, and retain useful device and approximate location metadata without storing raw refresh credentials.

## Users / Actors

- Customers using `web`.
- Owners and staff using `dashboard`.
- Provisioned administrators using `admin`.
- API operators responsible for authentication security and session diagnostics.

## User Stories

- H1: As an authenticated user, I want my access to renew without signing in again so that short-lived access tokens do not interrupt my work.
- H2: As an authenticated user, I want logout to revoke the current session so that its refresh credential cannot be reused.
- H3: As a security operator, I want sessions to record device, IP, and approximate geographic metadata so that suspicious access can be investigated.
- H4: As an authenticated user, I want independent sessions on multiple devices so that signing in on one device does not disconnect every other device.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN a customer, owner, staff member, or administrator authenticates successfully, THE SYSTEM SHALL create an account session and issue an access token plus an opaque refresh credential.
- RF-2: WHEN a refresh credential is issued, THE SYSTEM SHALL send it in an `HttpOnly` cookie and SHALL persist only its cryptographic hash.
- RF-3: WHEN a valid refresh credential is presented, THE SYSTEM SHALL atomically increment its rotation version, persist the replacement secret hash, set `expiresAt` to 30 days from that refresh, and issue a new 15-minute access token.
- RF-4: IF a refresh credential has a valid server MAC and presents a rotation version lower than the session's current version, THEN THE SYSTEM SHALL revoke the affected session and reject the request.
- RF-4A: IF a refresh credential presents the current rotation version with a secret that does not match the persisted hash, THEN THE SYSTEM SHALL reject the request without revoking the session.
- RF-4B: IF a refresh credential has an invalid server MAC, THEN THE SYSTEM SHALL reject it without loading or revoking the referenced session.
- RF-5: WHEN a user logs out, THE SYSTEM SHALL revoke the current persisted session and clear its refresh cookie.
- RF-6: THE SYSTEM SHALL associate each session with an `account` so the same model supports user, owner, staff, and admin roles.
- RF-7: THE SYSTEM SHALL record the originating IP address when it can be resolved safely, device metadata, and nullable city, state, and country values for each session.
- RF-8: WHEN geographic lookup succeeds, THE SYSTEM SHALL derive a display location from the available city, state, and country values without persisting a duplicated concatenated value.
- RF-9: IF geographic lookup fails or returns incomplete data, THEN THE SYSTEM SHALL create the session without blocking authentication and SHALL keep unavailable geographic fields null.
- RF-10: WHILE a session remains active, THE SYSTEM SHALL allow refresh for up to 30 days using sliding expiration.
- RF-11: WHEN creating an eleventh active session for one account, THE SYSTEM SHALL revoke the account's oldest active session.
- RF-11A: WHEN sessions are created concurrently for one account, THE SYSTEM SHALL serialize limit enforcement so no more than ten sessions remain active after each creation transaction.
- RF-12: WHEN multiple API requests require refresh concurrently in one client, THE SYSTEM SHALL perform one refresh operation and retry each eligible request at most once.
- RF-13: IF refresh fails because the credential is missing, invalid, expired, or revoked, THEN THE SYSTEM SHALL clear local authentication state and require a new login.
- RF-14: THE SYSTEM SHALL support refresh and server-side logout consistently in `web`, `dashboard`, and `admin`.
- RF-15: THE SYSTEM SHALL obtain geographic metadata through a configurable provider adapter rather than coupling authentication use cases to a vendor SDK.
- RF-16: THE SYSTEM SHALL bind each session and refresh cookie to exactly one client app: `web`, `dashboard`, or `admin`.
- RF-17: WHEN a password reset succeeds, THE SYSTEM SHALL revoke every active session for the affected account.
- RF-18: WHEN Google OAuth succeeds, THE SYSTEM SHALL set the app-specific refresh cookie before redirecting without placing an access token in the redirect URL.
- RF-19: THE SYSTEM SHALL store a bounded raw user-agent and a human-readable browser and operating-system device label for each session when available.
- RF-20: WHEN a session has been expired or revoked for 30 days, THE SYSTEM SHALL delete the session and its IP, device, and geographic metadata.
- RF-21: WHEN refresh or logout receives an app identifier, THE SYSTEM SHALL accept it only when the request `Origin` exactly matches that app's configured origin and the corresponding app-specific cookie is present.
- RF-22: THE SYSTEM SHALL use host-only refresh cookies named `repo.web.auth.refresh`, `repo.dashboard.auth.refresh`, and `repo.admin.auth.refresh`, with path `/api/auth`, `HttpOnly`, `SameSite=Lax`, a 30-day maximum age, and `Secure` outside local development.
- RF-23: WHEN clearing a refresh cookie, THE SYSTEM SHALL use the same name, host-only domain behavior, path, `SameSite`, and `Secure` attributes used to set it.
- RF-24: WHEN the API starts, THE SYSTEM SHALL configure trusted proxy handling for the deployed proxy topology and SHALL resolve client IP through Express rather than trusting forwarding headers directly in authentication use cases.
- RF-25: WHEN session geography is requested, THE SYSTEM SHALL stop waiting for IpQuery after 1.5 seconds and continue authentication with nullable geographic fields.
- RF-26: THE SYSTEM SHALL truncate raw user-agent metadata to 512 characters and device labels to 255 characters before persistence.
- RF-27: WHEN cleanup runs daily, THE SYSTEM SHALL delete sessions whose earliest terminal timestamp (`expiresAt` or `revokedAt`) is at least 30 days old.
- RF-28: WHEN password reset changes a password, THE SYSTEM SHALL atomically consume the reset credential, update the password, and revoke all sessions, or persist none of those changes.

## Non-Functional Requirements

- Refresh credentials SHALL contain at least 256 bits of cryptographically secure entropy and SHALL never be logged or persisted in plaintext.
- Refresh rotation and replay handling SHALL be atomic under concurrent requests.
- Geographic lookup SHALL use a bounded timeout and fail open for authentication availability.
- IP and geographic metadata SHALL not be exposed through public authentication responses in this iteration.
- Cookie and origin validation SHALL protect refresh and logout operations against cross-site request forgery.
- Supported deployments SHALL host `API_PUBLIC_URL`, `WEB_URL`, `DASHBOARD_URL`, and `ADMIN_URL` under the same schemeful site; different ports and subdomains are allowed.
- Access-token verification SHALL remain stateless; revocation takes effect for refresh immediately and for access when the short-lived token expires.

## Edge Cases

- Two requests attempt to rotate the same refresh credential concurrently.
- A rotated credential is replayed after its replacement was issued.
- The refresh cookie is absent, malformed, expired, or belongs to a revoked session.
- Geographic lookup times out, fails, or provides only a subset of city, state, and country.
- The request crosses a trusted reverse proxy and includes multiple forwarded IP values.
- A user logs into more than one Lumina app in the same browser.
- A request claims one app while originating from another app's configured origin.
- The oldest session is already expired or revoked when enforcing the ten-session limit.
- Logout is requested more than once for the same session.

## Out of Scope

- A user-facing session management screen.
- Manual remote logout of a selected device or all devices.
- Exact GPS location or browser geolocation permission.
- Persisting full device fingerprinting data.
- Changing staff invitation acceptance to log in automatically.
- Database-backed validation of every access-token-authenticated API request.

## Definition of Done

- All functional requirements have focused automated coverage at repository, API, shared HTTP client, and client integration boundaries.
- A timestamp-prefixed Drizzle migration creates the session persistence model and applicable indexes.
- Local login creates sessions for user (`web`), owner/staff (`dashboard`), and admin (`admin`); registration confirmation creates user/owner sessions; Google OAuth creates user/owner sessions for its currently supported apps.
- Refresh and logout work from web, dashboard, and admin without refresh loops or cross-app cookie collisions.
- Type-check, lint, format check, affected tests, and `git diff --check` pass.
- A delegated review confirms the acceptance criteria and applicable repository standards.

## Open Questions

None.
