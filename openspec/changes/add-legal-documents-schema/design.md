## Context

`@repo/db` uses Drizzle ORM with Neon PostgreSQL. Existing entities use `pgTable` and `createBaseColumns` to provide an internal serial identifier, public UUID, and timestamps. The supplied model uses MySQL-specific builders and must be represented with the repository's PostgreSQL conventions. `apps/admin` already provides protected file routes, a shared sidebar shell, localized copy, tabs, and a shared TipTap-based `RichEditor` suitable for an initial authoring surface.

## Goals / Non-Goals

**Goals:**

- Define a PostgreSQL legal document enum and table.
- Preserve the requested version, title, TipTap content, publication, and acceptance fields.
- Persist when an account accepts a specific legal document.
- Export inferred select and insert types through the schema barrel.
- Add a protected Admin destination for editing organization and web legal content.
- Reuse shared tabs and rich editors while keeping this stage explicitly transient.

**Non-Goals:**

- Generate or apply the migration in this change.
- Add application-managed update timestamp behavior beyond the existing base-column convention.
- Add repositories, validation, API access, persisted writes, or publishing flows.

## Decisions

- Name the table `legal_documents` and its Drizzle export `legalDocuments`, matching repository naming conventions.
- Use a PostgreSQL enum named `legal_document_type` with the exact requested values: `termsDashboard`, `termsWeb`, `privacyDashboard`, and `privacyWeb`. A database enum prevents unsupported document audiences from being persisted.
- Use `jsonb` for TipTap content. PostgreSQL JSONB preserves structured JSON while supporting more effective future querying and indexing than plain JSON.
- Reuse `createBaseColumns('legal_documents')`. This provides `serial` auto-increment behavior, a public `documentId`, and the repository-standard timestamps.
- Use timezone-aware `publishedAt` to match the timestamp convention in base columns.
- Name the acceptance table `account_legal_acceptances` and link it to `accounts.id` and `legal_documents.id`. A unique constraint on both foreign keys prevents duplicate acceptance of the same document version across web, owner, and staff identities.
- Default `acceptedAt` to the database current time and use cascading deletes so acceptance rows cannot outlive their account or legal document.
- Add `/legal-documents` under the authenticated Admin route group and expose it through `ADMIN_ROUTES` and the primary sidebar navigation.
- Render organization and web as two vertically separated sections on the same page. Each section owns terms and privacy tabs so audiences remain visible and independently editable without adding another navigation level.
- Give each of the four editors independent local React state. Tab changes preserve edits while the route remains mounted, but navigation or reload may discard them.
- Do not render save or publish controls. A non-persistent control would create a false success state and conflict with the explicitly deferred API layer.
- Source all labels, descriptions, tab names, and editor accessible names from the Admin English and Spanish locale files.

## Risks / Trade-offs

- [Enum values are difficult to remove after deployment] -> Keep this change limited to the four explicitly requested stable categories.
- [TipTap content has no database-level shape validation] -> Add shared Zod validation when write flows are introduced.
- [The shared `updatedAt` column does not update automatically] -> Application write operations must set it consistently with other entities in the repository.
- [The shared editor currently emits HTML while the schema stores TipTap JSON] -> Keep editor output in component state only; define the conversion and validation contract with the future write API.
- [Transient edits can be lost] -> Omit save controls and describe the screen as an editing preview until persistence is implemented.

## Migration Plan

1. Generate a timestamp-prefixed migration from `packages/db` after reviewing the schema.
2. Review the generated enum and table SQL.
3. Apply the migration with the direct migration database URL.
4. Roll back by dropping the empty table and enum if deployment fails before consumers are added.

## Open Questions

The API write contract and HTML-to-TipTap JSON handling remain intentionally deferred.
