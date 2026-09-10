# Plan 036 - Web Landing Redesign

## Approach

Recompose `apps/web` landing as an image-led brand surface:

1. Replace hero video with a full-bleed local image (`LANDING_IMAGES.hero` → `/landing/hero.png`).
2. Point `LANDING_IMAGES` at `public/landing/*` assets (hero, about, events).
3. Slim the page: Hero → About → How → Clarity → Events → Closing CTA → Organizers; drop Atmosphere/Pulse.
4. Keep Citrus Soft tokens; primary citrus on primary CTAs where contrast allows (dark/light).

## Affected layers

- `apps/web` landing module (components, constants)
- `apps/web/public/landing` assets
- `packages/i18n` landing locale keys when sections are removed
- No API, DB, validators, or types changes

## Technical notes

- Remove `LANDING_VIDEOS` / `hero.mp4` from web landing; hero is `<img>` only with soft gradient scrim.
- Prefer existing `Reveal` / layout tokens; avoid new card grids.
- Header nav anchors: `#eventos`, `#como-funciona`, `#claridad` (organizers via `#organizadores` / footer).

## Verification

- Manual: `/` hero loads image, no video network request, themes, reduced motion
- Vitest contracts for `LANDING_IMAGES` local paths and hero source without video
- Delivery workflow: test-engineer → implementation-engineer → quality-reviewer per task
