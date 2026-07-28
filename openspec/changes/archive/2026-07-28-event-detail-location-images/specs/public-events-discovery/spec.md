## ADDED Requirements

### Requirement: Public event detail includes location images

The anonymous public single-event detail response MUST include `locationImages`: the
image assets linked to the event’s location via the existing location–asset link table.
Each item MUST use the same public image shape as event images (`documentId`, `name`,
`url`). When the location has no images, the field MUST be an empty array. Location
images MUST NOT replace or be merged into the event `images` field.

#### Scenario: Published event with venue photos

- **GIVEN** a published event whose location has one or more linked image assets
- **WHEN** an unauthenticated client requests the public detail endpoint for that event
- **THEN** the response includes those assets in `locationImages` and still returns
  event-only assets in `images`

#### Scenario: Location with no photos

- **GIVEN** a published event whose location has no linked image assets
- **WHEN** an unauthenticated client requests the public detail endpoint for that event
- **THEN** `locationImages` is an empty array and the request still succeeds

### Requirement: Venue gallery on the event detail page

The `/events/$documentId` page SHALL show a venue image gallery in a section distinct
from the event hero carousel, placed with the address content and before the map when
the map is shown. The section MUST appear only when `locationImages` is non-empty. UI
copy for the section heading and accessibility labels MUST be Spanish via `@repo/i18n`
(with EN parity). Venue images MUST NOT be mixed into the hero event carousel.

#### Scenario: Venue gallery when location has images

- **GIVEN** the public detail payload includes one or more `locationImages`
- **WHEN** the visitor views the event detail page
- **THEN** a venue gallery section is shown near the address (before the map when
  present), separate from the event hero carousel

#### Scenario: No venue gallery when empty

- **GIVEN** the public detail payload has an empty `locationImages` array
- **WHEN** the visitor views the event detail page
- **THEN** no venue gallery section is rendered
- **AND** the event hero carousel behavior is unchanged
