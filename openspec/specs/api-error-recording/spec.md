# api-error-recording Specification

## Purpose
TBD - created by archiving change persist-api-errors. Update Purpose after archive.
## Requirements
### Requirement: Eligible API failures are recorded

The API SHALL persist one error record when an HTTP request completes with a status code of 500 or greater. The record SHALL include the request method, request path without query parameters, status code, error name, sanitized error message, occurrence timestamp, and sanitized stack trace when available.

#### Scenario: Unknown exception becomes a recorded internal failure

- **GIVEN** an API request handler throws an unexpected exception
- **WHEN** the global exception boundary handles the exception as an HTTP 500 response
- **THEN** the system persists one sanitized error record for that request
- **AND** the client receives the existing internal-error response shape

#### Scenario: Explicit server HTTP exception is recorded

- **GIVEN** an API request handler throws an `HttpException` with a status code of 500 or greater
- **WHEN** the global exception boundary handles the exception
- **THEN** the system persists one sanitized error record with that status code
- **AND** the client receives the same response shape it received before this capability

### Requirement: Expected client failures are excluded

The API SHALL NOT persist error records for HTTP responses with status codes below 500.

#### Scenario: Client error is not recorded

- **GIVEN** an API request results in an HTTP 4xx exception
- **WHEN** the global exception boundary returns the response
- **THEN** no API error record is created for that request

### Requirement: Persisted diagnostics minimize sensitive data

The API SHALL build error records only from an explicit allowlist of diagnostic fields. It SHALL exclude request and response bodies, query parameters, headers, cookies, credentials, authentication tokens, and custom user metadata. Persisted text SHALL be bounded and scrubbed for supported credential patterns.

#### Scenario: Request contains sensitive input

- **GIVEN** a failing request contains query parameters, authorization headers, cookies, and a request body
- **WHEN** the API records the resulting 5xx failure
- **THEN** none of those request values are included in the persisted record
- **AND** the stored path contains no query string

#### Scenario: Error text exceeds storage limits

- **GIVEN** a 5xx exception has an oversized message or stack trace
- **WHEN** the API records the failure
- **THEN** the persisted text is scrubbed and truncated to the configured bounds

### Requirement: Error recording does not replace API behavior

The API SHALL treat error persistence as best-effort. A failure to persist an eligible record SHALL NOT change the original HTTP status or response body, and SHALL be emitted to the application logger without retrying the insert in the request path.

#### Scenario: Error record insert fails

- **GIVEN** an API request results in an eligible 5xx failure
- **AND** the error-record repository cannot persist the record
- **WHEN** the global exception boundary completes handling the failure
- **THEN** the client receives the original status and response body
- **AND** the recording failure is written to the application logger
- **AND** the request path performs no insert retry

### Requirement: Error records expire after 30 days

The API SHALL run retention cleanup daily and delete API error records older than 30 days. A cleanup failure SHALL NOT affect API availability and SHALL be emitted to the application logger.

#### Scenario: Daily cleanup removes expired records

- **GIVEN** API error records exist both before and after the 30-day cutoff
- **WHEN** the daily retention cleanup runs
- **THEN** records older than the cutoff are deleted
- **AND** records at or newer than the cutoff remain

#### Scenario: Daily cleanup fails

- **GIVEN** the repository cannot delete expired API error records
- **WHEN** the daily retention cleanup runs
- **THEN** the scheduler records the cleanup failure in the application logger
- **AND** the API continues serving requests

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

