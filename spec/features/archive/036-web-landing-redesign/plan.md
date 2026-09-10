# Plan 036 - Web Landing Redesign

## Approach

Recompose `apps/web` landing as an image-led brand surface:

1. Replace hero video with a full-bleed local image.
2. Point `LANDING_IMAGES` at `public/landing/*.png` assets generated for this feature.
3. Slim the page: keep Hero → About/product image → How → Clarity → Events strip → Closing CTA → Organizers; drop or merge redundant Atmosphere/Pulse sections that repeat the same message.
4. Keep Citrus Soft tokens; optionally restore primary citrus on primary CTAs where contrast allows (dark/light).

## Affected layers

- `apps/web` landing module (components, constants)
- `apps/web/public/landing` assets
- Possibly `packages/i18n` landing locale keys if sections are removed
- No API, DB, validators, or types changes

## Technical notes

- Remove `LANDING_VIDEOS` usage from `section-hero.tsx`; delete or leave unused `videos.ts` / `hero.mp4` unreferenced.
- Prefer existing `Reveal` / layout tokens; avoid new card grids.
- Header anchors must stay consistent with remaining sections.

## Verification

- Manual: `/` hero loads image, no video network request, themes, reduced motion
- Vitest contracts for `LANDING_IMAGES` local paths and hero source without video
- Delivery workflow: test-engineer → implementation-engineer → quality-reviewer per task
