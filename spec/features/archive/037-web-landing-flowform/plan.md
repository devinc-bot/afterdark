# Plan 037 - Web Landing Flowform Composition

## Approach

Recompose `apps/web` landing as a Flowform-inspired brand surface under Citrus Soft:

1. Hero: brand-first large type + local hero image + soft scrim + auth CTAs (`#inicio`).
2. About: opaque overlapping panel (`bg-surface-container-low` + `.panel`) bridging hero → content; local `LANDING_IMAGES.about`.
3. Events: list + featured preview with local event images; `button` / `aria-pressed` selection.
4. How + Clarity: airy one-idea sections; no per-section eyebrows.
5. Closing CTA + Organizers + footer polish.
6. Update header anchors and i18n as needed; extend Vitest contracts.

## Affected layers

- `apps/web` landing module (components, constants, tests)
- `apps/web/app/modules/common/components/landing-header.tsx` (nav anchors)
- `packages/i18n` landing locales (ES/EN)
- Assets under `apps/web/public/landing/`
- Shared UI: `.panel` utility in `packages/ui` globals (opaque border + `shadow-glass`)
- No API, DB, validators, or types changes

## Technical notes

- Keep `rounded-app` (≈12–16px); ban 32px+ card radii and ghost-card border+wide-shadow pairs.
- Do not use `glass-panel` / `backdrop-blur` on the about stage — opacity is required because the panel overlaps the hero.
- Events selection: React state + `aria-pressed` buttons (not listbox).
- Preserve `Reveal` with reduced-motion safe defaults (content visible without motion class).

## Verification

- Manual: `/` on web — hero, opaque overlap panel, events preview keyboard, themes, reduced motion
- `pnpm exec vitest run apps/web/app/modules/landing`
- Lint/type-check touched packages when applicable
