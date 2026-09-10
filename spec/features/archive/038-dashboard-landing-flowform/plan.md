# Plan 038 - Dashboard Landing Flowform Composition

## Approach

1. Align hero typography scale with web brand-first pattern; static local hero image + scrim (no background video).
2. Demo product stage: opaque overlapping `.panel` with copy + `LANDING_VIDEOS.promo` / poster; in-view muted loop via `IntersectionObserver`; pause off-screen and under `prefers-reduced-motion`.
3. Recompose features as numbered airy list (not icon-card grid); how as numbered sequence; audiences/value as split list+image; social/faq/cta with more air.
4. Update i18n only if copy structure needs titles for list patterns.
5. Extend Vitest contracts.

## Affected

- `apps/dashboard/app/modules/landing/**`
- `packages/i18n` dashboard-landing locales if needed
- Public landing assets under `apps/dashboard/public/landing/`
- Shared `.panel` utility (opaque chrome shared with web about)

## Verification

- `pnpm exec vitest run apps/dashboard/app/modules/landing`
- Manual dark/light on dashboard landing; confirm demo pauses with reduced motion
