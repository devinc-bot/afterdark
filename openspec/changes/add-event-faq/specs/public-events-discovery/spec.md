## ADDED Requirements

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

## MODIFIED Requirements

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

### Requirement: Event detail page route

`apps/web` SHALL provide a route at `/events/$documentId` that renders the full detail
of one published event in this order: a full-width image carousel of all event images,
the title with a share/copy-link action, the schedule, the full description, an optional
FAQ Accordion section when `faqs` is non-empty, the full address (street and number,
city, state), the existing "Entradas próximamente" placeholder, venue gallery when
`locationImages` is non-empty, and — as the last element on the page — an embedded map
centered on the event's coordinates when present. UI copy MUST be Spanish via
`@repo/i18n`. Selecting an event from the discovery list (via its "Ver evento" action)
MUST navigate to that event's detail page at `/events/$documentId`.

#### Scenario: Direct URL access to a published event

- **GIVEN** a visitor opens `/events/$documentId` directly for a published event
- **WHEN** the page loads
- **THEN** the event detail UI is shown without requiring login, including all of its
  images in the top carousel, full description, schedule, full address, optional FAQ
  section when FAQs exist, and the "Entradas próximamente" placeholder

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
  FAQ when present, address text, tickets placeholder, and venue gallery when present)

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
