# public-events-discovery

## Purpose

Define how anonymous visitors discover published events on the public web:
catalog API, filters, map markers, and the `/events` infinite-scroll list.

## Requirements

### Requirement: Public published-events catalog API

The system SHALL expose an anonymous HTTP endpoint that returns only events with status `published`, validated via `@afterdark/validators` (public list query schema). Draft and finished events MUST NOT appear. The response MUST include fields needed for discovery: event identity and schedule, location name, city/state (from the location address when present), coordinates when present, and optional images.

#### Scenario: Anonymous list of published events

- **GIVEN** published and draft events exist
- **WHEN** an unauthenticated client requests the public events catalog with valid pagination
- **THEN** the response includes only published events and omits draft events

#### Scenario: Invalid query rejected by validators

- **GIVEN** a client sends query params outside the public list schema
- **WHEN** the request is processed
- **THEN** the API rejects the request according to `@afterdark/validators` without inventing ad-hoc validation messages in the handler

### Requirement: Catalog filters by date and place

The public catalog SHALL support optional filters for date range (`startsAt` / date window as defined in validators) and place (`city` and/or `state` matching the location address). Applying filters MUST narrow both list and map-oriented result sets consistently for the same query.

#### Scenario: Filter by city

- **GIVEN** published events in different cities
- **WHEN** the client requests the catalog with a city filter
- **THEN** only published events whose location address city matches are returned

#### Scenario: Filter by date range

- **GIVEN** published events on different dates
- **WHEN** the client requests the catalog with a date-range filter
- **THEN** only events overlapping or starting within that range (per validator rules) are returned

### Requirement: Catalog ordering by start date

The public catalog SHALL order results by ascending `startsAt`. Default page size for the public web client is **5** items per page (API MUST allow `limit=5` via pagination validators). Place narrowing is via optional city/state filters only (not visitor geolocation).

#### Scenario: Ordered by start date

- **GIVEN** published events on different dates
- **WHEN** the client requests the catalog without place filters
- **THEN** results are ordered by `startsAt` ascending and still respect pagination

#### Scenario: City and/or state filters apply

- **GIVEN** published events in different cities and states
- **WHEN** the client requests the catalog with city and/or state filters
- **THEN** only matching published events are returned, still ordered by `startsAt` ascending

### Requirement: Public events page route and navigation

`apps/web` SHALL provide a route at `/events`. The landing header “Eventos” control MUST navigate to `/events` (not `#eventos`). UI copy for the page MUST be Spanish via `@afterdark/i18n`.

#### Scenario: Navigate from landing header

- **GIVEN** a visitor is on the landing page
- **WHEN** they activate the “Eventos” nav item
- **THEN** the app navigates to `/events`

#### Scenario: Direct URL access

- **GIVEN** a visitor opens `/events` directly
- **WHEN** the page loads
- **THEN** the public events discovery UI is shown without requiring login

### Requirement: Map of filtered events

The `/events` page SHALL show a map (MapLibre via `@afterdark/ui`) with markers for published events returned for the current discovery query (using address coordinates when present). The map SHOULD center on the loaded markers (or a sensible default). Catalog results MUST NOT depend on browser geolocation.

#### Scenario: Markers from loaded results

- **GIVEN** published events with coordinates match the current filters
- **WHEN** `/events` loads (or filters change)
- **THEN** the map shows markers for loaded list items that have coordinates

#### Scenario: Markers accumulate with infinite scroll

- **GIVEN** the visitor has loaded the first page of results with coordinates
- **WHEN** they scroll and additional pages append to the list
- **THEN** the map adds markers for newly loaded items that have coordinates without removing prior markers

#### Scenario: List click focuses map marker

- **GIVEN** a listed event has address coordinates
- **WHEN** the visitor selects that event in the list
- **THEN** the map pans/zooms to that event’s marker and highlights the selection

#### Scenario: Events without coordinates still list

- **GIVEN** a published event matches filters but has no address coordinates
- **WHEN** the list loads
- **THEN** the event appears in the list and may omit a map marker
- **AND** selecting it does not move the map camera

### Requirement: Filtered infinite list beside filters

Below the map, the page SHALL show a filters panel to the **left** of an event list. Filters in v1 are date range and city/state. The list SHALL load **5** events per page and support infinite scroll to fetch subsequent pages with the same filters. Changing filters MUST reset the list to the first page. Empty and error states MUST use Spanish copy.

#### Scenario: Infinite scroll loads next page

- **GIVEN** more than five published events match the current filters
- **WHEN** the visitor scrolls the list to the end
- **THEN** the next page of five events is appended without requiring a full page reload

#### Scenario: Changing filters resets pagination

- **GIVEN** the visitor has scrolled past the first page
- **WHEN** they change a filter (date or city/state) and apply it
- **THEN** the list resets and shows the first page of matching results

#### Scenario: Empty results

- **GIVEN** no published events match the filters
- **WHEN** the list finishes loading
- **THEN** the UI shows an empty state in Spanish and does not invent results
