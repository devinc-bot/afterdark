## 1. Types, validators, and routes config

- [x] 1.1 Add `PublicEventDetailResponse` to `packages/types/src/dto/event.ts` (nested `address` with `street`, `streetNumber`, `city`, `state`, `latitude`, `longitude`, or `null`) and export it.
- [x] 1.2 Add `getPublic: (documentId: string) => \`/id/${documentId}`to`API_ROUTES.events.path`in`packages/common/src/config/api-routes.ts`.
- [x] 1.3 Confirm `uuidSchema` (from `packages/validators/src/common.ts`) is reused for the new controller param — no new validator needed unless the review turns up a gap.

## 2. Database repository

- [x] 2.1 Add `findPublishedEventByDocumentId(documentId)` in `packages/db/src/repositories/events/`, joining events ⋈ locations ⋈ locationAddressesLnk ⋈ addresses, filtered by `documentId` + `status = published`, returning `{ event, location, address } | null`.
- [x] 2.2 Export the new repository function from `packages/db/src/repositories/events/index.ts` (and top-level `@repo/db` index if required by existing conventions).



## 3. API — public detail endpoint

- [x] 3.1 Add `GetPublicEventByDocumentIdUseCase` in `apps/api/src/modules/events/application/` using the new repository function + `findEventImageAssetsByEventIds` for all images; throw `NotFoundException` (translated) when the event is missing or not published.
- [x] 3.2 Add `toPublicEventDetailResponse` mapper in `apps/api/src/modules/events/mappers/events.mapper.ts`.
- [x] 3.3 Add `GET API_ROUTES.events.path.getPublic(':documentId')` to `EventsController` (no guards, `uuidSchema`-validated param), registered in `events.module.ts`.



## 4. Web — data fetching

- [x] 4.1 Add `fetchPublicEventDetail(documentId)` to `apps/web/app/modules/events/services/public-events.service.ts`, calling the new endpoint and mapping API errors via `toApiServiceError` with Spanish fallback copy.
- [x] 4.2 Add `usePublicEventDetailQuery(documentId)` in `apps/web/app/modules/events/queries/` (`useQuery`, not infinite), treating a 404 as a distinct "not found" result the page can render explicitly.



## 5. Web — detail page UI

- [x] 5.1 Add route `apps/web/app/routes/_public/events.$documentId.tsx` rendering an `EventDetailPage` component (loading, error, and not-found states; `usePageTitle` with the event name once loaded).
- [x] 5.2 Build `EventDetailPage` and subcomponents in `apps/web/app/modules/events/components/` (or a new `event-detail/` subfolder): image gallery, description, schedule, full address, embedded map (single marker, reusing `@repo/ui` MapLibre wrapper), share/copy-link action, "Entradas próximamente" placeholder.
- [x] 5.3 Add the "Evento no encontrado" not-found state with a link back to `/events`.



## 6. Web — discovery list navigation change

- [x] 6.1 Change `EventsDiscoverListItem`'s "Ver evento" button to a router `Link` to `/events/$documentId` (keep existing ARIA label logic), removing its dependency on `onSelect` for navigation purposes.
- [x] 6.2 Remove `EventsDiscoverSelection` usage and the `selectedEventId`-driven inline card from `EventsDiscoverPage`; keep map-marker click wired to `handleSelectEvent` for pan/highlight only (no navigation).
- [x] 6.3 Delete `apps/web/app/modules/events/components/events-discover-selection.tsx` once unused.



## 7. i18n

- [x] 7.1 Add `events.discover.detail.*` keys (ES + EN) for the new page: title/meta title, gallery alt/labels, address, map, share action + confirmation, "Entradas próximamente", not-found title/description/back-link.
- [x] 7.2 Remove now-unused `events.discover.selection.*` keys once `EventsDiscoverSelection` is deleted (keep `ticketsSoon` copy text, moved under `detail.*`).



## 8. Verification

- [x] 8.1 Manually verify: discovery list → "Ver evento" navigates to `/events/$documentId`; map marker click still pans without navigating; direct URL access works; not-found state shows for an invalid/unpublished/missing id; `pnpm lint` and `pnpm type-check` pass.