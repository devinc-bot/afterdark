## Why

The event detail page (`/events/$documentId`) currently opens with a plain hero image + thumbnail row, then stacks title/share, schedule, description, and address+map in that order. The user wants a more visual, carousel-led layout — similar in spirit to the Amicro cover-flow already shipped on `/events` — followed by the event's data, ending with the location map at the very bottom (matching the reference layout on Eventbrite).

## What Changes

- **Replace** `EventDetailGallery` (hero image + thumbnail strip) with a full-width hero carousel component styled consistently with `EventsDiscoverCoverflow` (same motion/token language: rounded banner, gradient scrim, pill-shaped dots + chevrons below).
- **Reorder** `EventDetailContent` sections so the map is the **last** element on the page: carousel → title/share → schedule → description → address (text) → map.
- Keep the existing data scope (no organizer, price, FAQ, or related-events sections — those fields don't exist in `PublicEventDetailResponse` today).
- Add/prune `discover.detail.*` i18n keys for the new carousel (aria-label, prev/next) in ES + EN; remove gallery-thumbnail keys that become unused.

## Non-goals

- No API, DB, or validator changes (`images` already ships on the detail payload).
- No lightbox / full-screen image viewer.
- No organizer, pricing, FAQ, or "related events" sections (no backing data).
- No changes to `EventDetailMap` internals — only its position in the page.
- No shared `@repo/ui` extraction for the carousel; keep it event-detail-local (mirrors the discover cover-flow's own local-first decision).

## Capabilities

### New Capabilities

- _(none)_

### Modified Capabilities

- `public-events-discovery`: the event detail requirement changes from "hero image + thumbnail gallery" to "full-width image carousel", and the section order changes so the map renders after all other event data instead of inline within the address section.

## Impact

- **Apps:** `apps/web` (new `event-detail-carousel.tsx`, changes to `event-detail-content.tsx`, removal of `event-detail-gallery.tsx`).
- **Packages:** `packages/i18n` (new `discover.detail.carousel*` keys; prune unused gallery-thumbnail keys if nothing else references them).
- **Dependencies:** none new (`framer-motion` already pinned on `apps/web`).
- **API / db / validators / dashboard:** none.
