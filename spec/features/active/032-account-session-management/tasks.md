# Tasks 032 - Account Session Management

- [x] T1: Add shared safe session-management DTOs, lifecycle constants, route constants, UUID validation reuse, and localized API error contracts with focused tests.
- [x] T2: Add account- and client-app-scoped retained-session listing plus atomic non-current active-session revocation to the account-session repository, with tests for safe mapping, stable ordering, revoked-over-expired precedence, isolation, concurrency, and terminal states.
- [x] T3: Add session list and revoke use cases and protected controller endpoints that derive account, current session, and client app from signed JWT claims, with focused API tests.
- [x] T4: Add the localized responsive Sessions section to authenticated `web` settings, including query, confirmation, revocation mutation, and state coverage.
- [x] T5: Add the shared owner/staff localized responsive Sessions section to authenticated `dashboard` settings, including query, confirmation, revocation mutation, and state coverage.
- [x] T6: Add protected admin settings navigation and the localized responsive Sessions section to `admin`, including query, confirmation, revocation mutation, and state coverage without manually editing generated routes.
- [ ] T7: Run affected tests, i18n validation, type-check, lint, format check, affected builds, manual desktop/mobile verification in all three apps, and `git diff --check`; complete delegated acceptance and code-quality review.
