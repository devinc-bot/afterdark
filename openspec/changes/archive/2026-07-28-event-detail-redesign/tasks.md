## 1. Carousel component

- [x] 1.1 Add `event-detail-carousel.tsx` modeled on `EventsDiscoverCoverflow` (same
      motion/token language: `aspect-19/9` banner, gradient scrim, pill dots + chevrons),
      without click-to-navigate and without a title overlay; accepts
      `images: EventImageResponse[]` + `eventName`; falls back to `NotImage` when empty;
      hides dots/chevrons when there's only one image.

## 2. Wire into event detail content

- [x] 2.1 Replace `EventDetailGallery` with `EventDetailCarousel` in
      `event-detail-content.tsx`.
- [x] 2.2 Reorder sections so `EventDetailMap` renders last (after the tickets
      placeholder), and the address section keeps only the text (+ "no coordinates" hint).

## 3. Cleanup

- [x] 3.1 Delete `event-detail-gallery.tsx` once unused; prune
      `galleryLabel`/`galleryAlt`/`galleryThumbAlt` i18n keys (ES + EN) if nothing else
      references them.

## 4. i18n

- [x] 4.1 Add any new `discover.detail.*` keys needed for the carousel's aria-label and
      prev/next controls (or reuse `discover.coverflow.prev`/`next` if wording fits), ES +
      EN.

## 5. Verification

- [x] 5.1 Manual check: `/events/$documentId` shows the carousel first, then title/share,
      schedule, description, address text, tickets placeholder, and the map last; single-
      or zero-image events render correctly; `pnpm lint` and `pnpm type-check` pass.
