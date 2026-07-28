## Context

`event-detail-content.tsx` currently renders: `EventDetailGallery` (hero image + thumbnail
row) → header (title + share) → schedule → description → address (text + inline map when
coordinates exist) → tickets placeholder. The user wants a carousel-led layout, visually
consistent with the `/events` discovery cover-flow (`EventsDiscoverCoverflow`), with the
map moved to the very bottom of the page — mirroring the reference layout on Eventbrite
(hero → info → location/map at the end).

## Goals / Non-Goals

**Goals:**

- Replace the hero+thumbnails gallery with a full-width carousel, reusing the discover
  cover-flow's visual language (banner aspect, gradient scrim, pill dots + chevrons) so the
  two pages feel like the same product.
- Reorder `EventDetailContent` so the map is the last section, after schedule,
  description, address text, and the tickets placeholder.
- Keep today's data scope — no organizer/price/FAQ/related-events sections.

**Non-Goals:**

- No lightbox / full-screen viewer.
- No API/DB changes (`images` already ships on `PublicEventDetailResponse`).
- No shared `@repo/ui` carousel component in v1 (event-detail-local, same call as the
  discover cover-flow).

## Decisions

1. **Component:** new `apps/web/app/modules/events/components/event-detail/event-detail-carousel.tsx`,
   structurally modeled on `EventsDiscoverCoverflow` (same `framer-motion`
   `AnimatePresence`/`motion.div` pattern, `aspect-19/9` banner, pill-shaped dot/chevron
   controls below the image) but simplified for this context:
   - No `onActivate` / click-to-navigate (the visitor is already on the detail page).
   - No title overlay on the image (the event name is already the page's `<h1>` right
     below the carousel — repeating it would be redundant).
   - Accepts `images: EventImageResponse[]` and `eventName` directly (no separate slide
     mapping util needed since there's no cross-event navigation payload to build).
   - Zero images → reuse the existing `NotImage` empty-state (same as today's gallery).
   - One image → render it without the dots/chevrons pill (matches the discovery
     cover-flow's `slides.length > 1` guard).

2. **Section order:** move the `<EventDetailMap>` block out of the `address` section and
   render it as the last element in `EventDetailContent`, after the "Entradas
   próximamente" placeholder. The address section keeps only the text (and the
   "no coordinates" hint); the map becomes its own trailing block with its own heading
   (`discover.detail.mapAriaLabel` already covers the accessible name — add a visible
   `t('discover.detail.locationTitle')` heading consistent with the other `<h2>` sections
   if one doesn't already read naturally from context).

3. **Remove `EventDetailGallery`:** delete the file once the new carousel replaces its
   only usage; drop `galleryLabel`/`galleryAlt`/`galleryThumbAlt` i18n keys if nothing else
   references them (grep before removing).

4. **Tokens/styling:** reuse the same design tokens as the discover cover-flow
   (`surface-strong`, `on-surface`, `rounded-app-lg`, `hairline`) so both carousels are
   visually identical in chrome, differing only in overlay content.

## Risks / Trade-offs

- **[Risk] Visual duplication between the two cover-flow components** → Accepted for v1
  (mirrors the discover cover-flow's own "local component first" decision); revisit a
  shared `@repo/ui` primitive if a third consumer appears.
- **[Risk] Moving the map to the bottom increases scroll distance to reach it** → Accepted:
  matches the explicit product/reference request (Eventbrite pattern) and keeps textual
  address info reachable earlier for visitors who don't need the map.

## Migration Plan

1. Build `EventDetailCarousel` → swap into `EventDetailContent` in place of
   `EventDetailGallery` → reorder sections (map to the end) → delete
   `event-detail-gallery.tsx` → prune unused i18n keys → lint/type-check.
2. Rollback: restore `EventDetailGallery` usage and original section order (git revert).

## Open Questions

- None blocking — carousel styling, theming, and section scope were confirmed with the
  user before writing this design.
