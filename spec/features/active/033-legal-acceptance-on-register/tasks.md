# Tasks 033 - Legal Acceptance on Registration

- [x] T1: Add public published-by-type DTO, `API_ROUTES` `GET /public/:type`, error codes, unauthenticated use case and controller (never return drafts).
- [x] T2: Add `insertAccountLegalAcceptances` and record both required published documents on email user/owner confirmation; reject if missing; backfill when the account exists but the token is unused.
- [x] T3: Record the same acceptances when Google creates a new account from register (legal intent in OAuth state); refuse Google on login when it would create an account.
- [x] T4: Add web register checkboxes, information dialogs, and Google gating for published `termsWeb` and `privacyWeb`.
- [x] T5: Add dashboard register checkboxes, information dialogs, and Google gating for published `termsDashboard` and `privacyDashboard`.
