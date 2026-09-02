# Tasks 001 - Authentication Sessions

- [x] T1: Resolve the blocked product and security decisions in `spec.md` and align the final cookie, token, and provider contracts in `plan.md`.
- [ ] T2: Add shared session/client-app DTOs, JWT claims, route constants, validators, `ADMIN_URL`, `REFRESH_TOKEN_SECRET`, same-site deployment and proxy environment validation, cookie constants, and localized errors with focused tests.
- [ ] T3: Add the `account_sessions` Drizzle schema, timestamp-prefixed migration, and repository transactions for account-serialized creation/limit enforcement, versioned atomic rotation, replay-safe revocation, password reset revocation, expiration, and cleanup with tests.
- [ ] T4: Extract the geographic lookup port, add a 1.5-second abort timeout to the existing IpQuery adapter, and add failure-tolerant session metadata and bounded device parsing with tests.
- [ ] T5: Refactor API authentication issuance to create persisted sessions across local login, registration confirmation, and Google OAuth while setting the correct app-specific refresh cookie.
- [ ] T6: Implement refresh and idempotent logout API use cases, controller boundaries, exact app/origin checks, the documented cookie options, versioned rotation, replay response, and focused tests.
- [ ] T7: Add bounded single-flight refresh and one-time request retry behavior to QueryFactory with concurrency and loop-prevention tests.
- [ ] T8: Integrate session restoration, refreshed access-token persistence, and server logout into `web`, `dashboard`, and `admin`, including Google callback behavior and tests.
- [ ] T9: Make password update, reset-token consumption, and all-session revocation atomic and cover rollback behavior with focused tests; add and test the daily 30-day session cleanup scheduler.
- [ ] T10: Run affected tests and global type-check, lint, format check, and `git diff --check`; complete delegated acceptance and code-quality review.
