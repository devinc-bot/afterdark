## ADDED Requirements

### Requirement: Event image cover-flow on discovery

The `/events` page SHALL show a cover-flow carousel above the filters and list. Slides MUST be built from the **first image** of each loaded catalog event that has at least one image (same filtered infinite-scroll result set as the list). Events without images MUST be omitted from the carousel. Activating a slide (click / keyboard equivalent) MUST navigate to `/events/$documentId` for that event. UI copy MUST be Spanish via `@repo/i18n`.

#### Scenario: Slides from first images of loaded events

- **GIVEN** published events matching the current filters are loaded and some have images
- **WHEN** `/events` renders the cover-flow
- **THEN** the carousel shows one slide per event that has images, using that event’s first image and a title derived from the event name

#### Scenario: Cover-flow grows with infinite scroll

- **GIVEN** the visitor has loaded the first page and later pages append events with images
- **WHEN** new pages are fetched
- **THEN** the carousel includes slides for newly loaded events that have a first image, without requiring a full page reload

#### Scenario: Slide navigates to event detail

- **GIVEN** a cover-flow slide for an event with `documentId`
- **WHEN** the visitor activates that slide
- **THEN** the app navigates to `/events/$documentId`

#### Scenario: No images among loaded events

- **GIVEN** the loaded result set has no events with images (or is empty)
- **WHEN** `/events` renders
- **THEN** the cover-flow section is hidden (or omitted) and filters/list still work

## MODIFIED Requirements

### Requirement: Catalog filters by date and place

The public catalog SHALL support optional filters for date range (`startsAt` / date window as defined in validators) and place (`city` and/or `state` matching the location address). Applying filters MUST narrow both the list and the cover-flow source set consistently for the same query.

#### Scenario: Filter by city

- **GIVEN** published events in different cities
- **WHEN** the client requests the catalog with a city filter
- **THEN** only published events whose location address city matches are returned

#### Scenario: Filter by date range

- **GIVEN** published events on different dates
- **WHEN** the client requests the catalog with a date-range filter
- **THEN** only events overlapping or starting within that range (per validator rules) are returned

### Requirement: Filtered infinite list beside filters

Below the cover-flow, the page SHALL show a filters panel and an event list. Filters in v1 are date range and city/state. The list SHALL load **5** events per page and support infinite scroll to fetch subsequent pages with the same filters. Changing filters MUST reset the list to the first page and rebuild the cover-flow from the new loaded results. Empty and error states MUST use Spanish copy.

#### Scenario: Infinite scroll loads next page

- **GIVEN** more than five published events match the current filters
- **WHEN** the visitor scrolls the list to the end
- **THEN** the next page of five events is appended without requiring a full page reload

#### Scenario: Changing filters resets pagination

- **GIVEN** the visitor has scrolled past the first page
- **WHEN** they change a filter (date or city/state) and apply it
- **THEN** the list resets and shows the first page of matching results
- **AND** the cover-flow reflects images from the newly loaded first page

#### Scenario: Empty results

- **GIVEN** no published events match the applied filters
- **WHEN** the list finishes loading
- **THEN** the visitor sees an empty state in Spanish and the cover-flow is omitted

## REMOVED Requirements

### Requirement: Map of filtered events

**Reason:** Discovery top surface is an image cover-flow; geographic map browsing is out of scope for `/events`.

**Migration:** Delete discover map UI (`EventsDiscoverMap` and map focus/selection wiring). Event detail may still show a location map on its own page; that is unrelated.
