## Why

Visitors on the public site can only jump to a marketing `#eventos` anchor; there is no way to browse real published events near them. A dedicated `/events` discovery page (map + filtered list) turns the landing nav into a useful entry point and supports the product goal of helping people find nightlife events.

## What Changes

- Add a public TanStack Router page at `/events` in `apps/web`.
- Change the landing header “Eventos” link from `#eventos` to `/events` (and align footer/nav constants as needed).
- Show a MapLibre map with markers for published events (coords from location address).
- Below the map: infinite-scroll event list (page size **5**), with a **filters** panel to the left of the list (date range + city/state).
- Add an **anonymous** API to list `published` events with pagination and filters (date range, city, state), ordered by `startsAt`.
- Extend the public event payload with fields needed for discovery (location name, city/state, coordinates for the map).

## Non-goals

- Event detail page / ticket purchase flow from this page (listing + map only).
- Categories/tags filters (not in the domain yet).
- Changing owner dashboard event CRUD (`event-authoring`).
- Authenticated-only discovery or personalized recommendations.
- Offline maps or a new map library (reuse MapLibre from `@repo/ui`).
- Distance / Haversine sorting or geolocation-based catalog ordering.

## Capabilities

### New Capabilities

- `public-events-discovery`: Anonymous catalog API for published events (date/city/state filters, pagination, startsAt order) and the public `/events` web experience (nav, map, filters, infinite list).

### Modified Capabilities

- (none — existing `event-authoring` / owner APIs stay as-is)

## Impact

- **apps/web** — new `/events` route/module; landing header/footer nav; i18n keys for the page.
- **apps/api** — new public events list endpoint (no JWT); mappers/DTOs for discovery fields.
- **packages/db** — new repository query joining events → locations → addresses; filter by city/state/date; order by `startsAt`.
- **packages/validators** — public list query schema (page/limit/date/city/state).
- **packages/types** / **packages/common** — DTOs and API route constants.
- **packages/ui** — reuse existing MapLibre map component (no dashboard changes required).
- **packages/i18n** — Spanish copy for filters, empty/error states, list labels.
- **No migration** expected if lat/lng already live on `address` (for map markers; verify at design time).
