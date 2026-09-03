## Why

The platform needs a persistent representation of versioned terms and privacy documents for its dashboard and public web experiences. Admin users also need an initial authoring surface that establishes how organization and web legal content will be managed before persistence and publishing workflows are introduced.

## What Changes

- Add a `legal_documents` PostgreSQL table definition for versioned TipTap JSON content.
- Distinguish dashboard terms, web terms, dashboard privacy, and web privacy through a PostgreSQL enum.
- Track publication state, acceptance requirements, publication time, and standard entity identifiers and timestamps.
- Add account acceptance records linked to a specific legal document version.
- Export the schema and inferred Drizzle types from `@repo/db`.
- Add a protected Admin legal documents route and sidebar entry.
- Present separate organization and web sections, each with terms and privacy tabs backed by the shared rich editor.
- Keep editor content transient in this stage without save or publish actions.

## Capabilities

### New Capabilities

- `legal-documents`: Persist independently versioned legal documents for dashboard and web audiences.

### Modified Capabilities

None.

## Non-goals

- Generating or applying a database migration.
- Adding repositories, validators, API endpoints, migrations, or persisted Admin writes.
- Defining TipTap document validation beyond storing JSON.
- Adding save, publish, version history, acceptance, or public legal document flows.

## Impact

- Affected app and packages: `apps/admin`, `packages/db`, and `packages/i18n`.
- Reuses the existing `RichEditor` and tab primitives from `packages/ui` without modifying that package.
- Unaffected apps and packages: `apps/api`, `apps/web`, `apps/dashboard`, `packages/types`, and `packages/validators`.
- No new dependencies or breaking changes.
