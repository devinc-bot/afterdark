## Why

The event detail page currently uses a hand-rolled framer-motion carousel that duplicates patterns we already get from Embla via shadcn. Switching to the shadcn [Carousel](https://ui.shadcn.com/docs/components/radix/carousel) (Embla) with the official [Parallax](https://www.embla-carousel.com/docs/examples/predefined#parallax) tween gives swipe, accessibility, and a richer scroll effect while keeping one shared carousel primitive in `@repo/ui`.

## What Changes

- Add the shadcn `Carousel` component to `packages/ui` (Embla-based).
- Replace `event-detail-carousel.tsx` so the public event detail hero uses Carousel + Embla parallax tween on slide images.
- Remove the current framer-motion detail carousel implementation (custom index state, pill dots/chevrons built for that component).
- Keep empty / single-image behavior: `NotImage` when no images; no prev/next when only one image.
- Preserve existing i18n keys for carousel aria / alt / prev / next where they still apply.

## Non-goals

- Discover coverflow on `/events` (stays as-is; out of scope).
- Autoplay, thumbnails strip, or vertical orientation.
- Changing the public event detail API / image payload.
- Replacing other framer-motion UI (buy button, etc.).

## Capabilities

### New Capabilities

- (none — behavior folds into existing `public-events-discovery`)

### Modified Capabilities

- `public-events-discovery`: **ADDED** requirement for the event detail hero carousel — MUST use shared shadcn/Embla Carousel with parallax tween (replacing the custom framer-motion carousel). Main `openspec/specs/` does not yet document the detail carousel; this change adds that requirement as a delta.

## Impact

- **packages/ui**: new `carousel` component + Embla deps (`embla-carousel-react`, etc.).
- **apps/web**: rewrite `event-detail-carousel.tsx`; wire stays in `event-detail-content.tsx`.
- **packages/i18n**: likely keep existing `discover.detail.carousel*` keys; only adjust if control labels change.
- No API / db / dashboard impact.
