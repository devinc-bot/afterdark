## Why

The platform needs a persistent representation of versioned terms and privacy documents for its dashboard and public web experiences. Admin users also need to save unpublished drafts and publish immutable versions without creating a new public version on every save.

## What Changes

- Add a `legal_documents` PostgreSQL table definition for versioned TipTap JSON content.
- Distinguish dashboard terms, web terms, dashboard privacy, and web privacy through a PostgreSQL enum.
- Track publication state, acceptance requirements, publication time, and standard entity identifiers and timestamps.
- Add account acceptance records linked to a specific legal document version.
- Export the schema and inferred Drizzle types from `@repo/db`.
- Add a protected Admin legal documents route and sidebar entry.
- Present separate organization and web sections, each with terms and privacy tabs backed by the shared rich editor.
- Keep editor content transient until persistence is implemented.
- Persist Admin saves as unpublished drafts and freeze a new immutable version only on publish.

## Capabilities

### New Capabilities

- `legal-documents`: Persist independently versioned legal documents for dashboard and web audiences.

### Modified Capabilities

None.

## Non-goals

- Defining TipTap document validation beyond storing JSON at the API boundary.
- Adding public legal pages, account acceptance UI, or re-acceptance prompts after a new published version.
- Showing a full version-history browser in Admin in this increment.

## Impact

- Affected apps and packages: `apps/admin`, `apps/api`, `packages/db`, `packages/types`, `packages/validators`, `packages/common`, and `packages/i18n`.
- Reuses the existing `RichEditor` and tab primitives from `packages/ui` without modifying that package.
- Unaffected apps: `apps/web` and `apps/dashboard` remain read-only consumers later.
- No new dependencies.
