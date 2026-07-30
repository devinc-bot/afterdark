## Context

`/events` (apps/web) currently mounts `EventsDiscoverMap` above filters and an infinite list. Catalog items already include `images: EventImageResponse[]`. Product decision: replace the map with an Amicro-style CardCoverFlow (3D cover-flow) fed by each loaded event’s first image; slide activation navigates to `/events/$documentId`. Map is removed entirely from discover.

## Goals / Non-Goals

**Goals:**

- Ship a discover-local cover-flow visually close to the Amicro sample (spring motion, rotateY, dots, chevrons).
- Wire slides to filtered infinite-scroll results (first image only).
- Navigate to event detail on slide activate.
- Remove map component and selection/focus state that only served the map.
- Pin a motion library on `@repo/web`; Spanish i18n for carousel chrome.

**Non-Goals:**

- API/DB changes; shared cover-flow in `@repo/ui` (unless a trivial extract later).
- Drag/swipe physics beyond the sample’s click + arrows + dots.
- Keeping a discover map in another layout slot.

## Decisions

1. **Component location:** `apps/web/app/modules/events/components/events-discover-coverflow.tsx` (discover-local), adapted from the Amicro CardCoverFlow snippet — not a generic `@repo/ui` export in v1.
   - Alternative: put in `@repo/ui` — deferred until a second consumer exists.

2. **Motion library:** pin `framer-motion` on `@repo/web` (same import surface as the sample: `motion` from `framer-motion`). Follow STYLEGUIDE pinned versions.
   - Alternative: CSS-only — rejected; sample relies on spring `x` / `rotateY` / `z`.

3. **Slide model:** derive `{ documentId, src, title }` from `events.filter(e => e.images[0]).map(...)` using `images[0].url` and `event.name`. Update when `events` grows (infinite scroll) or filters reset.
   - Empty: do not render the cover-flow section.

4. **Navigation:** `useNavigate` / `Link` to `/events/$documentId` with `params: { documentId }` on slide activate (active card click or explicit activation). Prefer programmatic navigate on card click to match sample click handlers; ensure keyboard focusability (button role or link semantics).

5. **Remove map wiring:** delete `events-discover-map.tsx`; drop `mapFocus` / `selectedEventId` / `handleSelectEvent*` from the page; simplify list props (remove `selected` highlight driven by map selection). Clean unused `discover.map.*` / `focusOnMap` keys if unused after removal. Keep event-detail map keys untouched.

6. **Tokens / styling:** adapt Amicro zinc/white chrome to web design tokens (`surface`, `on-surface`, `hairline`, `rounded-app`) so light/dark themes stay coherent; keep aspect ratio and 3D perspective behavior.

## Risks / Trade-offs

- **[Risk] Bundle size from framer-motion** → Mitigation: dependency only on `@repo/web`; dynamic import only if measured as a problem later (v1 static import is fine).
- **[Risk] Cover-flow only reflects loaded pages, not full result set** → Acceptable: same constraint the map had with infinite scroll; document in UX.
- **[Risk] Events without images invisible in carousel but present in list** → Expected; list remains source of truth for all matches.
- **[Risk] Active index out of range when filters reset** → Reset `activeIndex` when `filtersKey` / slide list identity changes.

## Migration Plan

1. Add dependency → implement cover-flow → swap into page → delete map → prune i18n → lint/type-check.
2. Rollback: restore map section and remove cover-flow (git revert of the change).

## Open Questions

- None blocking (product choices locked: navigate on click; first image; remove map).
