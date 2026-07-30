## ADDED Requirements

### Requirement: Google userinfo includes picture URL when present

When exchanging a Google authorization code for a profile, the system SHALL map Google userinfo `picture` into an optional picture URL on the internal Google profile payload. When `picture` is missing, empty, or not a usable string, the picture URL MUST be treated as absent (null/undefined). Absence of a picture MUST NOT fail token exchange or profile mapping by itself.

#### Scenario: Picture present on userinfo

- **GIVEN** Google userinfo includes a non-empty `picture` string
- **WHEN** the API exchanges the authorization code for a profile
- **THEN** the internal profile includes that picture URL

#### Scenario: Picture absent on userinfo

- **GIVEN** Google userinfo has no `picture` (or it is empty)
- **WHEN** the API exchanges the authorization code for a profile
- **THEN** the internal profile has no picture URL
- **AND** mapping still succeeds when `sub` and `email` are present

### Requirement: New Google account registration sets profile avatar from picture

When Google OAuth creates a new account (USER or OWNER per OAuth state) and the Google profile includes a picture URL, the system SHALL create an `assets` row with that URL as `url`, image type, and no storage key, and SHALL set the new profile’s `avatar_id` to that asset. When no picture URL is available, registration MUST proceed with `avatar_id` null. Failure to persist the avatar asset MUST NOT fail account creation; the account MAY be created without an avatar.

#### Scenario: Register with Google picture

- **GIVEN** no existing account for the Google subject or email
- **AND** Google profile includes a picture URL
- **WHEN** Google OAuth registration completes
- **THEN** the created profile’s `avatar_id` references an asset whose `url` equals that picture URL
- **AND** subsequent session/profile reads expose that URL as `avatar`

#### Scenario: Register without Google picture

- **GIVEN** no existing account for the Google subject or email
- **AND** Google profile has no picture URL
- **WHEN** Google OAuth registration completes
- **THEN** the created profile has `avatar_id` null
- **AND** registration and session creation still succeed

### Requirement: Google login backfills avatar when profile has none

When an existing Google-linked account signs in via Google OAuth and the linked profile has no avatar (`avatar_id` null) and the Google profile includes a picture URL, the system SHALL create an external picture asset and set that profile’s `avatar_id`. If the profile already has an avatar, the system MUST NOT replace it. Failure to backfill MUST NOT fail login or session issuance.

#### Scenario: Login backfills missing avatar

- **GIVEN** an existing Google-linked USER or OWNER account whose profile `avatar_id` is null
- **AND** Google profile includes a picture URL
- **WHEN** Google OAuth login completes
- **THEN** the profile’s `avatar_id` references an asset whose `url` equals that picture URL
- **AND** the access token is still issued

#### Scenario: Login does not overwrite existing avatar

- **GIVEN** an existing Google-linked account whose profile already has a non-null `avatar_id`
- **AND** Google profile includes a picture URL
- **WHEN** Google OAuth login completes
- **THEN** the profile’s `avatar_id` is unchanged
- **AND** the access token is still issued

#### Scenario: Login with no picture leaves avatar unset

- **GIVEN** an existing Google-linked account whose profile `avatar_id` is null
- **AND** Google profile has no picture URL
- **WHEN** Google OAuth login completes
- **THEN** the profile’s `avatar_id` remains null
- **AND** the access token is still issued
