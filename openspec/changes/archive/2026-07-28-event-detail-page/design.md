## Context

`public-events-discovery` already exposes `GET /events/` (anonymous, published-only,
paginated) and renders `/events` with a map + filtered infinite list. Selecting an item
today only sets local React state (`selectedEventId`) to pan the map and render an inline
`EventsDiscoverSelection` card — there is no server round-trip and no URL for a single
event, so it can't be shared, bookmarked, or opened directly.

The API already has an owner-guarded single-event endpoint,
`GET /events/:documentId` (`EventsController.getByDocumentId`), but it is
authenticated, scoped to the requesting owner, and returns `EventResponse` (no address).
It cannot be reused as-is for anonymous access.

## Goals / Non-Goals

**Goals:**

- Anonymous, published-only lookup of a single event by `documentId`, with full address
  and all images (not just the first).
- A `/events/$documentId` page in `apps/web` reusing existing UI primitives (map, badges,
  cards) and i18n conventions from the discovery module.
- Discovery list "Ver evento" navigates to the detail page (permalink); the inline
  `EventsDiscoverSelection` card is removed since the detail page replaces it.
- Not-found/unpublished event handling with a friendly Spanish message and a link back to
  `/events`.

**Non-Goals:**

- Ticket purchase/checkout — the placeholder copy ("Entradas próximamente") persists.
- Editing or owner-side event management (unrelated to `EventsController` owner routes).
- SEO/meta-tag work beyond the existing `usePageTitle` pattern already used by `/events`.
- Changing the public list endpoint's response shape (`PublicEventResponse` stays as-is
  for the list; the detail response is a separate, richer shape).

## Decisions

### 1. New route path for the public detail endpoint

**Decision:** Add `GET /events/id/:documentId` as the anonymous public detail route,
keeping the existing owner-guarded `GET /events/:documentId` untouched.

Nest matches routes by exact path pattern per method; the owner route already occupies
`GET /events/:documentId`, so the public route needs a distinct static segment. Adding an
`id/` segment avoids colliding with the owner path or with `listPublic` (`GET /events/`)
and reads naturally (`/events/id/{documentId}`). `API_ROUTES.events.path.getPublic` is
added alongside the existing `get`.

**Alternatives considered:**
- Reuse `GET /events/:documentId` and branch on the `Authorization` header inside one
  handler — rejected: mixes public/owner authorization concerns in one code path and
  makes the owner-only guard harder to reason about.
- `GET /events/public/:documentId` — equivalent to `id/`, but `id` more directly signals
  "look up by id" without repeating the word "public" already implied by the anonymous
  route group; either is acceptable, `id/` is chosen for brevity.

### 2. Query the DB directly for the single published event (no reuse of pagination query)

**Decision:** Add `findPublishedEventByDocumentId(documentId)` in
`packages/db/src/repositories/events/`, mirroring the join shape of
`findPublishedEventsPaginated` (events ⋈ locations ⋈ locationAddressesLnk ⋈ addresses)
but filtered by `documentId` + `status = published`, `limit(1)`. Images are fetched via
the existing `findEventImageAssetsByEventIds` (already supports multiple images per
event; the list mapper only takes `images[0]`, the detail mapper keeps the full array).

**Alternatives considered:**
- Filter the existing paginated query by documentId — rejected: pagination/ordering
  params are irrelevant noise for a single-row lookup and the two use cases (list vs.
  detail) have different response shapes (flat address vs. nested full address).

### 3. Separate response DTO for the detail view

**Decision:** Add `PublicEventDetailResponse` in `packages/types/src/dto/event.ts`:

```ts
export interface PublicEventDetailResponse {
  documentId: string
  name: string
  description: string
  startsAt: Date
  endsAt: Date
  locationName: string
  address: {
    street: string
    streetNumber: string
    city: string
    state: string
    latitude: number | null
    longitude: number | null
  } | null
  images: EventImageResponse[]
}
```

`address` stays nullable because the join to `locationAddressesLnk`/`addresses` is
optional in principle (a location could exist without a linked address); the mapper
returns `null` rather than fabricating empty strings. This mirrors the defensive
nullability already used in `PublicEventResponse` (`city`/`state`/`latitude`/`longitude`
are `string | null` / `number | null` today even though the current query only reaches
them via `innerJoin`).

**Alternatives considered:**
- Extend `PublicEventResponse` in place with the extra fields — rejected: the list
  response intentionally stays flat/lean for the catalog payload; nesting `address` only
  in the detail response keeps both shapes single-purpose and avoids widening the list
  payload for a field only the detail page needs.

### 4. Frontend data fetching

**Decision:** New `fetchPublicEventDetail(documentId)` in
`public-events.service.ts` (or a sibling `public-event-detail.service.ts`) calling the
new endpoint, wrapped by a `usePublicEventDetailQuery(documentId)` (`useQuery`, not
infinite). The route loader is not used for data fetching (consistent with
`EventsDiscoverPage`, which fetches client-side via TanStack Query) — the detail page
shows its own loading/error/not-found states rather than a router-level loader, keeping
the pattern consistent with the rest of `apps/web`.

**Alternatives considered:**
- TanStack Router `loader` with `ensureQueryData` — more idiomatic for SSR-first data,
  but the existing discovery page and its query hooks don't use loaders; introducing the
  pattern here alone would be inconsistent. Can be revisited later as a cross-cutting
  change if the team adopts loaders broadly.

### 5. Discovery list navigation replaces inline selection

**Decision:** `EventsDiscoverListItem`'s "Ver evento" button becomes a router `Link` to
`/events/$documentId` instead of calling `onSelectEvent`. Clicking a **map marker** still
calls the existing `onSelectEventId` → `handleSelectEvent` path for map pan/highlight
only (no page navigation), since marker selection is about orienting on the map, not
opening a permalink. `EventsDiscoverSelection` component is deleted; its "Entradas
próximamente" copy moves to the new detail page's `events:discover.detail.*` namespace.

## Risks / Trade-offs

- **[Risk]** Two similarly-named event-detail concepts exist (`EventResponse` for owners,
  `PublicEventDetailResponse` for public) → **Mitigation**: distinct names, distinct
  routes, distinct guards; no shared handler logic to keep authorization boundaries clear.
- **[Risk]** Removing `EventsDiscoverSelection` changes existing UX (no more inline
  preview while panning the map) → **Mitigation**: explicitly called out in the proposal
  and confirmed with the user; map marker click still pans/highlights without navigating.
- **[Risk]** `address` nullability on the detail DTO adds a null-check the list DTO
  doesn't need → **Mitigation**: current data always has an address (inner join), so this
  is a defensive/future-proofing null, not an expected runtime case; UI shows the
  no-address hint pattern already used elsewhere (`noCoordinatesHint`).

## Migration Plan

No data migration. Deploy order: db repository → types/validators → api → web. Existing
`/events` list keeps working unchanged until the web navigation task lands; the new route
and endpoint are additive until the list-item change ships.

## Open Questions

None outstanding — navigation behavior, page content scope, and not-found handling were
confirmed with the user before writing this design.
