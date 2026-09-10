# Spec 033 - Legal Acceptance on Registration

## Context and Objective

Published terms and privacy documents already exist for web and dashboard. Registration (email form and Google) must show those documents in a dialog, require two checkboxes, and refuse signup until both are accepted. Acceptances are stored against the published document versions when the account is created.

## Users / Actors

- Person registering as a customer on `web` (email or Google)
- Person registering as an owner on `dashboard` (email or Google)
- API enforcing published documents and writing `account_legal_acceptances`

## User Stories

- H1: As a registering customer, I want to read and accept web terms and privacy in a dialog so that I cannot create an account without agreeing.
- H2: As a registering owner, I want the same for dashboard terms and privacy, including Google continue.
- H3: As the platform, I want acceptances stored on the published legal document rows so later publishes do not rewrite what the account accepted.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN an unauthenticated client requests the latest published legal document by type, THE SYSTEM SHALL return that published document's public identifier, type, version, title, TipTap content, and publication time, and SHALL NOT return unpublished drafts.
- RF-2: IF no published document exists for the requested type, THEN THE SYSTEM SHALL respond with not found.
- RF-3: WHEN a person views the `web` register form, THE SYSTEM SHALL require terms and privacy checkboxes and SHALL open each published `termsWeb` / `privacyWeb` document in an information dialog.
- RF-4: WHEN a person views the `dashboard` register form, THE SYSTEM SHALL require terms and privacy checkboxes and SHALL open each published `termsDashboard` / `privacyDashboard` document in an information dialog.
- RF-5: IF either checkbox is unchecked, OR a required published document is missing, THEN THE SYSTEM SHALL prevent email submit and SHALL prevent starting Google from that register screen.
- RF-6: WHEN email registration is confirmed and the account is created, THE SYSTEM SHALL persist acceptances for both required published documents of that audience.
- RF-7: WHEN Google creates a new account from register, THE SYSTEM SHALL persist the same two acceptances for that audience.
- RF-8: IF a required published document is missing at account creation, THEN THE SYSTEM SHALL reject creation and SHALL NOT leave an account without both acceptances (retry with unused token MUST still record them).
- RF-9: WHEN Google is used on the login screen for an existing account, THE SYSTEM SHALL sign in without new legal checkboxes.
- RF-10: IF Google on login would create a new account, THEN THE SYSTEM SHALL refuse and direct the person to register so they can accept the documents.

## Non-Functional Requirements

- Spanish and English copy via `@repo/i18n`.
- Identifiers and routes in English.
- No new database columns in this increment.
- Public GET uses the default public rate-limit profile.
- Google start from register carries legal-acceptance intent in the signed OAuth state so the callback cannot skip the UI.

## Edge Cases

- Only one of terms/privacy published: block UI and API.
- Newer publish between request and confirm: record latest published at create time.
- Duplicate `(accountId, legalDocumentId)`: ignore (already accepted).
- Google continue on register with checkboxes unchecked: no navigation.

## Out of Scope

- Staff invitation acceptance
- Dedicated public `/terminos` or `/privacidad` pages
- Forcing existing accounts to re-accept after a new published version
- Admin version-history browser
- Checkboxes on the login form for existing accounts

## Definition of Done

- Public published GET, email confirm and Google new-account acceptances, and register UI (form + Google) on web and dashboard are tested.
- Unchecked boxes or unpublished documents block both email and Google signup.

## Open Questions

- None. Apps: web and dashboard. Channels: email form and Google. Presentation: checkboxes plus information modal.
