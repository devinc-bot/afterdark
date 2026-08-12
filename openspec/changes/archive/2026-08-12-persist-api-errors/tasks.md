## 1. Database Model

- [x] 1.1 Add and export the `api_error_records` Drizzle schema with bounded diagnostic fields and a `created_at` retention index; add focused schema/type checks and pass package lint and format checks.
- [x] 1.2 Generate and review the timestamp-prefixed Drizzle migration that creates `api_error_records` and its index; verify the migration applies to a clean development database.

## 2. Database Access

- [x] 2.1 Add and export `@repo/db` repository functions to insert a sanitized API error record and delete records older than a supplied cutoff; cover insertion and cutoff behavior with repository tests and pass package checks.

## 3. API Capture

- [x] 3.1 Add the API error-recording service that allowlists context, removes query strings, scrubs supported credential patterns, and truncates message and stack fields; cover sanitization boundaries with unit tests and pass API lint and format checks.
- [x] 3.2 Replace the manually constructed HTTP-only filter with a dependency-injected global catch-all filter that records only 5xx failures, preserves existing error responses, and degrades safely when persistence fails; cover unknown errors, explicit 5xx, excluded 4xx, and insert failures with unit tests.

## 4. Retention

- [x] 4.1 Add and register a daily scheduler that deletes API error records older than 30 days and logs cleanup failures without affecting availability; cover cutoff and failure behavior with unit tests.

## 5. Verification And Documentation

- [x] 5.1 Update `packages/db/DATABASE.md` for the new operational table and repository, then run targeted tests, `pnpm type-check`, `pnpm lint`, and `pnpm format:check`.
