## REMOVED Requirements

### Requirement: Existing sold-ticket fields store usage state

**Reason**: The scanned-ticket history feature now records the scanning operator, which requires new columns on `tickets_sold`.

**Migration**: The implementation continues to reuse `tickets_sold.qr_code`, `tickets_sold.checked_in`, and `tickets_sold.used_at`; two new nullable columns (`checked_in_by_account_id` and `checked_in_by_role`) are added via a timestamp-prefixed migration.

## ADDED Requirements

### Requirement: A successful scan records operator identity

The implementation SHALL reuse `tickets_sold.qr_code`, `tickets_sold.checked_in`, and `tickets_sold.used_at`, and SHALL additionally record the scanning operator's account id and role on the sold-ticket row when a scan succeeds.

#### Scenario: Successful scan persists consumption and operator

- **GIVEN** a valid unused ticket
- **WHEN** an authorized operator's scan succeeds
- **THEN** `checked_in` becomes true, `used_at` stores the server timestamp, and the operator's account id and role are stored on the sold-ticket row

#### Scenario: Operator identity is optional for legacy rows

- **GIVEN** a sold ticket scanned before operator tracking existed
- **WHEN** its row is read
- **THEN** the operator account id and role are null without affecting the stored consumption state
