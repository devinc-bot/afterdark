# Plan 037 - Web Landing Flowform Composition

## Approach

Recompose `apps/web` landing as a Flowform-inspired brand surface under Citrus Soft:

1. Hero: brand-first large type + integrated event media + auth CTAs; soft scrim for contrast.
2. About: elevated overlapping panel (`surface-raised` / soft depth) bridging hero → content.
3. Events: list + featured preview with local event images; keyboard selection.
4. How + Clarity: airy one-idea sections; no per-section eyebrows.
5. Closing CTA + Organizers + footer polish.
6. Update header anchors and i18n as needed; extend Vitest contracts.

## Affected layers

- `apps/web` landing module (components, constants, tests)
- `apps/web/app/modules/common/components/landing-header.tsx` (nav anchors)
- `packages/i18n` landing locales (ES/EN)
- Assets under `apps/web/public/landing/` (reuse; compress/crop only if needed)
- No API, DB, validators, or types changes

## Technical notes

- Keep `rounded-app` (≈12–16px); ban 32px+ card radii and ghost-card border+wide-shadow pairs.
- Selection state for events: React state in a small client component; accessible `role="listbox"` / `option` or button list with `aria-selected`.
- Preserve `Reveal` with reduced-motion safe defaults (content visible without motion class).
- Delivery: one `tasks.md` item per apply turn; test-engineer → implementation-engineer → quality-reviewer.

## Verification

- Manual: `/` on web — hero, overlap panel, events preview keyboard, themes, reduced motion
- `pnpm exec vitest run apps/web/app/modules/landing`
- Lint/type-check touched packages when applicable
