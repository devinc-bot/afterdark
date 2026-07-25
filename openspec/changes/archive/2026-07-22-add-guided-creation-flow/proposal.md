## Why

New owners land on the dashboard panel without a clear sense of what to do first. The three core steps — create a location, create an event, create tickets — live in separate screens with no guidance connecting them, so setup feels disjointed and easy to abandon. A short in-panel tutorial plus a guided "create the next thing" flow makes the happy path obvious and reduces drop-off during first-time setup.

## What Changes

- Add an onboarding **alert/callout on the dashboard panel** that explains the 3-step flow (1. crear ubicación → 2. crear evento → 3. crear tickets) in an intuitive way, with a primary call-to-action button that navigates to `/locations/new`.
- After **creating a location**, redirect the user to `/events/new` (instead of the locations list) to continue the guided flow.
- After **creating an event**, redirect the user to `/tickets/new` (instead of the events list) to continue the guided flow.
- Add a new **`/tickets/new` route** that renders a full-page ticket creation form reusing the exact fields currently in the "create ticket" modal (`eventId`, `name`, `type`, `status`, `price`, `quantity`, `saleStartsAt`, `saleEndsAt`, `description`). The existing modal remains for the tickets list; the new route is the guided-flow destination.
- Add Spanish UI copy for the onboarding alert and the ticket authoring page.

### Non-goals

- No changes to the ticket data model, validators (`@repo/validators`), API, or database.
- No removal of the existing ticket create/edit modals on the tickets list.
- No changes to the event or location form fields themselves (only their post-success navigation).
- No multi-tenant onboarding state persistence (the alert is not dismissible-with-memory in this change unless trivial); no analytics/telemetry.
- No changes to the Staff panel flow (guidance targets the Owner setup path).

## Capabilities

### New Capabilities

- `guided-creation-flow`: the dashboard panel onboarding tutorial alert (3-step explanation + CTA to create a location) and the chained post-create redirect from location creation to `/events/new`.
- `ticket-authoring`: a full-page `/tickets/new` route for creating a ticket, mirroring the modal's fields and validation, used as the destination after event creation.

### Modified Capabilities

- `event-authoring`: post-create navigation changes so that submitting a valid create form navigates the user to `/tickets/new` (continuing the guided flow) instead of returning to the events list.

## Impact

- **apps/dashboard**:
  - `modules/owner/components/owner-panel-view.tsx` — render the onboarding alert.
  - New onboarding alert component under `modules/common` (or `modules/owner`).
  - `modules/locations/components/location-form-page.tsx` — change create-success navigation to `/events/new`.
  - `modules/events/components/event-form-page.tsx` — change create-success navigation to `/tickets/new`.
  - New route `routes/_app/tickets/new.tsx` + a `TicketCreateView`/page wrapper; refactor `ticket-form.tsx` so it can render standalone (page) and inside the dialog.
  - `modules/common/constants/routes.ts` — add `ticketsNew()`.
- **packages/i18n**: new keys in `tickets` (page title/description) and a new/extended namespace section for the panel onboarding alert copy (`dashboard`), in `en.json` and `es.json`.
- No changes to `apps/api`, `apps/web`, `packages/db`, `packages/validators`, `packages/types`.
