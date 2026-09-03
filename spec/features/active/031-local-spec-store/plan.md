# Local Spec Store Plan

## Architecture

Create a private workspace package at `packages/spec-store` rather than adding this developer tool to
`@repo/db`. The existing database package is the API's Neon/PostgreSQL persistence layer; the spec
store is a local, derived developer index with a separate lifecycle.

```text
Markdown under spec/features/
Project: Lumina
        |
        v
feature scanner + parser
        |
        v
SpecStore service ---- @libsql/client ---- file:spec/.local/spec-store.sqlite
                                           libsql://<future Turso database>
        ^
        |
CLI commands now; MCP adapter later
```

The package separates source discovery, Markdown parsing, storage, and command parsing:

```text
packages/spec-store/src/
  constants.ts
  feature-scanner.ts
  feature-parser.ts
  store.ts
  cli.ts
```

`store.ts` owns the database schema, transactions, and query contract. The CLI maps arguments and
environment values into that contract. A future stdio MCP server can call the same `store.ts` methods
without inheriting CLI concerns.

## Database Connectivity

Use the exact pinned `@libsql/client` dependency. It supports the required local `file:` URL and the
future Turso-compatible `libsql:` URL through the same client API.

The connection configuration is intentionally small:

| Setting                 | Local default                                          | Future Turso value                            |
| ----------------------- | ------------------------------------------------------ | --------------------------------------------- |
| `SPEC_STORE_URL`        | `file:<repository-root>/spec/.local/spec-store.sqlite` | `libsql://<database>-<organization>.turso.io` |
| `SPEC_STORE_AUTH_TOKEN` | unset                                                  | scoped Turso write token                      |

The URL may also be supplied as the explicit `--url` option for automation. The default local URL is
constructed from the resolved repository root, never the caller's current directory. The token is
environment only, never accepted as a positional argument and never printed. A `file:` URL ignores an
auth token. For a non-file URL, validate that `SPEC_STORE_AUTH_TOKEN` exists before connecting or
changing any store. The code must not infer a remote endpoint from a URL alone and must not add
background sync. Diagnostics and command output must redact the entire configured remote URL as well
as the token.

The package uses direct SQL through the client, not Drizzle. This avoids mixing a local derived index
into the repository's PostgreSQL-only Drizzle architecture and keeps the schema portable to Turso.

## Data Model

Create the schema idempotently:

```text
projects
  project_key       TEXT PRIMARY KEY    # lumina
  name              TEXT NOT NULL       # Lumina
  created_at        TEXT NOT NULL       # ISO 8601 UTC
  updated_at        TEXT NOT NULL       # ISO 8601 UTC

features
  feature_key       TEXT PRIMARY KEY    # NNN-slug
  project_key       TEXT NOT NULL REFERENCES projects(project_key)
  number            INTEGER NOT NULL
  slug              TEXT NOT NULL
  location          TEXT NOT NULL       # active | archive
  spec_content      TEXT NOT NULL
  plan_content      TEXT NOT NULL
  tasks_content     TEXT NOT NULL
  spec_hash         TEXT NOT NULL
  plan_hash         TEXT NOT NULL
  tasks_hash        TEXT NOT NULL
  indexed_at        TEXT NOT NULL       # ISO 8601 UTC
```

Schema initialization idempotently inserts the project key `lumina` with the display name `Lumina`.
Every indexed feature references that project key; the foreign key makes an unassociated feature
impossible in the derived store. Multiple projects are deliberately deferred, but the normalized
relationship preserves a migration path without rewriting feature records.

The initial table stores full Markdown content because the CLI needs to retrieve whole artifacts and
the input formats are not uniform enough to normalize safely. Feature number and slug derive from the
folder name, not a mutable Markdown heading. `location` derives from its parent directory. Hashes use
SHA-256 over the exact UTF-8 artifact content.

Do not persist requirements, task completion, or heading sections separately in this iteration. Those
can be added only after query use cases require stable semantic parsing.

## Indexing Contract

The scanner reads both `spec/features/active/` and `spec/features/archive/`, ignoring `.gitkeep` and
other non-feature entries. A valid feature directory must match `NNN-kebab-case` and contain exactly
the three required Markdown artifacts. The parser reads their UTF-8 contents without mutating them.

