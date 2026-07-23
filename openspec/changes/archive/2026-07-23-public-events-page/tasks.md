## 1. Shared contracts

- [x] 1.1 Add public discovery DTO types in `@afterdark/types` (list item with location name, city/state, coords, optional distance; paginated response shape)
- [x] 1.2 Add `listPublicEventsQuerySchema` in `@afterdark/validators` (pagination + optional date range, city/state, lat/lng; default-friendly `limit=5`)
- [x] 1.3 Register public list route constant in `@afterdark/common` API routes (keep owner routes unchanged)

## 2. Database

- [x] 2.1 Add repository `find-published-events-paginated` (join event → location → address; filters by date/city/state; order by `startsAt`; export from package index)
- [x] 2.2 Confirm address lat/lng join path needs no migration; document gap only if coords missing

## 3. API

- [x] 3.1 Add anonymous public list use-case + mapper returning only `published` events with discovery fields
- [x] 3.2 Expose `GET` public catalog on events controller **without** JWT; leave owner CRUD/`my-events` guards intact
- [x] 3.3 Smoke-check: unauthenticated call returns published-only; invalid query rejected via validators

## 4. i18n

- [x] 4.1 Add Spanish keys for `/events` (page title, filters labels, empty list, load errors, infinite-scroll loading)

## 5. Web — route & navigation

- [x] 5.1 Add `WEB_ROUTES.events` and TanStack route file `createFileRoute('/events')` (string literal); scaffold module under `apps/web/app/modules/events/`
- [x] 5.2 Point landing header (and footer if same nav) “Eventos” from `#eventos` to `/events`

## 6. Web — discovery UI

- [x] 6.1 Implement events service/client calling public catalog (page size 5; pass date/city/state filters)
- [x] 6.2 Build filters panel (date range + city/state) left of list; changing filters resets to page 1
- [x] 6.3 Build infinite-scroll list (5 per page) with Spanish empty/error/loading states
- [x] 6.4 Render MapLibre map (`@afterdark/ui`) above the filters/list; markers from accumulated loaded pages; center on loaded markers / sensible default
