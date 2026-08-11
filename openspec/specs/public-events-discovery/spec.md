# public-events-discovery

## Purpose

Define how anonymous visitors discover published events on the public web:
catalog API, filters, image cover-flow, the `/events` infinite-scroll list, and
the public event detail page at `/events/$documentId`.
## Requirements
### Requirement: Public published-events catalog API

The system SHALL expose an anonymous HTTP endpoint that returns only events with status `published`, validated via `@repo/validators` (public list query schema). Draft and finished events MUST NOT appear. The response MUST include fields needed for discovery: event identity and schedule, location name, city/state (from the location address when present), coordinates when present, and optional images.

#### Scenario: Anonymous list of published events

- **GIVEN** published and draft events exist
- **WHEN** an unauthenticated client requests the public events catalog with valid pagination
- **THEN** the response includes only published events and omits draft events

#### Scenario: Invalid query rejected by validators

- **GIVEN** a client sends query params outside the public list schema
- **WHEN** the request is processed
- **THEN** the API rejects the request according to `@repo/validators` without inventing ad-hoc validation messages in the handler

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

`apps/web` SHALL provide a route at `/events`. The landing header “Eventos” control MUST navigate to `/events` (not `#eventos`). UI copy for the page MUST be Spanish via `@repo/i18n`.

#### Scenario: Navigate from landing header

- **GIVEN** a visitor is on the landing page
- **WHEN** they activate the “Eventos” nav item
- **THEN** the app navigates to `/events`

#### Scenario: Direct URL access

- **GIVEN** a visitor opens `/events` directly
- **WHEN** the page loads
- **THEN** the public events discovery UI is shown without requiring login

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

### Requirement: Public single-event detail API

The system SHALL expose an anonymous HTTP endpoint that returns a single event by
`documentId` only when its status is `published`; unpublished (`draft`, `finished`) or
non-existent events MUST respond as not found. The `documentId` path param MUST be
validated as a UUID via `@repo/validators`. The response MUST include the event's full
description, schedule, location name, complete address (street, street number, city,
state, coordinates when present), **all** event images (not only the first), and an
ordered `faqs` array of question/answer items (empty array when the event has none).
FAQ shape and limits MUST follow `@repo/validators`.

#### Scenario: Anonymous detail lookup for a published event

- **GIVEN** a published event with two images, a linked address, and two FAQ items
- **WHEN** an unauthenticated client requests the public detail endpoint with that
  event's `documentId`
- **THEN** the response includes the event's full description, schedule, location name,
  full address, both images, and both FAQ items in display order

#### Scenario: Published event with no FAQs

- **GIVEN** a published event with no FAQ rows
- **WHEN** an unauthenticated client requests the public detail endpoint for that event
- **THEN** `faqs` is an empty array and the request still succeeds

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

### Requirement: FAQ accordion on the public event detail page

The `/events/$documentId` page SHALL show a FAQ section when the public detail payload includes one or more FAQ items. The section MUST use the shared Accordion from `@repo/ui` (`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`), listing each question as a trigger and each answer as content, in API display order. The section MUST be omitted when the FAQ list is empty. UI chrome (section heading, accessibility labels) MUST be Spanish via `@repo/i18n` (with EN parity). FAQ question/answer body text MUST render as stored (owner-authored), not through i18n.

#### Scenario: Accordion renders FAQ items in order

- **GIVEN** the public detail payload includes two or more FAQ items
- **WHEN** the visitor views the event detail page
- **THEN** a FAQ section shows an Accordion with one item per FAQ in display order
- **AND** activating a trigger reveals that item’s answer without navigating away

#### Scenario: No FAQ section when empty

- **GIVEN** the public detail payload has an empty FAQ list
- **WHEN** the visitor views the event detail page
- **THEN** no FAQ section is rendered
- **AND** the rest of the detail page is unchanged

#### Scenario: Prefer-reduced-motion still allows expand/collapse

- **GIVEN** the visitor has prefers-reduced-motion enabled and the event has FAQ items
- **WHEN** they expand or collapse an Accordion item
- **THEN** the answer still shows or hides correctly

### Requirement: Event detail page route

