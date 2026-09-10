## Context

The dashboard event form currently collects `startsAt` and `endsAt`, then shared Zod contracts pass both timestamps through the API mapper and DB repositories. The events table stores both timestamps, while API and public response DTOs expose them. Creation and editing use the same dashboard form, so both flows must adopt the new scheduling input.

## Goals / Non-Goals

**Goals:**

- Collect a sanitized numeric duration in the owner dashboard for event creation and editing.
- Validate the duration once in `@repo/validators` and share its type with API consumers.
- Calculate `endsAt` at the API boundary before persistence.
- Keep persisted and response scheduling timestamps unchanged.

**Non-Goals:**

- Store duration in the database or expose it in event responses.
- Change public event listings, details, ticket schedules, or database migrations.
- Support arbitrary duration values.

## Decisions

### Use `durationHours` in upsert contracts

Create and update contracts will replace `endsAt` with a required `durationHours` value. The validator will own the permitted numeric range and half-hour increment so the dashboard input and API use the same source of truth.

The alternative of retaining optional `endsAt` would leave two conflicting scheduling inputs and allow clients to bypass duration validation. A dedicated database column is unnecessary because `endsAt` already supports existing queries and response contracts.

### Calculate `endsAt` in the event API mapper

`toEventUpsertInput` will add the selected number of hours to `startsAt` and send the resulting `Date` to the existing repository functions. This keeps business input transformation in the API layer, retains repositories as persistence-only code, and requires no schema or migration change.

Calculating in the dashboard would make the client authoritative and would not protect direct API consumers. Calculating in repositories would mix application scheduling logic with data access.

### Derive the edit form duration from persisted timestamps

When editing, the form mapper will derive elapsed hours from the stored start and end timestamps. Values represented by the shared duration validator prepopulate the input. A historical event with a duration outside the supported range or increment has no value and must be assigned a valid duration before it can be saved.

The alternative of rounding a historical duration silently changes the event schedule. Retaining an unrestricted fallback conflicts with the shared duration validation.

### Provide localized input labels

Dashboard translation keys will label the duration field and its range hint in English and Spanish. The numeric input replaces the end-date input and its cross-field end-after-start validation.

## Risks / Trade-offs

- Historical durations outside the supported range or increment cannot be saved unchanged through the updated form -> show an empty required duration field rather than modifying the stored schedule silently.
- The request contract is breaking for direct API consumers -> document `durationHours` as the replacement field and reject invalid numeric values through the shared contract.
- Date arithmetic can cross daylight-saving changes -> calculate by elapsed milliseconds from the normalized `Date`, matching the requested hour-based duration.

## Migration Plan

1. Deploy the shared contract, API calculation, and dashboard selector together.
2. No database migration is required because `events.ends_at` remains the stored end timestamp.
3. Roll back by redeploying the previous client and API contract; persisted events remain compatible because their timestamps are unchanged.

## Open Questions

- None.
