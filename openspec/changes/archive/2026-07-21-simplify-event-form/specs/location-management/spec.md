## ADDED Requirements

### Requirement: Location entity has no type attribute

A location SHALL NOT have a `type` (permanent/temporary) attribute. The attribute SHALL be absent from the database schema, domain/DTO types, repository inputs, API responses, and validation schemas.

#### Scenario: Creating a location without a type

- **WHEN** the API creates a location from a valid request
- **THEN** the location is persisted without a `type` attribute and the response contains no `type` field

#### Scenario: Fetching locations excludes type

- **WHEN** the dashboard fetches the owner's locations
- **THEN** each returned location contains no `type` field

#### Scenario: Location validation has no type rule

- **WHEN** validating a location create or update payload
- **THEN** the schema neither requires nor accepts a `type` field

## REMOVED Requirements

### Requirement: Location type attribute

**Reason**: The `type` (permanent/temporary) attribute was never exposed in any UI and was hardcoded by the API (always `permanent` on create, preserved on update), providing no value.

**Migration**: A drizzle-kit migration drops the `type` column from the `locations` table. Consumers that referenced `LocationResponse.type` or `LocationUpsertInput.type` must remove those references; there is no replacement field.
