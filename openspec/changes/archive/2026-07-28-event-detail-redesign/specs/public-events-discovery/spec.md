## MODIFIED Requirements

### Requirement: Event detail page route

`apps/web` SHALL provide a route at `/events/$documentId` that renders the full detail
of one published event in this order: a full-width image carousel of all event images,
the title with a share/copy-link action, the schedule, the full description, the full
address (street and number, city, state), the existing "Entradas próximamente" placeholder,
and — as the last element on the page — an embedded map centered on the event's coordinates
when present. UI copy MUST be Spanish via `@repo/i18n`.

#### Scenario: Direct URL access to a published event

- **GIVEN** a visitor opens `/events/$documentId` directly for a published event
- **WHEN** the page loads
- **THEN** the event detail UI is shown without requiring login, including all of its
  images in the top carousel, full description, schedule, full address, and the "Entradas
  próximamente" placeholder

#### Scenario: Image carousel shows all event images

- **GIVEN** a published event has two or more images
- **WHEN** the detail page loads
- **THEN** a full-width carousel at the top of the page cycles through all of the event's
  images via chevrons, dot pagination, or clicking a dot
- **AND** it does not navigate away from the detail page when interacted with

#### Scenario: Single image or no image renders without carousel controls

- **GIVEN** a published event has zero or one image
- **WHEN** the detail page loads
- **THEN** the carousel area shows that single image (or an empty-state placeholder when
  there are no images) without prev/next or dot controls

#### Scenario: Map renders last, after all other event data

- **GIVEN** the event has address coordinates
- **WHEN** the detail page loads
- **THEN** the embedded map centers on those coordinates with a single marker for the
  event, and it is the last element rendered on the page (after schedule, description,
  address text, and the tickets placeholder)

#### Scenario: Event without coordinates omits the map

- **GIVEN** the event has no address coordinates
- **WHEN** the detail page loads
- **THEN** the page shows the address text without an embedded map, consistent with the
  "no coordinates" handling already used in the discovery list

#### Scenario: Share action copies the event link

- **GIVEN** a visitor is viewing an event's detail page
- **WHEN** they activate the share/copy-link action
- **THEN** the current page URL is copied (or shared via the platform share sheet when
  available) and the UI confirms the action in Spanish
