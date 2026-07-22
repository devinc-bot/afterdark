## Why

Ticket create/edit on the tickets list still use modal dialogs, while locations and events already use dedicated full-page routes. `/tickets/new` already exists for the guided flow, but the list still opens a modal — two entry points that feel inconsistent and cramped for a multi-field form.

## What Changes

- Replace the tickets-list **create** action with navigation to `/tickets/new` (Link/button), matching events/locations.
- Add a full-page **edit** route at `/tickets/$documentId/edit` and navigate there from the list edit action (same pattern as locations/events).
- Add an owner **GET ticket by documentId** API (reuse existing ownership lookup) so the edit page can load on refresh.
- Remove `TicketCreateDialog` and `TicketEditDialog` from the tickets management flow (and delete those components once unused).
- Keep delete confirmation as a dialog (unchanged).
- Reuse the existing shared `TicketForm` / `TicketCreateView` patterns; add a `TicketEditView` (and loading/error/not-found states) mirroring events/locations.

## Non-goals

- No DB schema migrations or ticket field/validator rule changes.
- No changes to the guided-creation flow redirects (event create → `/tickets/new` stays).
- No redesign of ticket form fields.
- Delete remains a confirmation dialog (not a full page).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `ticket-authoring`: List create/edit entry points become full-page routes; remove the requirement that the create modal remain on the tickets list; add edit page requirements and owner GET-by-id for loading edit.

## Impact

- **apps/dashboard**: `tickets-management-view`, remove create/edit dialogs, new edit route/view, route constant `ticketsEdit()`, header CTA → Link to `ticketsNew()`.
- **apps/api** + **packages/common**: thin `GET` ticket-by-`documentId` for owners (reuse existing owned-ticket repository lookup), so the edit page can load on refresh.
- **packages/i18n**: Spanish/English keys for edit page title/description/meta (if missing).
- **packages/db / packages/validators**: no schema changes; may wire existing `findTicketWithRelationsOwnedByOwner` into a get use-case.
