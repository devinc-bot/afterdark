# Local Spec Store Tasks

Complete one independently reviewable task at a time. Mark a task complete only after its listed
verification passes.

## Package and Validation

- [ ] **T1. Create the isolated spec-store package, projects table, and source validator**
  - Add the private `@repo/spec-store` workspace with exact dependencies and package-local `tsx`.
  - Add tests first for idempotent schema initialization and the initial `Lumina` project record.
  - Create the `projects` table and initialize its stable `lumina` record with the display name `Lumina`.
  - Add tests first for active/archive discovery, valid folder naming, required artifact files, and
    actionable invalid-source errors.
  - Implement repository-root resolution that does not depend on the caller's working directory.
  - Add the read-only `spec:validate` root command.
  - Verify validation from the root and from a workspace subdirectory without creating a database.

## Storage

- [ ] **T2. Add the local libSQL store and atomic indexing**
  - Add tests first for schema creation, a local `file:` URL without credentials, deterministic
    re-indexing, and stale-row removal after source changes, moves, and deletion.
  - Add the `@libsql/client` storage adapter and idempotent schema initialization.
  - Associate every feature with the `Lumina` project and persist its identity, location, complete
    artifact content, content hashes, and index time.
  - Validate all source artifacts before a single replace-all write transaction.
  - Make the default `file:` URL repository-root-relative and add `spec/.local/` to `.gitignore`.
  - Verify a deleted local SQLite file is regenerated from the Markdown source tree at the same path
    from root and nested workspace commands.

## CLI Querying

- [ ] **T3. Expose index and query commands**
  - Add tests first for feature lookup, metadata listing, JSON output, and read-only query behavior.
  - Add root `spec:index` and `spec:query` wrappers with package-scoped CLI commands.
  - Ensure errors use stderr, output never exposes tokens, and CLI parsing remains separate from the
    store service.
  - Verify commands from root and nested workspace directories.

## Turso Readiness

- [ ] **T4. Add explicit Turso/libSQL connection configuration**
  - Add tests first that a local `file:` URL requires no token and a non-file URL fails before a client
    or transaction when `SPEC_STORE_AUTH_TOKEN` is absent.
  - Support `SPEC_STORE_URL` and the explicit `--url` override, defaulting to the local `file:` URL.
  - Support `SPEC_STORE_AUTH_TOKEN` only from the environment and pass it only to a non-file client.
  - Verify the same storage service accepts an injected remote client configuration without contacting
    Turso in tests.
  - Redact the whole remote URL and token from every diagnostic and command output.
  - Document the future `libsql:` URL and scoped-token setup without adding provider credentials.

## Documentation and Verification

- [ ] **T5. Document the derived store and verify the feature**
  - Document Markdown as canonical, the local index location, command usage, rebuild behavior, and the
    explicit future Turso configuration.
  - Remove the Git ignore rules for active and archived feature artifacts while retaining the local
    store ignore rule so canonical Markdown is reviewable and recoverable.
  - Clarify that this feature neither starts an MCP server nor performs automatic cloud sync.
  - Run package tests, `pnpm type-check`, `pnpm lint`, `pnpm format:check`, and `git diff --check`.
  - Confirm no SQLite artifact, URL, token, or generated database is tracked by Git.