`apps/web` SHALL provide a route at `/events/$documentId` that renders the full detail
of one published event in this order: a full-width image carousel of all event images,
the title with a share/copy-link action, the schedule, the full description, an optional
FAQ Accordion section when `faqs` is non-empty, the full address (street and number,
city, state), the ticket purchase panel (from `tickets` / `paymentsReady` per ticket-checkout; not the legacy “Entradas próximamente” stub), venue gallery when
`locationImages` is non-empty, and — as the last element on the page — an embedded map
centered on the event's coordinates when present. UI copy MUST be Spanish via
`@repo/i18n`. Selecting an event from the discovery list (via its "Ver evento" action)
MUST navigate to that event's detail page at `/events/$documentId`.

#### Scenario: Direct URL access to a published event

- **GIVEN** a visitor opens `/events/$documentId` directly for a published event
- **WHEN** the page loads
- **THEN** the event detail UI is shown without requiring login, including all of its
  images in the top carousel, full description, schedule, full address, optional FAQ
  section when FAQs exist, and the ticket purchase panel driven by public detail data

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
- **WHEN** the page loads
- **THEN** the embedded map centers on those coordinates with a single marker for the
  event, and it is the last element rendered on the page (after schedule, description,
  FAQ when present, address text, ticket purchase panel, and venue gallery when present)

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

#### Scenario: List "Ver evento" navigates to the detail page

- **GIVEN** an event is shown in the discovery list
- **WHEN** the visitor activates that item's "Ver evento" action
- **THEN** the app navigates to `/events/$documentId` for that event

### Requirement: Event detail image carousel with parallax

The public event detail page (`/events/$documentId`) SHALL show a full-width image
carousel of all event images at the top of the detail content. The carousel MUST be
implemented with the shared shadcn Carousel in `@repo/ui` (Embla) and MUST apply the
Embla parallax tween pattern to slide media while scrolling. Interaction MUST NOT
navigate away from the detail page. UI copy (aria labels, prev/next) MUST be Spanish
via `@repo/i18n`.

#### Scenario: Multiple images use Embla carousel with parallax

- **GIVEN** a published event has two or more images
- **WHEN** the visitor opens the event detail page
- **THEN** a full-width carousel shows all event images
- **AND** dragging or using prev/next advances slides with a parallax motion on the
  image layer
- **AND** the visitor remains on the same detail route

#### Scenario: Single image or empty gallery

- **GIVEN** a published event has zero or one image
- **WHEN** the detail page loads
- **THEN** the carousel area shows that single image, or an empty-state placeholder
  when there are no images, without prev/next controls

#### Scenario: Prefers-reduced-motion

- **GIVEN** the visitor has prefers-reduced-motion enabled
- **WHEN** they change slides
- **THEN** slide changes still work, and parallax tweening is reduced or disabled so
  motion does not rely on continuous translate parallax

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

### Requirement: Not-found handling for the detail route

When `/events/$documentId` is requested for an event that does not exist, is not
published, or when `documentId` is not a valid UUID, `apps/web` SHALL show a "Evento no
encontrado" state (Spanish copy) with a link back to `/events`, instead of a generic
error or a blank page.

#### Scenario: Unknown or unpublished event shows not-found state

- **GIVEN** the requested `documentId` does not correspond to a published event
- **WHEN** `/events/$documentId` loads
- **THEN** the page shows a "Evento no encontrado" state with a link back to `/events`

### Requirement: Public event detail includes purchasable tickets

The anonymous public single-event detail response MUST include a `tickets` array of offers for that event that are eligible for public sale display: active status and within sale window when dates are set (rules in application layer; field shapes via `@repo/validators` / DTO types). Each item MUST include identity (`documentId`), `name`, `price`, `type`, remaining quantity (or equivalent stock signal), and sale window fields when present. Tickets that are inactive or outside the sale window MUST be omitted. The response MUST also include `paymentsReady` (boolean): true only when Afterdark's Mercado Pago account is configured.

#### Scenario: Published event with on-sale tickets and configured platform payments

- **GIVEN** a published event with two active on-sale tickets and Afterdark's Mercado Pago account configured
- **WHEN** an unauthenticated client requests the public detail endpoint
- **THEN** `tickets` contains both offers with price and stock signals and `paymentsReady` is true

#### Scenario: Platform payments not configured

- **GIVEN** a published event with on-sale tickets but Afterdark's Mercado Pago account is not configured
- **WHEN** an unauthenticated client requests the public detail endpoint
- **THEN** `tickets` may still list offers for display and `paymentsReady` is false

#### Scenario: No eligible tickets

- **GIVEN** a published event with only inactive tickets or tickets outside the sale window
- **WHEN** an unauthenticated client requests the public detail endpoint
- **THEN** `tickets` is an empty array and the request still succeeds

