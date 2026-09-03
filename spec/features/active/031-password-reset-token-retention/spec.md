# Spec 031 - Password Reset Token Retention

## Context and Objective

Successful password resets currently mark their token as used and retain it until expiration. Remove a consumed token within the same transaction as password update and session revocation, minimizing retained credential data without weakening single-use protection.

## Users / Actors

- Account holders resetting a password.
- API operators maintaining credential cleanup.

## User Stories

- H1: As an account holder, I want a successful password reset to consume its token permanently so that no unnecessary credential record remains.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN a valid password reset completes, THE SYSTEM SHALL atomically delete the matching unused, unexpired reset token, update the password, and revoke all account sessions.
- RF-2: IF token deletion, password update, or session revocation fails, THEN THE SYSTEM SHALL roll back every operation.
- RF-3: WHEN daily cleanup runs, THE SYSTEM SHALL delete only unused reset tokens whose expiration has elapsed.

## Non-Functional Requirements

- Token consumption SHALL remain conditional and atomic to prevent concurrent reuse.

## Edge Cases

- A concurrent reset attempts to consume the same token.
- Password or session revocation fails after token consumption begins.

## Out of Scope

- Changes to reset-token expiry duration or issuance limits.
- Retention changes for registration tokens.

## Definition of Done

- Repository and scheduler tests prove atomic deletion, rollback, and expired-unused cleanup behavior.
- Affected tests, type-check, lint, format check, and `git diff --check` pass.

## Open Questions

None.
