## Context

The dashboard, public web, and shared UI each instantiate `Intl.DateTimeFormat` or `Intl.NumberFormat` for similar date, date-time, currency, number, and native date-input display. These implementations differ only in presentation options and fallback values, but they repeat locale normalization and invalid-date handling.

## Goals / Non-Goals

**Goals:**

- Provide small, tree-shakeable formatter utilities from `@repo/common/src/lib`.
- Preserve existing display output for each migrated call site.
- Make locale, `Intl` options, and invalid-value fallback explicit at the call site.
- Preserve date-only parsing as a local calendar date, not a UTC-shifted timestamp.

**Non-Goals:**

- Changing locale defaults, ARS formatting, timezone semantics, or UI copy.
- Building a global i18n abstraction or replacing `react-i18next`.
- Moving non-presentation utilities such as avatar tone hashing or event address assembly.

## Decisions

### 1. Stateless utilities in `@repo/common/src/lib`

- **Choice:** Add focused named exports for date, number, currency, date range, and ISO date-input presentation. Each accepts a primitive value plus an options object with locale and native `Intl` options.
- **Why:** `@repo/common` is already shared by the web app, dashboard, and UI package, and pure functions avoid provider coupling or mutable formatter caches.
- **Alternative:** A React context or an app-local formatter module was rejected because shared UI cannot depend on either application.

### 2. Caller-owned presentation policy

- **Choice:** Shared functions handle parsing, `Intl`, and invalid input; consumers retain their existing choices for locale, date/time style, currency fraction digits, and fallback string.
- **Why:** A sales table, compact event schedule, and native date input intentionally display the same date differently.
- **Alternative:** One global date/currency presentation style was rejected because it would change existing UI behavior.

### 3. Safe invalid-input behavior

- **Choice:** Formatter options define a fallback value. Date-only formatting parses `YYYY-MM-DD` as local midnight before display.
- **Why:** UI inputs and API data can be missing or malformed; a formatter must not throw during render or change a date because of UTC parsing.

## Risks / Trade-offs

- **[Risk] Subtle output changes from option defaults** -> Mitigation: migrate each cited call site with its current locale and `Intl` options, then type-check and review affected output paths.
- **[Risk] Utility API becomes a dumping ground** -> Mitigation: limit this change to primitive date/number/currency formatting and keep domain-specific composition local.
- **[Trade-off] No formatter cache** -> Native formatter creation remains small at current UI scale; optimize only if profiling identifies it as material.

## Migration Plan

1. Add and export common formatter functions with safe parsing/fallback behavior.
2. Replace cited local formatter implementations in dashboard, web, and shared UI.
3. Remove only private duplicated helpers made redundant by the shared functions.
4. Run package type-checks, i18n parity, lint, and formatting checks.

## Open Questions

- None. Existing callers establish the required locales and display options.
