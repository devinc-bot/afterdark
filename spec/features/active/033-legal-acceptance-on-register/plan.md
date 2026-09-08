# Plan 033 - Legal Acceptance on Registration

## Approach

Keep Admin authoring. Add a public published-document read, require checkboxes and dialogs on web and dashboard **register** screens for both email and Google, persist acceptances when the account is created, and refuse Google **new** accounts that skipped register.

No schema change. Reuse `legal_documents` and `account_legal_acceptances`.

## Layers

1. Public `GET /legal-documents/public/:type` and `PublicLegalDocumentResponse` (no drafts).
2. `insertAccountLegalAcceptances` with `onConflictDoNothing`.
3. Email confirm (user/owner): load published docs **before** `registerAccount`; insert after create; unused-token + existing account backfills acceptances.
4. Google: register page does not start OAuth until both boxes are checked; signed state includes legal-accepted; callback records acceptances on first account create; login Google that would create an account is rejected.
5. Shared register legal UI (checkboxes, dialog with published HTML from TipTap JSON) on web and dashboard.

## Google vs form

- Form: client blocks submit; API still requires published docs at confirm.
- Google on **register**: client blocks start; state proves acceptance intent; callback writes acceptances.
- Google on **login**: existing account signs in; new account is refused (must use register).

## Verification

- API tests for public GET, confirm, Google new vs existing.
- Web and dashboard register tests: unchecked blocks submit and Google; dialogs open.
- Type-check, lint, format on touched packages.

## Assumptions

- Missing published documents block signup rather than skip.
- Staff remains out of scope.
