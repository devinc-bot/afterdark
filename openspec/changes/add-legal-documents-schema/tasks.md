## 1. Database Schema

- [x] 1.1 Add and export the PostgreSQL legal documents enum, table, and inferred types; verify OpenSpec, formatting, lint, and the database package type check without generating a migration
- [x] 1.2 Add and export account legal acceptances with account and legal document relationships, timestamp, and duplicate prevention; verify without generating a migration

## 2. Admin Authoring Surface

- [x] 2.1 Add the localized protected Admin legal documents route, sidebar entry, organization and web tab groups, and four independent transient rich editors; verify OpenSpec, Admin tests and type check, lint, and formatting without adding persistence actions

## 3. Persistence and publishing

- [x] 3.1 Generate and review a timestamp-prefixed PostgreSQL migration for legal documents and account legal acceptances
- [x] 3.2 Add shared types, validators, and `API_ROUTES` for Admin list/get, save-draft, and publish of a legal document type
- [x] 3.3 Add repositories and Nest Admin-authenticated use cases: load current draft + last published per type, upsert unpublished draft, publish immutable version
- [x] 3.4 Wire Admin editors to load persisted content and expose **Guardar** / **Publicar** with Spanish copy, without a version-history browser
