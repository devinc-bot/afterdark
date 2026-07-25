## Context

Owner event APIs today are JWT + OWNER only (`/api/events/my-events`, CRUD). Coordinates live on `address` (via location links), not on the event row. `apps/web` has no `/events` route; landing “Eventos” is `#eventos`. MapLibre already exists in `@repo/ui` and is used in the dashboard location form. Visitors need an anonymous discovery surface: map + filters + infinite list.

Decisions locked with the product owner for this change:

- Filters: date range + city/state (no categories).
- Access: public, no login; only `published` events.
- Catalog ordering: by `startsAt` ascending; **no** visitor geolocation / Haversine / random sort. Place filtering is via city and/or state only.

## Goals / Non-Goals

**Goals:**

- Public catalog API + `/events` UX (map, left filters, infinite list of 5).
- Wire landing nav to `/events`.
- Reuse MapLibre from `@repo/ui`; repository-layer queries in `@repo/db`.

**Non-Goals:**

- Event detail / checkout.
- Dashboard changes.
- New map vendor or schema migration unless a gap is found (lat/lng already on address).
- Visitor geolocation-driven list ordering (distance or random).

## Decisions

### 1. Public endpoint shape

- **Decision:** `GET /api/events` (or `API_EVENTS` public `list` under existing prefix) **without** auth guards; keep owner routes unchanged (`/my-events`, `/:documentId` with ownership).
- **Rationale:** Clear split between public catalog and owner tools; matches “anonymous discovery”.
- **Alternatives:** `/api/public/events` — clearer namespace but diverges from current `API_EVENTS_PREFIX` style; reject unless routing conflicts appear.

### 2. Query contract (validators)

- **Decision:** New `listPublicEventsQuerySchema` in `@repo/validators` extending `paginationSchema` with optional `startsFrom`/`startsTo`, optional `city`/`state`. Web default `limit=5`.
- **Rationale:** Single source of truth; place discovery is city/state filters, not lat/lng query params.
- **Alternatives:** Lat/lng + Haversine — dropped for simpler city/state filtering.

### 3. Repository query

- **Decision:** Repository joins `events` → `locations` → address link → `address`. Filter by published + optional date/city/state. Order by `startsAt` ascending.
- **Rationale:** Matches product simplification; no math extensions / RANDOM pagination flicker.
- **Alternatives:** Haversine / `ORDER BY RANDOM()` — rejected.

### 4. Web module layout

- **Decision:** New `apps/web/app/modules/events/` (or `public-events`) with route file `routes/events.tsx` using string-literal `createFileRoute('/events')`; `WEB_ROUTES.events` for Link/`navigate` only. Compose: map section on top; below, two-column layout (filters left, infinite list right). Mobile: stack filters above list.
- **Rationale:** Matches web module patterns; codegen-safe routes.

### 5. Map centering

- **Decision:** Map markers from loaded list items (address lat/lng). Center on loaded markers / sensible default (e.g. first event with coords). No requirement to call browser geolocation for catalog ordering.
- **Rationale:** List is driven by filters; map is a visual of the same result set.

### 6. Map data vs list data

- **Decision:** v1 — map markers reflect the **currently loaded list pages** (accumulated infinite-scroll items), not a separate unbounded map query. Optionally refetch markers when filters change (reset).
- **Rationale:** Avoids dual endpoints and huge marker payloads.
- **Alternatives:** Separate `bbox` map endpoint — defer.

### 7. Packages touched

| Package / app | Change                                                        |
| ------------- | ------------------------------------------------------------- |
| validators    | Public list query schema                                      |
| types         | Public event list item DTO                                    |
| common        | API route helper                                              |
| db            | `find-published-events-paginated` (+ filters, startsAt order) |
| api           | Public list use-case + controller method (no JWT)             |
| web           | Route, module UI, nav link                                    |
| i18n          | Spanish keys for filters, empty, errors                       |
| ui            | Reuse map only                                                |

**Migrations:** None expected (coords already on `address` for map markers). Confirm join path in `DATABASE.md` during apply.

## Risks / Trade-offs

- **[Risk] Events without address coords still list but may lack map markers** → Mitigation: plot only rows with lat/lng; list still shows city/state text.
- **[Risk] Public endpoint abuse / scraping** → Mitigation: existing rate limits if any; keep payload lean; no owner PII.
- **[Risk] Landing still has `#eventos` marketing section** → Mitigation: only change nav href; leave section content unless product asks.

## Migration Plan

1. Ship validators/types/routes → repository → API (feature-flag not required; new path).
2. Ship web page + nav update.
3. Rollback: remove public route/controller + web route; owner APIs untouched.

## Open Questions

- None blocking implementation. Soft follow-ups: dedicated map bbox endpoint; optional geolocation map-center only.
