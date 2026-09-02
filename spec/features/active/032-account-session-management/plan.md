# Plan 032 - Account Session Management

## Approach

Extend the existing session vertical slice with an account- and client-app-scoped management read model. Derive the requester account, role, and current session from the authenticated JWT, map the signed role to its canonical client app, and keep all ownership checks in repository predicates. Revoke selected sessions logically by setting `revokedAt`; do not physically delete rows or alter stateless access-token verification.

## Data Model

No schema or migration is required. Reuse `account_sessions` and its existing metadata and retention behavior. Treat a session as revoked whenever `revokedAt` is non-null, including after its original expiration time; otherwise treat it as active when `expiresAt` is later than the request time and expired when it is not. Do not expose `updatedAt` as activity or refresh metadata because non-refresh lifecycle updates also change it.

## Contracts

- Add shared account-session list item and response DTOs in `@repo/types` with public identifiers, safe metadata, derived lifecycle status, and `isCurrent`.
- Add shared lifecycle status constants for `active`, `expired`, and `revoked` without duplicating magic strings in clients.
- Add list and revoke routes under `API_ROUTES.session`; validate the target `documentId` at the controller boundary with the shared UUID validator.
- Return a no-content success for revocation and use the same localized not-found response for cross-account, cross-app, terminal, and absent targets.
- Exclude refresh hashes, refresh versions, internal numeric IDs, account IDs, and raw user-agent values from public contracts.

## Repository and API

1. Add a repository query that lists retained sessions by authenticated account and current client app without joining roles or producing duplicate rows.
2. Map lifecycle status with `revoked` taking precedence over `expired`, derive approximate location from available geographic fields, mark the JWT's `sessionDocumentId` as current, and order current first then by `createdAt` descending with internal `id` descending as a stable repository-only tie-breaker.
3. Add an atomic repository update that sets `revokedAt` only when the target public identifier belongs to the authenticated account and current client app, is not the current session, is not revoked, and has not expired.
4. Add list and revoke use cases to the existing session module.
5. Extend the protected session controller. Resolve client app from the signed JWT role through the canonical role-to-app mapping rather than accepting client-app or origin values as authorization input.
6. Keep access-token verification stateless. Remote revocation prevents the next refresh but does not invalidate an already issued access token before its 15-minute expiry.

## Clients

- `web`: add the Sessions section after the existing profile form in authenticated settings.
- `dashboard`: add one shared Sessions section to the role-dispatched settings view, outside owner and staff profile forms.
- `admin`: add a protected settings route and account-menu navigation entry, then render the same session-management states using the admin visual language.
- In each app, add a focused service, query, revocation mutation, query-key entry, confirmation dialog, and responsive list/card presentation. Invalidate the session list after successful revocation.
- Show the current, active, revoked, and expired states explicitly. Disable destructive actions for the current and terminal sessions.
- Localize headings, metadata labels, status labels, confirmations, empty/error states, and API errors in Spanish and English.

## Security and Privacy

- Scope list and revoke operations by authenticated account and the client app derived from the signed JWT role.
- Compare the target against the signed `sessionDocumentId` on the server to protect the current session.
- Use a non-disclosing not-found result for inaccessible and non-revocable targets.
- Preserve retained rows for audit and replay handling; only the existing cleanup scheduler physically deletes terminal sessions.
- Do not render raw user-agent or refresh credential fields.

## Verification

- Add repository tests for current-app filtering, account isolation, lifecycle mapping, ordering, absent metadata, and atomic revocation predicates.
- Add API use-case/controller tests for authentication, trusted app derivation, UUID validation, current-session rejection, safe response mapping, and non-disclosing failures.
- Add focused client tests in all three apps for loading, failure, empty, current, active, expired, revoked, confirmation, pending, success, and mutation failure behavior.
- Run affected Vitest suites, `pnpm check:i18n`, `pnpm type-check`, `pnpm lint`, `pnpm format:check`, the affected app builds when practical, and `git diff --check`.
- Perform a manual desktop and mobile check in `web`, `dashboard`, and `admin`, including revoking another browser session and confirming that its next refresh fails.

## Confirmed Decisions

- Each app lists only sessions belonging to that same client app.
- The section includes active sessions and retained expired or revoked history.
- The current session is visible but cannot be revoked from this section.
- Remote revocation takes effect at the next refresh; existing access tokens remain stateless for up to 15 minutes.
- Removal is logical revocation, not physical deletion.
