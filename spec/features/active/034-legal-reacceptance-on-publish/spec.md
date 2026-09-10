# Spec 034 - Legal Reacceptance After Publish

## Context and Objective

Registration already records acceptances against the published `legal_documents` rows. When Admin publishes a new immutable version of terms or privacy, existing **web customers** (`user`) and **dashboard owners** (`owner`) still hold acceptances for the previous row. They must accept each newly published document of their audience before using the authenticated app. Staff and admin are out of this increment.

## Users / Actors

- Customer (`user`) on `web`, previously accepted `termsWeb` and/or `privacyWeb`
- Owner (`owner`) on `dashboard`, previously accepted `termsDashboard` and/or `privacyDashboard`
- Super admin who publishes a new version (unchanged authoring)
- API enforcing current-published acceptances on authenticated traffic

## User Stories

- H1: As a signed-in customer, I want to be sent to a dedicated acceptance page when web terms or privacy were republished so that I cannot use the rest of the site until I accept the new version(s).
- H2: As a signed-in owner, I want the same for dashboard terms and privacy.
- H3: As the platform, I want the API to reject other authenticated operations until those current published documents are accepted, so the UI is not the security boundary.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN an Admin publishes a new version of a legal document type, THE SYSTEM SHALL treat previous acceptances of older rows of that type as insufficient for that type.
- RF-2: WHEN a signed-in `user` is missing an acceptance for the current published `termsWeb` and/or `privacyWeb`, THE SYSTEM SHALL allow only session/auth-maintenance, public published-legal GET, and submitting acceptance of the stale types, and SHALL block other authenticated `web` API use with a dedicated error.
- RF-3: WHEN a signed-in `owner` is missing an acceptance for the current published `termsDashboard` and/or `privacyDashboard`, THE SYSTEM SHALL apply the same allow-list and block for authenticated `dashboard` API use.
- RF-4: IF only one of the two audience documents has a newer published row than the account accepted, THEN THE SYSTEM SHALL require reacceptance of **that type only**.
- RF-5: WHEN the person opens the dedicated legal-acceptance route on `web` or `dashboard`, THE SYSTEM SHALL show checkboxes and information dialogs only for the stale published documents of that audience.
- RF-6: IF a required checkbox is unchecked, THEN THE SYSTEM SHALL prevent submitting acceptance.
- RF-7: WHEN the person accepts the stale published documents, THE SYSTEM SHALL persist `account_legal_acceptances` for those current published rows and SHALL restore normal use.
- RF-8: IF the account has no acceptance for a required current published document (including accounts created before registration acceptance), THEN THE SYSTEM SHALL treat that type as stale (same as an old version).
- RF-9: WHEN the person is not signed in, THE SYSTEM SHALL NOT apply this gate (public catalog, login, register, and guest landing remain available).
- RF-10: THE SYSTEM SHALL NOT apply this gate to `admin` or `staff` in this increment.

## Non-Functional Requirements

- Spanish and English copy via `@repo/i18n`.
- Identifiers and routes in English.
- No new database columns: reuse `account_legal_acceptances` unique `(accountId, legalDocumentId)`.
- Authorization remains on the API; the dedicated page is not sufficient by itself.
- UI copy and errors in Spanish; technical requirements in English.

## Edge Cases

- Publish between page load and submit: persist the **current** published row at submit time; if that type is no longer the one the client showed, reload the page.
- Duplicate accept of the same published row: ignore (`onConflictDoNothing`).
- Both types stale: both checkboxes required on the same page.
- Refresh/logout/login must still work while stale.
- Google login of an existing account that is stale: issue the session, then send them to the dedicated page (do not refuse login).

## Out of Scope

- Staff dashboard gating
- Admin app gating
- Forcing re-accept on every login when versions are unchanged
- Dedicated public `/terminos` pages
- Admin version-history browser
- Email notification that a new version was published

## Definition of Done

- Stale `user` and `owner` cannot call blocked authenticated APIs until they accept current published docs of the stale types.
- Dedicated pages on web and dashboard show only stale documents, persist acceptances, and then allow the rest of the app.
- Tests cover only-one-type stale, both stale, already current, and unauthenticated/public skip.

## Open Questions

- None. Who: `user` on web and `owner` on dashboard. Which docs: only republished (stale) types. UX: dedicated page plus API allow-list.
