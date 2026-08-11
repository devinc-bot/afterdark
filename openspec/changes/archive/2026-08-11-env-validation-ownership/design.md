## Context

`@repo/validators/src/env` currently exports database, client, Google OAuth, mail, upload, and Mercado Pago schemas. Only database configuration is consumed outside an application by `@repo/db`; `VITE_API_URL` is shared by both browser applications. All other values are owned by a single deployment surface.

## Goals / Non-Goals

**Goals:**

- Keep shared environment validation contracts in `@repo/validators`.
- Co-locate API-only schemas with API configuration.
- Give web and dashboard independent client schemas while sharing their API URL contract.
- Preserve all current variable names, defaults, and validation behavior.

**Non-Goals:**

- Change environment values, deployment files, or runtime loading behavior.
- Move database validation from the shared package.
- Add migrations, API endpoints, UI copy, or dependencies.

## Decisions

### 1. Shared schemas remain minimal

- **Choice:** `packages/validators/src/env` retains the database schema and a shared `VITE_API_URL` schema. The client-specific dashboard URL is removed from the shared schema.
- **Why:** API and `@repo/db` both require database validation; web and dashboard both require the API origin. No other environment value has multiple consumers.
- **Alternative:** Duplicate `VITE_API_URL` in each client app. Rejected because the validation contract is identical and intentionally shared.

### 2. API schemas live next to API configuration

- **Choice:** Google OAuth, mail, upload, Mercado Pago, and API URL schemas move to an API-local environment-schema module used by `apps/api/src/modules/common/config/env.ts`.
- **Why:** These values are server-only secrets or integration configuration, and the API is their sole runtime consumer.
- **Alternative:** Keep them in `@repo/validators`. Rejected because it makes a shared package appear to own application deployment configuration.

### 3. Client schemas are app-local compositions

- **Choice:** Web and dashboard each define their own schema in `app/config/env.ts`, extending the shared API URL contract only when they need app-specific values.
- **Why:** This keeps Vite-visible variables constrained to the app that consumes them and preserves per-app TypeScript declarations.
- **Alternative:** One shared client schema with optional fields. Rejected because optional fields hide deployment mistakes and blur ownership.

## Risks / Trade-offs

- **[Risk] Stale imports after files move** -> Mitigation: remove the old exports and run type-checks for validators, db, API, web, and dashboard.
- **[Risk] Subtle validation drift while relocating schemas** -> Mitigation: retain field definitions and defaults verbatim; add focused schema tests if existing coverage is insufficient.

## Migration Plan

1. Reduce the shared env exports to database and common client API URL validation.
2. Move API-only schema definitions into `apps/api` and update its composite environment parser.
3. Define web and dashboard local schemas and update their environment parsers.
4. Remove obsolete shared files and exports.
5. Run type, lint, format, and relevant app builds. Rollback consists of restoring the original imports and shared schemas; no persisted data changes.

## Open Questions

- None.
