## ADDED Requirements

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

## MODIFIED Requirements

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
