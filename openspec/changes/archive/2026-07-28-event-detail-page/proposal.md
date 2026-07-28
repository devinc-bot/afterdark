## Why

`/events` (public-events-discovery) only lets visitors preview an event inline while
browsing the map/list — there is no permalink page. Visitors cannot share, bookmark, or
deep-link into a single event, and the inline preview truncates description and shows
only one image. A dedicated detail page is the next step toward the "descubrir/comprar
entradas" flow described in DOMAIN.md, even though ticket purchase itself stays out of
scope for now.

## What Changes

- Add an anonymous `GET /events/:documentId` public detail endpoint (published events
  only) returning full event data: name, description, schedule, all images, full
  location address (street, street number, city, state, coordinates).
- Add a new `apps/web` route `/events/$documentId` rendering the full event detail page:
  image gallery, full description, schedule, full address, embedded map with a single
  pin, a share/copy-link action, and the existing "Entradas próximamente" placeholder.
- Change discovery list navigation: the "Ver evento" button on `EventsDiscoverListItem`
  navigates to `/events/$documentId` instead of only focusing the map. The inline
  `EventsDiscoverSelection` card is removed; map-marker selection still highlights/pans
  the map without opening the detail page.
- Add a "not found" state for the detail route (unpublished/missing/invalid event ID)
  with a link back to `/events`.

## Capabilities

### New Capabilities

(none — this extends the existing discovery capability)

### Modified Capabilities

- `public-events-discovery`: adds the single-event public API, the `/events/$documentId`
  detail page requirements, and changes list-item navigation behavior (permalink instead
  of inline-only preview).

## Impact

- **apps/api**: `events` module — new use case + controller route for public single-event
  lookup (published-only, distinct path from the existing owner-guarded
  `GET /events/:documentId`); mapper extended for full address + all images.
- **packages/db**: new/extended repository query to fetch one published event with
  location + full address + all images by `documentId`.
- **packages/types**: new `PublicEventDetailResponse` (or extend `PublicEventResponse`)
  DTO with full address fields and all images.
- **packages/common**: `API_ROUTES.events.path` gets a distinct public-detail path.
- **apps/web**: new route file, new `events` module components (detail page, gallery,
  map embed, share action), removal of `EventsDiscoverSelection`, list-item navigation
  change, new query/service for fetching one public event.
- **packages/i18n**: new `events.discover.detail.*` keys (ES/EN); remove now-unused
  `discover.selection.*` keys still needed by the placeholder copy ("Entradas
  próximamente") which moves into the new namespace.
- No dashboard changes. No DB schema/migration changes (existing tables already have the
  needed columns).
