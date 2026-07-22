## Why

The event creation/edit flow is a 2-step wizard (Location → Details) that also lets users create a brand-new location inline. This adds friction, duplicates the standalone location form, and makes the flow harder to maintain. Collapsing it into a single form and reusing the dedicated `/locations/new` route simplifies the UX and removes duplicated code. Additionally, the location `type` field (permanent/temporary) is never surfaced in the UI, is hardcoded in the API, and adds no value — it should be removed.

## What Changes

- Replace the 2-step event wizard with a **single event form** containing all fields (location select + event details + images) on one page.
- **Remove** the inline "add new location" flow from the event form (`event-wizard-new-location-form.tsx` and the "add different location" tab/mode).
- Use a **location select** as the only way to choose a location in the event form.
- When the user has **no locations**, hide the select and show a message stating there are no locations, plus a link "Agregar ubicación" that navigates to `/locations/new`.
- **Remove the `type` field from locations** entirely (DB column, types, repository input, API mapper/use-cases). **BREAKING** at the DB/schema level (migration to drop the column).
- Remove now-unused wizard pieces: stepper, step components, location summary, wizard mode/step enums, and the inline location form.

## Non-goals

- No changes to how locations are created/edited on the standalone `/locations/new` and `/locations/:id/edit` pages (beyond removing `type`, which is already not in that UI).
- No changes to event fields themselves (name, description, dates, status, images) beyond moving them into a single form.
- No change to the last-used-location prefill behavior (it should keep working with the select).
- No redesign of the location select styling beyond what a single-form layout requires.

## Capabilities

### New Capabilities

- `event-authoring`: Creating and editing an event through a single form, selecting an existing location, with an empty-state that links to location creation when the owner has no locations.
- `location-management`: Managing owner locations, with the location entity no longer carrying a `type` (permanent/temporary) attribute.

### Modified Capabilities

<!-- No existing OpenSpec specs; nothing to modify. -->

## Impact

- **apps/dashboard**: `modules/events/` (wizard → single form; delete stepper, step-location, step-details as separate steps, new-location form, location-summary, wizard types). Reuse `useLocations()` for the select and the `/locations/new` route for the empty state.
- **packages/db**: `schema/location.ts` (drop `type` column) + new drizzle migration.
- **packages/types**: `dto/location.ts` and `repository/locations.ts` (remove `type`).
- **packages/validators**: `location.ts` (remove unused `locationTypeSchema`).
- **apps/api**: `modules/locations/` mappers + create/update use-cases (stop referencing `type`).
- **packages/i18n**: event module copy for the single form + no-locations empty state ("Agregar ubicación").
