## 1. Shared formatter utilities

- [x] 1.1 Add and export pure date, number, currency, date-range, and ISO date-input formatters from `@repo/common/src/lib` with explicit options and invalid-value fallbacks.
- [x] 1.2 Add focused tests for locale options, fallback behavior, and date-only calendar preservation.

## 2. Consumer migration

- [x] 2.1 Migrate duplicated dashboard event, owner, sales, staff, and ticket formatter implementations to `@repo/common` while preserving output options.
- [x] 2.2 Migrate public web event formatter implementations and the shared `DateInput` to `@repo/common` while preserving locale and fallback behavior.

## 3. Verification

- [x] 3.1 Run package type-checks, formatter tests, `pnpm lint`, `pnpm format:check`, and `pnpm check:i18n`.
