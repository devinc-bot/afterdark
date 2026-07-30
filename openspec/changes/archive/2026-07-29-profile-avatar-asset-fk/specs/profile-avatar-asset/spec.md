## ADDED Requirements

### Requirement: Profile avatars stored as asset foreign keys

The `owners`, `users`, and `staff` tables SHALL each store the profile avatar as a nullable foreign key `avatar_id` referencing `assets.id` (not as free-form text). When the referenced asset is deleted, `avatar_id` MUST be set to null.

#### Scenario: Schema references assets for all profile roles

- **WHEN** an owner, user, or staff row has an avatar asset
- **THEN** that row’s `avatar_id` points to a row in `assets`
- **AND** the previous text `avatar` column on that table no longer exists

#### Scenario: Asset delete clears profile avatar FK

- **WHEN** an asset referenced by any profile `avatar_id` is deleted
- **THEN** that profile’s `avatar_id` becomes null

### Requirement: Profile reads resolve avatar URL from assets

Authenticated profile/session reads for owner, user, and staff SHALL expose `avatar` as `string | null` equal to the related asset’s `url` when `avatar_id` is set, or null when there is no linked asset or the asset has no URL. Clients MUST continue to treat `avatar` as an image URL, not an asset id.

#### Scenario: Profile with linked asset URL

- **GIVEN** a profile row with `avatar_id` pointing to an asset whose `url` is a non-empty string
- **WHEN** that profile is loaded through the settings/session path for its role
- **THEN** the response field `avatar` equals that asset URL

#### Scenario: Profile without avatar asset

- **GIVEN** a profile row with `avatar_id` null
- **WHEN** that profile is loaded
- **THEN** the response field `avatar` is null

### Requirement: Remove unused user_assets_lnk

The system SHALL NOT keep the `user_assets_lnk` table or its Drizzle schema module. Related unused enums for that link type MUST be removed when no longer referenced.

#### Scenario: Schema and migration drop the link table

- **WHEN** migrations for this change are applied
- **THEN** `user_assets_lnk` no longer exists in the database
- **AND** `@repo/db` no longer exports `userAssetsLnk`
