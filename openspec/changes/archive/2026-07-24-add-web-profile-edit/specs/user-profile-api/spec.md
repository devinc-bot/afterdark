# user-profile-api — Delta Spec

## ADDED Requirements

### Requirement: Authenticated user can read own profile via settings

The API SHALL allow an authenticated user with role `USER` to call `GET /settings` and receive their basic profile (name, lastName, phone, email, avatar). The endpoint MUST require a valid JWT. OWNER and STAFF behavior on `GET /settings` MUST remain unchanged. The response for `USER` MUST be a `CurrentUserResponse` (included in the `SettingsResponse` union).

#### Scenario: Read own profile

- **GIVEN** an authenticated user with role `USER`
- **WHEN** they request `GET /settings`
- **THEN** the response contains their name, lastName, phone, email, and avatar with `role: USER`

#### Scenario: Unauthenticated request

- **GIVEN** a request without a valid JWT
- **WHEN** it hits `GET /settings`
- **THEN** the API responds 401 Unauthorized

### Requirement: Authenticated user can update own basic profile via settings

The API SHALL allow an authenticated `USER` to call `PATCH /settings` to update name, lastName, and phone. Request bodies MUST be validated with `updateCurrentUserProfileSchema` from `@repo/validators`. Email, avatar, role, and status MUST NOT be updatable through this endpoint. The update SHALL be persisted via a repository function in `@repo/db`. OWNER and STAFF `PATCH /settings` behavior MUST remain unchanged.

#### Scenario: Successful update

- **GIVEN** an authenticated user with role `USER`
- **WHEN** they send `PATCH /settings` with a valid body (e.g. new name and phone)
- **THEN** the changes are persisted and the response returns the updated `CurrentUserResponse`

#### Scenario: Invalid body

- **GIVEN** an authenticated user with role `USER`
- **WHEN** they send `PATCH /settings` with a body that fails `updateCurrentUserProfileSchema`
- **THEN** the API responds 400 with validation errors and nothing is persisted

#### Scenario: Disallowed fields ignored or rejected

- **GIVEN** an authenticated user with role `USER`
- **WHEN** they send `PATCH /settings` including fields outside the schema (e.g. email, role)
- **THEN** those fields are not persisted
