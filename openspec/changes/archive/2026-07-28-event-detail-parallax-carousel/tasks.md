## 1. Shared UI — shadcn Carousel

- [x] 1.1 From `packages/ui`, add the shadcn `carousel` component (`pnpm dlx shadcn@latest add carousel`), pin Embla deps per STYLEGUIDE, and export Carousel primitives from `@repo/ui`.
- [x] 1.2 Confirm `pnpm --filter @repo/ui type-check` (or package equivalent) passes with the new exports.

## 2. Event detail carousel rewrite

- [x] 2.1 Rewrite `event-detail-carousel.tsx` to compose `@repo/ui` Carousel + Embla parallax tween (scrollProgress / scrollSnapList → translateX on the image layer), keeping `aspect-19/9`, `NotImage` empty state, and existing i18n aria/prev/next keys.
- [x] 2.2 Hide prev/next (and dots if present) when there is zero or one image; disable or zero-out parallax under `prefers-reduced-motion`.
- [x] 2.3 Remove leftover custom framer-motion carousel code from the detail carousel (no dead imports).

## 3. Verification

- [x] 3.1 Manual check on `/events/$documentId` with 0 / 1 / N images (swipe + prev/next, parallax visible with motion allowed); `pnpm lint` / type-check for touched packages.
