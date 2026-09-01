# Spec 031 - Local Spec Store

## Context and Objective

The repository plans work through Markdown artifacts under `spec/features/`, but those artifacts are
not queryable as structured local data or associated with an explicit project record. This feature adds
a local SQLite-backed developer tool that indexes the `Lumina` project and its feature specifications,
plans, and tasks while preserving the Markdown files as the canonical source. The store is prepared to
write the same derived records to a Turso/libSQL database later by accepting a configured database URL
and auth token, without adding an MCP server or making remote connectivity part of the local workflow.

## Users / Actors

- Developers who create, inspect, validate, and synchronize SDD feature artifacts.
- AI tooling that will later consume the CLI or its shared storage service.
- Continuous integration jobs that may validate Markdown-to-store synchronization without credentials.

## User Stories

- H1: As a developer, I want to index active and archived feature artifacts into a local SQLite file so
  that I can query their metadata and contents without manually traversing Markdown files.
- H2: As a developer, I want every feature to belong to the `Lumina` project so that queries have an
  explicit project boundary from the first indexed record.
- H2: As a developer, I want Markdown to remain canonical so that feature changes stay reviewable and
  recoverable through Git.
- H3: As a developer, I want the same CLI to accept a Turso/libSQL URL and auth token later so that I
  can persist the derived index remotely without rewriting its commands or data model.
- H4: As a future MCP integration author, I want a reusable store service separated from CLI parsing so
  that an MCP adapter can expose the same operations without duplicating storage logic.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN a developer runs the index command without remote configuration, THE SYSTEM SHALL scan
  `spec/features/active/` and `spec/features/archive/` and write a local SQLite index below
  `spec/.local/`.
- RF-2: WHEN a feature folder contains exactly `spec.md`, `plan.md`, and `tasks.md`, THE SYSTEM SHALL
  store its project, number, slug, lifecycle location, artifact content, content hashes, and index
  timestamp.
- RF-3: WHEN the store initializes, THE SYSTEM SHALL create the `Lumina` project record if it does not
  already exist.
- RF-3: WHEN a source artifact changes, moves between active and archive, or is removed, THE SYSTEM
  SHALL make the next index run reflect the source tree exactly and SHALL remove stale records.
- RF-4: WHEN a developer configures `SPEC_STORE_URL` with a Turso/libSQL URL and provides
  `SPEC_STORE_AUTH_TOKEN`, THE SYSTEM SHALL write the same derived records to that remote database.
- RF-5: IF a configured remote URL requires an auth token and no token is provided, THEN THE SYSTEM
  SHALL fail before altering the local or remote store and SHALL state how to configure credentials.
- RF-6: IF a feature folder is incomplete, malformed, duplicated, or cannot be parsed for its required
  identifier, THEN THE SYSTEM SHALL fail the index operation with the affected path and SHALL not
  commit a partial index.
- RF-7: WHEN a developer runs the query command, THE SYSTEM SHALL return structured results from the
  selected local or remote store without modifying Markdown artifacts.
- RF-8: WHEN the configured store is empty or absent, THE SYSTEM SHALL create its schema
  automatically before indexing.
- RF-9: THE SYSTEM SHALL expose root commands for indexing, querying, and validating feature artifacts
  without requiring an MCP server.
- RF-10: THE SYSTEM SHALL keep remote endpoint URLs and authentication tokens out of committed files,
  logs, and command output.
- RF-11: WHEN a feature artifact is created or updated, THE SYSTEM SHALL allow it to be tracked by Git
  so that canonical Markdown remains reviewable and recoverable independently of the derived store.

## Non-Functional Requirements

- Markdown in `spec/features/` MUST remain the source of truth; the database is a regenerable index.
- Every feature MUST belong to exactly one project; the initial repository project is `Lumina`.
- The local default MUST resolve to `<repository-root>/spec/.local/spec-store.sqlite` and local use
  MUST not require a network connection or credentials.
- The storage adapter MUST use `@libsql/client` so its configured URL supports a local SQLite file now
  and a `libsql:` Turso endpoint later.
- The CLI MUST resolve the repository root reliably rather than depending on the shell working
  directory.
- All database writes for one index run MUST be atomic.
- Remote use MUST be explicit through environment configuration or documented CLI options; it MUST NOT
  silently synchronize local records to Turso.
- Dependency versions MUST be exact and the pnpm lockfile MUST be committed.

## Edge Cases

- Feature Markdown is intentionally ignored by the current Git rules, so the workflow must not assume
  new active artifacts are automatically staged.
- Existing features do not all use the same heading layout or status representation.
- The initial project record could be missing or conflict with an existing project key.
- SQLite can create WAL and shared-memory sidecars beside the local database.
- A remote Turso URL normally requires a separate scoped auth token, not only the URL.
- A remote index can contain stale rows when the source tree changes on another machine.
- Local and remote index attempts can fail mid-operation due to a corrupt file or network interruption.
- A caller may run commands from a workspace subdirectory instead of the repository root.

## Out of Scope

- An MCP server, MCP configuration, resources, tools, prompts, or client integration.
- Editing, generating, or treating database content as the canonical Markdown artifacts.
- Multiple projects, cross-project feature ownership, or moving a feature between projects.
- Automatic local-to-Turso replication, embedded replicas, offline sync, conflict resolution, or
  bidirectional merge behavior.
- Production application access, API endpoints, NestJS modules, Drizzle PostgreSQL schemas, or
  migrations.
- Storing secrets, provider account provisioning, or creating Turso databases and tokens.
- Full-text search, embeddings, a web interface, multi-user authorization, and change subscriptions.

## Definition of Done

- A private `@repo/spec-store` workspace offers a tested storage service and CLI.
- `pnpm spec:index` creates a local SQLite database derived from valid active and archived artifacts.
- `pnpm spec:query` returns indexed project and feature data, and `pnpm spec:validate` detects invalid source
  folders without opening a store for writes.
- A test verifies the exact same store contract against a configurable `file:` URL and a remote-client
  configuration is accepted only with its auth token.
- Re-indexing is deterministic and deletes stale rows after a source artifact is changed, moved, or
  removed.
- Feature artifacts are trackable by Git, while the local store directory and SQLite sidecars are
  ignored.
- Remote credentials are documented but never committed, logged, or needed for local verification.

## Open Questions

None. The first remote target will use a Turso-compatible `libsql:` URL plus a scoped write token.
