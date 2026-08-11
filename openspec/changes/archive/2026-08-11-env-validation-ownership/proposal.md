## Why

Environment schemas are currently grouped in `@repo/validators` regardless of which application owns their credentials and deployment configuration. Moving application-specific validation next to its owner makes configuration boundaries explicit and avoids exposing server-only contracts through a shared package.

## What Changes

- Move API-only environment schemas for Google OAuth, mail, uploads, and Mercado Pago into `apps/api`.
- Move each client application's environment schema into `apps/web` and `apps/dashboard`, respectively.
- Retain only shared environment contracts in `@repo/validators/src/env`: database configuration used by API and `@repo/db`, and `VITE_API_URL` used by both browser applications.
- Remove obsolete environment schema exports and package dependencies after consumers migrate.

## Capabilities

### New Capabilities

- `environment-validation-ownership`: Application-owned environment validation with explicitly shared schemas.

### Modified Capabilities

- None.

## Impact

- **Apps:** `apps/api`, `apps/web`, and `apps/dashboard` own their specific schemas and validation entrypoints.
- **Packages:** `packages/validators` retains shared schemas only; `packages/db` continues consuming the shared database schema.
- **Not affected:** `packages/ui`, `packages/i18n`, domain validators, APIs, database schema, and runtime environment variable names.

## Non-goals

- Changing environment variable names, defaults, validation semantics, or deployment configuration.
- Moving database validation from `@repo/validators`, since `@repo/db` consumes it outside a single application.
- Introducing a new environment-loading library or altering client/server build tooling.