`index` validates the complete source set before opening a write transaction. Within one write
transaction it creates the `Lumina` project when absent and replaces its indexed features with the
validated source snapshot. Replace-all semantics make repeated runs deterministic and remove records
for deleted or moved feature folders. A failure before commit preserves the previous index. The remote
and local target use the same algorithm; they are independent replicas, not synchronized peers.

`validate` performs the scanner and source validation only. `query` opens the selected target and
returns machine-readable JSON for a feature by key or a list of feature metadata. It never writes to
the database or source Markdown.

## CLI Contract

Expose thin root wrappers:

```text
pnpm spec:validate
pnpm spec:index
pnpm spec:query -- <feature-key>
```

Root wrappers call `pnpm --filter @repo/spec-store`. The package command uses `tsx` declared in its
own development dependencies because isolated pnpm linking forbids relying on another workspace's
binary. CLI command names and output fields stay in English. Errors go to stderr, use paths and
actionable remediation, and never include token values.

Examples of future remote use:

```bash
SPEC_STORE_URL=libsql://example-org.turso.io SPEC_STORE_AUTH_TOKEN=... pnpm spec:index
SPEC_STORE_URL=libsql://example-org.turso.io SPEC_STORE_AUTH_TOKEN=... pnpm spec:query -- 031-local-spec-store
```

These are documentation examples only. No Turso account, URL, or token is added during this feature.
Use a scoped token and rotate it according to the provider's operational policy.

## File and Git Policy

Place the default database under `spec/.local/` and add one directory-level `.gitignore` rule so the
database, WAL, SHM, journal, and future local metadata remain untracked. Do not commit a blank
database. Remove the current ignore rules that exclude active and archived feature artifacts, retaining
only ignore rules for derived local data. This makes canonical Markdown visible to Git, pull-request
review, and recovery while keeping the SQLite index local.

## Test Strategy

Use the repository's current Node test pattern for the new package, and migrate it to the planned
Vitest runner when feature 030 is applied. Test the service before implementation:

1. Schema initialization creates exactly one `Lumina` project record and is idempotent.
2. A valid fixture tree indexes both active and archived features under `Lumina`.
3. Incomplete directories, malformed names, duplicate keys, and invalid UTF-8 fail validation before
   a write occurs.
4. A second index run returns the same project and feature data.
5. Changing, moving, or removing fixtures replaces stale records.
6. A deleted local database is recreated from Markdown.
7. `file:` configuration needs no token.
8. A non-file URL without a token fails before client creation or a write transaction.
9. Query returns metadata and complete artifacts without source mutation.
10. Commands run from a workspace subdirectory use the same repository-root local database.
11. Diagnostics redact both remote URLs and auth tokens.

Use temporary directories and a temporary local `file:` database in tests. Do not call Turso in unit
tests. Validate the remote configuration contract with a fake client or connection factory.

## Affected Areas

| Path                           | Planned change                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `packages/spec-store/`         | New private CLI package, parser, store, tests, and TypeScript configuration           |
| `package.json`                 | Root `spec:validate`, `spec:index`, and `spec:query` wrappers                         |
| `pnpm-lock.yaml`               | Pin `@libsql/client`, `tsx`, and required transitive dependencies                     |
| `.gitignore`                   | Track canonical feature artifacts and ignore `spec/.local/` including SQLite sidecars |
| `spec/README.md`               | Document the canonical Markdown and derived-index workflow plus local commands        |
| `spec/constitution/roadmap.md` | Register this infrastructure feature and its relationship to future MCP work          |

## Risks

| Risk                                              | Mitigation                                                                          |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Markdown formats vary                             | Parse folder identity only; persist artifact contents unchanged                     |
| Index contains stale data                         | Validate first, then replace all rows atomically                                    |
| Network fails during remote index                 | Use one transaction and preserve the remote store until commit                      |
| Turso URL is configured without token             | Reject before opening a client or write transaction                                 |
| Remote configuration leaks in diagnostics         | Treat tokens as write-only configuration and redact every remote URL and token      |
| Local database sidecars appear in Git             | Ignore the containing `spec/.local/` directory                                      |
| Native SQLite dependencies complicate pnpm builds | Use `@libsql/client`, avoiding `better-sqlite3` and `sqlite3` native build approval |
| Tool gets coupled to production persistence       | Keep it out of `@repo/db`, API modules, and deployment assets                       |
| Future MCP duplicates behavior                    | Preserve a narrow exported store service independent of CLI parsing                 |
