## ADDED Requirements

### Requirement: Public event detail includes organizer

The anonymous public single-event detail response MUST include an `organizer` object for the owner of the event’s location. `organizer` MUST expose:

- `name` — display name: when the owner has a non-empty `organizationName`, that value; otherwise the owner’s `name` and `lastName` joined with a single space
- `avatar` — the owner’s profile avatar asset URL, or `null` when none is set
- `initialsSource` fields needed for avatar fallback: the owner’s personal `name` and `lastName` (so the UI can compute initials even when the display name is the organization)

The response MUST NOT expose organizer `taxId`, phone, email, or other PII beyond these fields.

#### Scenario: Owner with organization name

- **GIVEN** a published event whose location owner has a non-empty `organizationName` and an avatar URL
- **WHEN** an unauthenticated client requests the public detail endpoint for that event
- **THEN** `organizer.name` is the organization name
- **AND** `organizer.avatar` is that avatar URL

#### Scenario: Owner without organization name

- **GIVEN** a published event whose location owner has no `organizationName` (null or empty) and personal name “Ana” / last name “García”
- **WHEN** an unauthenticated client requests the public detail endpoint for that event
- **THEN** `organizer.name` is “Ana García”
- **AND** `organizer.avatar` is the owner avatar URL or `null`

#### Scenario: Owner without avatar

- **GIVEN** a published event whose location owner has no avatar asset
- **WHEN** an unauthenticated client requests the public detail endpoint for that event
- **THEN** `organizer.avatar` is `null`
- **AND** `organizer.name` is still resolved per the organization-or-personal rule above

### Requirement: Organizer identity on the public event detail page

The `/events/$documentId` page SHALL show the organizer’s avatar and display name **below the event title**, near the location name line (same header block). The UI MUST use the shared Avatar from `@repo/ui`; when `organizer.avatar` is null, it MUST show initials derived from the owner’s personal name/last name. UI chrome (e.g. “Organizado por”) MUST be Spanish via `@repo/i18n` (with EN parity). The organizer block MUST NOT link to a profile page in this change.

#### Scenario: Organizer shown under the title

- **GIVEN** a published event detail payload that includes an organizer with a display name
- **WHEN** the visitor views `/events/$documentId`
- **THEN** the organizer avatar and name appear below the event title near the location name
- **AND** the rest of the detail layout remains unchanged

#### Scenario: Initials fallback when avatar is missing

- **GIVEN** the detail payload has `organizer.avatar` null and personal name/last name present
- **WHEN** the detail page renders
- **THEN** the Avatar shows initials instead of an image

#### Scenario: Organization name preferred in the UI

- **GIVEN** the detail payload has `organizer.name` set to an organization name
- **WHEN** the detail page renders
- **THEN** that organization name is shown as the organizer label text (not the personal full name)
