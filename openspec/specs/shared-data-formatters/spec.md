# shared-data-formatters Specification

## Purpose
TBD - created by archiving change centralize-data-formatters. Update Purpose after archive.
## Requirements
### Requirement: Shared primitive data formatting

`@repo/common` SHALL export pure utilities for localized date, number, currency, and date-range presentation. Utilities MUST accept caller-provided locale and native `Intl` display options, and MUST allow an invalid or absent input fallback without throwing during UI rendering.

#### Scenario: Localized currency presentation

- **GIVEN** a caller supplies an amount, locale, currency, and fraction-digit options
- **WHEN** it formats the amount through `@repo/common`
- **THEN** the returned value matches `Intl.NumberFormat` with those options

#### Scenario: Invalid date presentation

- **GIVEN** a caller supplies an absent or invalid date and a fallback value
- **WHEN** it formats the date through `@repo/common`
- **THEN** the formatter returns the fallback and does not throw

### Requirement: Date-only input presentation preserves calendar day

`@repo/common` SHALL provide localized presentation for ISO date-only input values. The formatter MUST interpret a valid `YYYY-MM-DD` value as a local calendar date and MUST return the original value or caller fallback when it is invalid.

#### Scenario: Localized ISO date input

- **GIVEN** an ISO date-only value and a supported locale
- **WHEN** a shared UI date input renders its visible value
- **THEN** it displays the same calendar day in the locale's numeric date order

#### Scenario: Invalid ISO date input

- **GIVEN** an invalid ISO date-only value
- **WHEN** a shared UI date input renders its visible value
- **THEN** it preserves the original value rather than throwing or shifting the date

### Requirement: Existing consumers retain presentation policies

The dashboard, web event detail, and shared date input SHALL use the shared formatters for equivalent primitive formatting while preserving their current locale, display options, and fallback behavior.

#### Scenario: Compact event date remains compact

- **GIVEN** a public event with a valid start date
- **WHEN** the event detail renders its compact purchase-panel date
- **THEN** the displayed weekday, day, month, and time remain in the current compact format for the active locale

