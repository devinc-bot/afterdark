# Plan 031 - Password Reset Token Retention

## Approach

Replace the conditional `usedAt` update in `completePasswordReset` with a conditional `DELETE ... RETURNING` in the existing database transaction. Preserve password update and session revocation ordering after successful token deletion. Restrict the existing daily cleanup repository query to tokens with `usedAt IS NULL` because consumed tokens are deleted immediately.

## Verification

- Extend transaction mocks to assert token deletion and rollback behavior.
- Test the cleanup predicate for unused expired tokens.
- Run affected DB/API tests, type checks, lint, formatting, and `git diff --check`.
