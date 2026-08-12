## Why

Repeated identical 5xx failures can create a large number of operational records without adding diagnostic value. Suppressing matching failures during a short window keeps the error table actionable and bounded.

## What Changes

- Suppress persistence of an API error record when an equivalent record already exists from the preceding five minutes.
- Define equivalence using sanitized request method, path, status code, error name, message, and stack trace.
- Keep correlation IDs out of equivalence so a recurring failure is not duplicated solely because each request has a different identifier.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `api-error-recording`: Avoid repeated persistence of equivalent eligible failures inside the configured five-minute window.

## Non-goals

- Aggregating counts or updating existing records when a duplicate is suppressed.
- Deduplicating failures that differ in the configured diagnostic fields.
- Changing 5xx HTTP responses, external alerting, or retention behavior.
- Adding a dashboard or API endpoint for error records.

## Impact

- `packages/db`: Add a repository operation that detects a recent equivalent record and inserts only when absent.
- `apps/api`: Use the deduplicating repository operation through the existing recorder service.
- `apps/web`, `apps/dashboard`, `packages/ui`, `packages/validators`, `packages/types`, `packages/common`, and `packages/i18n`: No changes expected.
- API contracts and runtime dependencies: No changes expected.
