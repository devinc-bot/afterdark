## 1. Dependency

- [x] 1.1 Pin `framer-motion` on `apps/web` (STYLEGUIDE: exact version) and install.

## 2. Cover-flow UI

- [x] 2.1 Add `events-discover-coverflow.tsx` adapted from Amicro CardCoverFlow (motion springs, chevrons, dots), styled with web design tokens; accept slides `{ documentId, src, title }` and call `onActivate(documentId)`.
- [x] 2.2 Add a small helper (or inline) to build slides from `PublicEventResponse[]` using each event’s first image; hide when empty.

## 3. Wire discover page

- [x] 3.1 Replace the map section in `EventsDiscoverPage` with the cover-flow; navigate to `/events/$documentId` on slide activate; reset active index when filters change.
- [x] 3.2 Remove map selection/focus state and simplify list props (`selectedEventId` / map-driven highlight) once unused.

## 4. Cleanup map

- [x] 4.1 Delete `events-discover-map.tsx` and any dead imports/refs (list `focusOnMap` copy usage if only for map selection).

## 5. i18n

- [x] 5.1 Add `discover.coverflow.*` keys (ES + EN) for aria-label, prev/next; prune unused `discover.map.*` / list map-focus keys if nothing else references them.

## 6. Verification

- [x] 6.1 Manual check: carousel shows first images of loaded events; click → detail; filters rebuild slides; no map on `/events`; `pnpm lint` and `pnpm type-check` pass.
