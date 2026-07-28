## ADDED Requirements

### Requirement: Public single-event detail API

The system SHALL expose an anonymous HTTP endpoint that returns a single event by
`documentId` only when its status is `published`; unpublished (`draft`, `finished`) or
non-existent events MUST respond as not found. The `documentId` path param MUST be
validated as a UUID via `@repo/validators`. The response MUST include the event's full
description, schedule, location name, complete address (street, street number, city,
state, coordinates when present), and **all** event images (not only the first).

#### Scenario: Anonymous detail lookup for a published event

- **GIVEN** a published event with two images and a linked address
- **WHEN** an unauthenticated client requests the public detail endpoint with that
  event's `documentId`
- **THEN** the response includes the event's full description, schedule, location name,
  full address, and both images

#### Scenario: Draft or finished event is not found

- **GIVEN** an event exists with status `draft` or `finished`
- **WHEN** an unauthenticated client requests the public detail endpoint with that
  event's `documentId`
- **THEN** the API responds as not found

#### Scenario: Invalid documentId rejected by validators

- **GIVEN** a client requests the public detail endpoint with a path param that is not a
  valid UUID
- **WHEN** the request is processed
- **THEN** the API rejects the request according to `@repo/validators` without inventing
  ad-hoc validation messages in the handler

### Requirement: Event detail page route

`apps/web` SHALL provide a route at `/events/$documentId` that renders the full detail
of one published event: an image gallery of all event images, the full description, the
schedule, the full address (street and number, city, state), an embedded map centered on
the event's coordinates when present, a share/copy-link action, and the existing
"Entradas próximamente" placeholder in place of ticket purchase. UI copy MUST be Spanish
via `@repo/i18n`.

#### Scenario: Direct URL access to a published event

- **GIVEN** a visitor opens `/events/$documentId` directly for a published event
- **WHEN** the page loads
- **THEN** the event detail UI is shown without requiring login, including all of its
  images, full description, schedule, full address, and the "Entradas próximamente"
  placeholder

#### Scenario: Map centers on event coordinates

- **GIVEN** the event has address coordinates
- **WHEN** the detail page loads
- **THEN** the embedded map centers on those coordinates with a single marker for the
  event

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

### Requirement: Not-found handling for the detail route

When `/events/$documentId` is requested for an event that does not exist, is not
published, or when `documentId` is not a valid UUID, `apps/web` SHALL show a "Evento no
encontrado" state (Spanish copy) with a link back to `/events`, instead of a generic
error or a blank page.

#### Scenario: Unknown or unpublished event shows not-found state

- **GIVEN** the requested `documentId` does not correspond to a published event
- **WHEN** `/events/$documentId` loads
- **THEN** the page shows a "Evento no encontrado" state with a link back to `/events`

## MODIFIED Requirements

### Requirement: Map of filtered events

The `/events` page SHALL show a map (MapLibre via `@repo/ui`) with markers for published events returned for the current discovery query (using address coordinates when present). The map SHOULD center on the loaded markers (or a sensible default). Catalog results MUST NOT depend on browser geolocation. Selecting an event's **map marker** pans/highlights the map and does not navigate away from `/events`; selecting an event from the **list** (via its "Ver evento" action) navigates to that event's detail page at `/events/$documentId` instead of only panning the map.

#### Scenario: Markers from loaded results

- **GIVEN** published events with coordinates match the current filters
- **WHEN** `/events` loads (or filters change)
- **THEN** the map shows markers for loaded list items that have coordinates

#### Scenario: Markers accumulate with infinite scroll

- **GIVEN** the visitor has loaded the first page of results with coordinates
- **WHEN** they scroll and additional pages append to the list
- **THEN** the map adds markers for newly loaded items that have coordinates without removing prior markers

#### Scenario: Map marker click focuses the map without navigating

- **GIVEN** a listed event has address coordinates
- **WHEN** the visitor selects that event's marker on the map
- **THEN** the map pans/zooms to that event's marker and highlights the selection
- **AND** the visitor remains on `/events`

#### Scenario: List "Ver evento" navigates to the detail page

- **GIVEN** an event is shown in the discovery list
- **WHEN** the visitor activates that item's "Ver evento" action
- **THEN** the app navigates to `/events/$documentId` for that event

#### Scenario: Events without coordinates still list

- **GIVEN** a published event matches filters but has no address coordinates
- **WHEN** the list loads
- **THEN** the event appears in the list and may omit a map marker
- **AND** its "Ver evento" action still navigates to the detail page
