## Context

Event detail currently uses a custom framer-motion carousel
(`event-detail-carousel.tsx`) with manual index state, AnimatePresence crossfades, and
pill chevrons/dots. The design system already centralizes UI in `packages/ui` via
shadcn. Embla (under shadcn Carousel) provides swipe + a11y; the Embla
[Parallax](https://www.embla-carousel.com/docs/examples/predefined#parallax) example
tweens an inner image layer with `translateX` based on `scrollProgress` /
`scrollSnapList`.

## Goals / Non-Goals

**Goals:**

- Install shadcn Carousel once in `@repo/ui` and export it for apps.
- Rebuild event detail hero on Carousel + Embla parallax tween.
- Delete the custom framer-motion detail carousel logic.
- Keep `aspect-19/9`, tokens, empty/`NotImage`, and Spanish i18n.

**Non-Goals:**

- Discover coverflow replacement.
- Autoplay / thumbnails / vertical carousel.
- API or image schema changes.

## Decisions

### 1. Carousel lives in `packages/ui`

- **Choice:** `pnpm dlx shadcn@latest add carousel` from `packages/ui` (per
  `components.json`), export from `@repo/ui`.
- **Why:** Shared primitive; matches [shadcn Carousel docs](https://ui.shadcn.com/docs/components/radix/carousel).
- **Alternative:** App-local Embla only — rejected (duplicates deps / styling).

### 2. Parallax is a tween on the detail carousel, not a new ui primitive

- **Choice:** Keep generic `Carousel` / `CarouselContent` / `CarouselItem` /
  `CarouselPrevious` / `CarouselNext` in ui. Implement parallax (TWEEN_FACTOR,
  `setTweenNodes`, `onScroll` → `translateX` on `.embla__parallax__layer` or equivalent)
  inside `apps/web` `event-detail-carousel.tsx` using `setApi` / Embla API.
- **Why:** Parallax is product-specific; ui stays reusable.
- **Alternative:** Fork a `ParallaxCarousel` in ui — deferred until a second consumer.

### 3. Loop and controls

- **Choice:** `opts={{ loop: images.length > 1, align: 'start' }}`; show
  Previous/Next only when `images.length > 1`. Optional dots via Embla `selectedScrollSnap`
  if we keep parity with the old UI; otherwise chevrons + swipe are enough for v1.
- **Assumption for proposal:** Keep prev/next; dots optional if cheap with `setApi`.

### 4. Reduced motion

- **Choice:** When `prefers-reduced-motion: reduce`, skip applying parallax translate
  (or set tween factor to 0); Embla scroll still works.

### 5. Discover coverflow untouched

- **Choice:** Out of scope (documented assumption). User can open a follow-up change.

## Risks / Trade-offs

- **[Risk] Parallax + loop edge cases** → Use Embla’s parallax pattern that supports
  loop (scrollSnapList + progress diff); test with 2+ images.
- **[Risk] Extra Embla package weight** → Acceptable; one shared dependency for future
  carousels.
- **[Risk] Visual regression vs coverflow-like hero** → Keep `aspect-19/9` and rounded
  shell; parallax is internal to the slide.

## Migration Plan

1. Add carousel to `@repo/ui`, export, type-check package.
2. Rewrite `event-detail-carousel.tsx` to compose Carousel + parallax.
3. Remove dead framer-motion-only code from that file (framer-motion remains for buy
   button etc.).
4. Manual QA on `/events/$documentId` with 0 / 1 / N images + reduced motion.

## Open Questions

- None blocking if scope stays “detail only”. If discover coverflow should also move to
  Embla, that is a separate change.
