## Why

Date, currency, number, and localized date-input formatting is repeated across the web app, dashboard, and shared UI. The duplicated implementations can drift in locale fallback, invalid-value handling, and display options as customer-facing event and payment surfaces evolve.

## What Changes

- Add reusable date, date-time, localized date-input, number, currency, and date-range formatters to `@repo/common/src/lib`.
- Replace equivalent local `Intl` formatter implementations in the identified web, dashboard, and shared UI consumers.
- Preserve each consumer's existing locale, currency, display options, invalid-value fallback, and date-only semantics.
- **BREAKING:** Remove local formatter exports only where they are internal implementation details and no longer required by their module.

### Non-goals

- Changing the product's supported locales, default locale, currency, timezone policy, or date presentation.
- Adding i18n copy, new visual UI states, or changing API/DB payload formats.
- Consolidating unrelated string, label, identifier, or avatar formatting helpers.

## Capabilities

### New Capabilities

- `shared-data-formatters`: Stable shared utilities for consistent presentation of dates, numbers, currencies, date ranges, and native date-input values.

### Modified Capabilities

- None.

## Impact

- **Apps:** `apps/web` and `apps/dashboard` replace duplicated formatter implementations.
- **Packages:** `packages/common` gains the utilities; `packages/ui` consumes shared date-input formatting.
- **Unaffected:** `apps/api`, `packages/db`, `packages/validators`, and `packages/i18n` behavior remains unchanged.
