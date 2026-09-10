# Plan 038 - Dashboard Landing Flowform Composition

## Approach

1. Align hero typography scale with web brand-first pattern (keep diagonal hairline pattern).
2. Elevate demo as product stage (soft ring surface, airy headline).
3. Recompose features as airy list (not icon-card grid); how as numbered sequence; audiences/value as split list+image; social/faq/cta with more air.
4. Update i18n only if copy structure needs titles for list patterns.
5. Extend Vitest contracts.

## Affected

- `apps/dashboard/app/modules/landing/**`
- `packages/i18n` dashboard-landing locales if needed
- Public landing assets (existing)

## Verification

- `pnpm exec vitest run apps/dashboard/app/modules/landing`
- Manual dark/light on dashboard landing
