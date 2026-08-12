## Why

Unexpected API failures are currently visible only in process logs, which makes incidents difficult to investigate after the fact. Persisting a small, sanitized diagnostic record supports reliable operations without introducing an external observability service in the first iteration.

## What Changes

- Persist unexpected API failures that produce HTTP 5xx responses in a dedicated database table.
- Capture diagnostic context needed for investigation, including timestamp, request method and path, status code, error name, message, stack trace, and a request correlation identifier when available.
- Sanitize records by excluding request and response bodies, headers, credentials, tokens, cookies, and direct personal data.
- Treat recording as best-effort so a persistence failure does not replace the original API response.
- Automatically delete records older than 30 days.
- Keep initial access operational through Turso or Drizzle Studio only.

## Capabilities

### New Capabilities

- `api-error-recording`: Capture, sanitize, persist, and expire unexpected API error records.

### Modified Capabilities

None.

## Non-goals

- Recording expected client errors or other HTTP 4xx responses.
- Capturing frontend errors from `web` or `dashboard`.
- Providing an API endpoint or dashboard UI to list, inspect, acknowledge, or resolve errors.
- Storing request bodies, response bodies, headers, authentication data, or user-provided metadata.
- Replacing application logs or integrating an external monitoring, alerting, tracing, or error-reporting vendor.
- Aggregating duplicate errors or sending notifications.

## Impact

- `apps/api`: Extend global exception handling and add scheduled retention cleanup.
- `packages/db`: Add the error-record schema, indexes, repository functions, and a timestamp-prefixed Drizzle migration.
- `apps/web`, `apps/dashboard`, `packages/ui`, `packages/validators`, `packages/types`, `packages/common`, and `packages/i18n`: No changes expected.
- API contracts: Existing error response shapes remain unchanged; no new public endpoint is introduced.
- Dependencies: No new runtime dependency is expected.
