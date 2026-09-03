# Spec 032 - Account Session Management

## Context and Objective

Lumina persists account sessions with client-app, device, network, approximate location, and lifecycle metadata, but authenticated users cannot inspect or remotely revoke them. This change adds a Sessions section to `web`, `dashboard`, and `admin` so each user can review sessions created in the current client app, distinguish the current session from other sessions, and revoke another active session without exposing refresh credentials or internal database identifiers.

## Users / Actors

- Customers using `web`.
- Owners and staff using `dashboard`.
- Provisioned administrators using `admin`.

## User Stories

- H1: As an authenticated user, I want to review sessions for the app I am using so that I can recognize current and previous access to my account.
- H2: As an authenticated user, I want to revoke another active session so that its refresh credential can no longer renew access.
- H3: As an authenticated user, I want to identify my current session so that I do not accidentally revoke the device I am using.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN an authenticated user opens the Sessions section in `web`, `dashboard`, or `admin`, THE SYSTEM SHALL list sessions owned by the authenticated account and bound to the current client app.
- RF-2: THE SYSTEM SHALL display active and expired sessions for the authenticated account and current client app, ordered with the current session first and all remaining sessions by most recent creation time.
- RF-3: WHEN session data is returned, THE SYSTEM SHALL expose the session `documentId`, client app, device label, IP address, derived approximate location, creation time, expiration time, revocation time, lifecycle status, and whether it is the current session.
- RF-4: THE SYSTEM SHALL NOT expose the internal numeric identifier, account identifier, refresh-token hash, refresh-token version, or raw user-agent through the session-management API.
- RF-5: WHEN an active non-current session is selected for removal and the user confirms the action, THE SYSTEM SHALL atomically delete that account-session row and remove its refresh capability.
- RF-6: THE SYSTEM SHALL run account-session cleanup every 14 days and physically delete expired or revoked rows whose terminal timestamp is at least 7 days old.
- RF-7: IF a user attempts to revoke the current session through the session-management endpoint, THEN THE SYSTEM SHALL reject the request and preserve the session.
- RF-8: IF a user attempts to revoke a session owned by another account, bound to another client app, already terminal, or not found, THEN THE SYSTEM SHALL return the same not-found result without disclosing whether that session exists.
- RF-9: WHILE a remote session has a previously issued unexpired access token, THE SYSTEM SHALL allow the existing stateless access-token behavior; the revoked session SHALL be rejected when it next attempts to refresh.
- RF-10: WHEN no sessions can be displayed, the list is loading, the list fails, or a revocation fails, THE SYSTEM SHALL show the corresponding localized state without affecting the user's current authenticated session.
- RF-11: WHEN the Sessions section is rendered on desktop or mobile, THE SYSTEM SHALL present session metadata and destructive actions in an accessible layout with a confirmation step before revocation.
- RF-12: THE SYSTEM SHALL place the Sessions section in authenticated settings for `web` and `dashboard`, and SHALL provide an authenticated settings destination for `admin`.
- RF-13: WHEN remote-session revocation succeeds, THE SYSTEM SHALL close the confirmation dialog and remove the revoked row from the visible Sessions table.

## Non-Functional Requirements

- Session ownership, current-app scope, and current-session protection are enforced by the API; client behavior is not an authorization boundary.
- Managed session removal uses an ownership-scoped atomic repository delete; other terminal session flows remain eligible for scheduled cleanup.
- All visible copy and user-facing errors are localized in Spanish and English through `@repo/i18n`.
- Shared response contracts and lifecycle constants are defined in `@repo/types`; API routes are defined in `API_ROUTES`.
- The three clients provide equivalent behavior while preserving each app's existing settings and navigation patterns.

## Edge Cases

- The account has only the current session.
- A retained row is expired but has no `revokedAt` value.
- A revoked row created by a non-management flow reaches the 7-day retention cutoff before the next 14-day cleanup run.
- A session expires or is revoked between list retrieval and confirmation.
- Two requests attempt to revoke the same session concurrently.
- A forged `documentId` references another account or another client app.
- Device, IP, or geographic metadata is unavailable.
- The current session's row is unexpectedly absent or terminal while its access token remains unexpired.

## Out of Scope

- Listing or revoking sessions created in a different client app.
- Revoking the current session from the Sessions section; normal logout remains the supported flow.
- Revoking all other sessions in one action.
- Immediate invalidation of already issued access tokens or a database lookup on every authenticated request.
- Editing session metadata, exact geolocation, or exposing raw refresh credentials and raw user-agent values.
- Changing the existing session creation limit.

## Definition of Done

- Repository and API tests prove account isolation, current-app filtering, safe mapping, deterministic ordering, current-session protection, and idempotent non-disclosing revocation behavior.
- Focused client tests cover loading, error, empty, active, terminal, current-session, confirmation, and revocation states in `web`, `dashboard`, and `admin`.
- A manual responsive check confirms the primary list and revoke flow in all three apps.
- Type-check, lint, format check, affected tests, i18n validation, and `git diff --check` pass.
- A delegated review confirms the acceptance criteria and applicable repository standards.

## Open Questions

None.
