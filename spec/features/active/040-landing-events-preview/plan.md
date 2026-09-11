# Plan 040 - Landing Events Preview

## Approach

Replace the static tabbed gallery in `SectionEvents` with a data-driven preview that reuses `usePublicEventsInfiniteQuery` and `EMPTY_EVENTS_DISCOVER_FILTERS`. Cap client-side to three items from the first page. Keep editorial landing chrome (heading, badge, surfaces) but switch visual topology to a simple responsive cover grid.

## Technical notes

- Import hook from `apps/web/app/modules/events/queries/use-public-events-infinite-query.ts` (explicit reuse; landing consumes public catalog read model).
- Reuse `formatEventWhen` / `formatEventPlace` from events discover utils.
- Link detail with slug (`/events/$slug`); list with `WEB_ROUTES.events()`.
- i18n: add live badge/headline/support, `viewAll`, list/loading/error strings; keep empty keys (`badge`, `headline`, `support`, `notify.*`); stop using `events.items.*` in UI.
- Update source tests that still assert static gallery (`aria-pressed`, `LANDING_IMAGES.events` in section-events).

## Order of work

1. i18n keys (ES/EN)
2. Rewrite `section-events.tsx` (states + grid)
3. Clean unused static preview wiring / update brittle source tests
