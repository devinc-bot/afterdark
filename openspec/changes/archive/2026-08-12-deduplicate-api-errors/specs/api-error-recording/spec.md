## ADDED Requirements

### Requirement: Equivalent API failures are suppressed briefly

The API SHALL persist at most one API error record for equivalent eligible failures during a five-minute window. Equivalence SHALL use the sanitized request method, path, status code, error name, message, and stack trace. The correlation ID SHALL NOT participate in equivalence.

#### Scenario: Equivalent failure repeats within five minutes

- **GIVEN** an eligible API failure has already been persisted within the preceding five minutes
- **WHEN** an eligible failure with the same sanitized method, path, status code, error name, message, and stack trace occurs
- **THEN** the system SHALL NOT create an additional API error record
- **AND** the HTTP response SHALL remain unchanged

#### Scenario: Equivalent failure occurs after the window

- **GIVEN** an eligible API failure was persisted more than five minutes ago
- **WHEN** an equivalent eligible failure occurs
- **THEN** the system SHALL persist a new API error record

#### Scenario: Failure differs in diagnostic content

- **GIVEN** an eligible API failure has already been persisted within the preceding five minutes
- **WHEN** another eligible failure differs in at least one of method, path, status code, error name, message, or stack trace after sanitization
- **THEN** the system SHALL persist a new API error record
