## 1. Domain contracts and validation

- [x] 1.1 Add recurrence cadence, weekday, and cancelled event-status constants and extend shared event DTOs and repository inputs with series metadata.
- [x] 1.2 Extend `@repo/validators` create and multipart event schemas with recurring input, browser timezone, bounded-range, selected-weekday, and generated-occurrence-limit validation; add coverage for these rules.

## 2. Database persistence

- [x] 2.1 Add the `event_series` Drizzle schema, nullable event series/original-start columns, schema exports, and the timestamp-prefixed migration.
- [x] 2.2 Add transactional event-series repositories that persist the series and all inherited occurrence data, plus repository tests for atomic creation and independent event lookup.
- [x] 2.3 Make event image cleanup retain an asset and its storage object while another occurrence remains linked to it.

## 3. API behavior

- [x] 3.1 Implement timezone-aware recurrence date generation from selected weekdays and the source event duration, with tests covering ranges and an overnight duration.
- [x] 3.2 Update the event create use case, mapper, and controller boundary to generate and return a recurring series with concrete occurrences atomically.
- [x] 3.3 Expose series metadata in owner event reads and enforce independent occurrence updates, cancellation, and rejection of deletion for series occurrences.

## 4. Dashboard event management

- [x] 4.1 Extend event form values, defaults, dirty tracking, and multipart serialization for recurring event input and series-aware edit hydration.
- [x] 4.2 Add the recurring checkbox, cadence selector, Monday-through-Sunday controls, required end-date field, and generated-count preview to the dashboard event details form.
- [x] 4.3 Update occurrence edit and list actions to keep edits scoped to one event and offer cancellation instead of deletion for series occurrences.

## 5. Localization and verification

- [x] 5.1 Add English and Spanish event-form and validation translations for recurrence controls, preview, errors, and cancellation states.
- [x] 5.2 Run focused tests, `pnpm type-check`, `pnpm lint`, `pnpm format:check`, and `pnpm openspec validate recurring-event-series --strict`.
