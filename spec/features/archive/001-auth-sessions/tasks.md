# Tasks 001 - Authentication Sessions

- [x] T1: Resolve product and security decisions in `spec.md` and align final cookie, token, and provider contracts in `plan.md`.
- [x] T2: Add shared session/client-app DTOs, JWT claims, route constants, validators, `ADMIN_URL`, `REFRESH_TOKEN_SECRET`, same-site deployment and proxy environment validation, cookie constants, and localized errors with focused tests.
- [x] T3: Add the `account_sessions` Drizzle schema, timestamp-prefixed migration, and repository transactions for account-serialized creation/limit enforcement, versioned atomic rotation, replay-safe revocation, password reset revocation, expiration, and cleanup with tests.
- [x] T4: Extract the geographic lookup port, add a 1.5-second abort timeout to the existing IpQuery adapter, and add failure-tolerant session metadata and bounded device parsing with tests.
- [x] T5: Refactor API authentication issuance to create persisted sessions across local login, registration confirmation, and Google OAuth while setting the correct app-specific refresh cookie.
- [x] T6: Implement refresh and idempotent logout API use cases, controller boundaries, exact app/origin checks, documented cookie options, versioned rotation, replay response, and focused tests.
- [x] T7: Add bounded single-flight refresh and one-time request retry behavior to QueryFactory with concurrency and loop-prevention tests.
- [x] T8: Integrate session restoration, refreshed access-token persistence, and server logout into `web`, `dashboard`, and `admin`, including Google callback behavior and tests.
- [x] T9: Make password update, reset-token consumption, and all-session revocation atomic and cover rollback behavior with focused tests; add and test the daily 30-day session cleanup scheduler.
- [x] T10: Run affected tests and global type-check, lint, format check, and `git diff --check`; complete delegated acceptance and code-quality review. Global `pnpm format:check` is blocked by 1,096 repository-wide formatting violations outside this feature; the corrected auth cookie constants pass scoped format verification.
