## 1. Shared Validation

- [x] 1.1 Define the event-duration range, input field, form fields, and parsing tests in `@repo/validators`.

## 2. API Scheduling

- [x] 2.1 Replace `endsAt` request input with `durationHours` in event upsert mapping and calculate the persisted end timestamp, with mapper and API flow tests.

## 3. Dashboard Event Form

- [x] 3.1 Replace the end-date control with the sanitized duration input in the shared event create/edit form and update its validation and dirty-state handling.
- [x] 3.2 Derive editable duration values from existing event timestamps and update event submission serialization, with mapper tests for valid and legacy schedules.

## 4. Localized Copy and Verification

- [x] 4.1 Add English and Spanish duration labels and hints, then run focused tests, `pnpm type-check`, `pnpm lint`, and `pnpm format:check`.
