## Context

The API currently registers an `HttpExceptionFilter` in `main.ts`. It normalizes expected NestJS HTTP exceptions but does not catch unknown exceptions or persist diagnostics. Some use cases and schedulers also write through NestJS `Logger`, while frontend route error boundaries only render fallback UI.

The first iteration is intentionally limited to server-side failures that result in HTTP 5xx responses. Operators will inspect records through Turso or Drizzle Studio, and records expire after 30 days. The solution must preserve existing HTTP error response shapes and must not turn observability failures into user-facing failures.

## Goals / Non-Goals

**Goals:**

- Capture unexpected HTTP request failures at one global API boundary.
- Persist bounded, sanitized diagnostic data through `@repo/db`.
- Preserve the original status and response contract even if recording fails.
- Remove expired records automatically after 30 days.
- Keep the design small enough to replace or complement with an external observability adapter later.

**Non-Goals:**

- Capture 4xx responses, handled background-job failures, frontend errors, or arbitrary log messages.
- Add querying APIs, dashboard UI, notifications, deduplication, metrics, or distributed tracing.
- Store request or response bodies, headers, cookies, tokens, account identifiers, or custom user metadata.
- Guarantee delivery when the database or process is unavailable.

## Decisions

### Use a dedicated `api_error_records` table

The table will use the repository's base columns and contain only allowlisted fields: HTTP method, normalized request path without query parameters, status code, error name, sanitized message, sanitized stack trace when available, and an optional request correlation ID when one is already present in trusted server context. Text fields will have application-level length limits, and `created_at` will be indexed for retention deletion and operational sorting.

This keeps operational data separate from business entities and avoids an unstructured catch-all log table. A JSON payload was considered but rejected because it encourages accidental collection of sensitive request data and makes the supported diagnostic contract unclear.

### Capture failures in a dependency-injected catch-all exception filter

The existing global filter will become a catch-all filter registered through NestJS dependency injection. It will preserve the current response body for `HttpException` values and produce the established generic 500 response for unknown errors. Only responses with status 500 or greater will be submitted to the recorder.

Central capture was chosen over adding logging calls to each use case because it covers unanticipated failures consistently and avoids duplicated policy. Existing explicit `Logger` calls remain unchanged.

### Persist synchronously on a best-effort basis

For an eligible failure, the filter will await one repository insert inside its own `try/catch`, then send the original error response. If insertion fails, the filter will log that recording failed and still return the original status and response body.

Awaiting the insert was chosen over fire-and-forget persistence because process shutdown and serverless execution can drop detached work. The trade-off is one database write of added latency on 5xx responses, which are exceptional paths. No retry is performed to avoid amplifying a database outage.

### Sanitize through an allowlist and bounded text normalization

The recorder will construct rows exclusively from allowlisted server-derived fields. Query strings are removed from paths. Request bodies, response bodies, headers, cookies, and authentication objects are never passed to the repository. Error messages and stack traces are normalized, truncated, and scrubbed for common credential patterns before persistence.

An unrestricted serialized exception was rejected because exceptions can contain provider responses, credentials, and circular or oversized objects. Sanitization reduces risk but does not make the table suitable for deliberate storage of personal data.

### Implement retention as a daily scheduler

A scheduler in the API common infrastructure will call a repository function once per day to delete records whose `created_at` is older than 30 days. Cleanup failures will be logged and will not affect API availability. The existing root `ScheduleModule` supports this without a new dependency.

Automatic deletion was chosen over manual cleanup to bound storage and exposure. A database-native TTL is unavailable in the current SQLite/libSQL model.

### Keep persistence behind `@repo/db`

`packages/db` will own the Drizzle schema and repository functions for inserting and deleting error records. The API filter and scheduler will import only those repository functions. The schema change will be delivered through a generated, timestamp-prefixed Drizzle migration. No i18n keys are required because there is no new UI or response copy.

## Risks / Trade-offs

- [The database may be the cause of the original failure] -> Attempt one insert only, catch recording errors, and preserve the original response.
- [Persisting before responding adds latency to 5xx requests] -> Store one bounded row with no joins or retries and index only the retention field.
- [Messages or stacks may contain unexpected sensitive values] -> Use allowlisted context, scrub common secrets, truncate text, restrict operational access, and expire records after 30 days.
- [Repeated failures can create high write volume] -> Limit capture to 5xx responses and bounded records; deduplication and rate limiting can be added if production volume justifies them.
- [In-database records provide no alerting when the API or database is down] -> Treat this as an investigation MVP; evaluate an external error-monitoring provider for alerting, grouping, releases, and outage-independent delivery later.
- [A cleanup failure allows temporary growth beyond 30 days] -> Log cleanup failures and retry on the next daily run; operators can delete records through DB tooling.

## Migration Plan

1. Add and export the Drizzle schema and repository functions.
2. Generate a timestamp-prefixed migration that creates `api_error_records` and its `created_at` index.
3. Deploy and apply the migration before or together with the API version that writes records.
4. Register the injected global filter and daily cleanup scheduler.
5. Verify one controlled 500 response persists a sanitized row, a 4xx does not, and an insert failure preserves the original response.

Rollback the API filter and scheduler first to stop writes, then drop the table in a forward migration only if removal is required. Keeping the unused table during an application rollback is safe.

## Open Questions

None for this iteration. Frontend capture, an admin viewer, alerting, and external monitoring remain candidates for separate changes after operational usage is evaluated.
