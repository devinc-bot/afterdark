# stale-pending-order-cleanup Specification

## Purpose
TBD - created by archiving change cleanup-stale-pending-orders. Update Purpose after archive.
## Requirements
### Requirement: Monthly cleanup of stale pending orders

The system SHALL run a monthly background cleanup on the first day of each month at midnight in the API process timezone. The cleanup MUST permanently delete orders whose status is `pending` and whose creation timestamp is strictly before the first day of the preceding calendar month. It MUST NOT delete orders in any other status.

#### Scenario: Delete an order older than the calendar-month cutoff
- **GIVEN** the cleanup runs on 1 September at midnight
- **AND** a pending order was created before 1 August
- **WHEN** the cleanup executes
- **THEN** the order is permanently deleted

#### Scenario: Retain a pending order at the calendar-month cutoff
- **GIVEN** the cleanup runs on 1 September at midnight
- **AND** a pending order was created on or after 1 August
- **WHEN** the cleanup executes
- **THEN** the order remains stored

#### Scenario: Retain a non-pending order older than the cutoff
- **GIVEN** a completed, rejected, or cancelled order was created before the calendar-month cutoff
- **WHEN** the cleanup executes
- **THEN** the order remains stored

#### Scenario: Report a cleanup failure
- **GIVEN** the pending-order deletion fails unexpectedly
- **WHEN** the monthly cleanup executes
- **THEN** the system logs the failure and the API process remains available

