# Tasks 040 - Landing Events Preview

- [x] 1. Add `landing.events` i18n keys for live/empty/loading/error/viewAll (ES + EN); stop relying on `events.items.*` in UI
- [x] 2. Rewrite `SectionEvents` to use `usePublicEventsInfiniteQuery`, cap 3 cover grid linking to `/events/$slug`, Ver todos → `/events`, empty/coming-soon + notify, loading skeletons, error message
- [x] 3. Update brittle landing source tests / optional `LANDING_IMAGES.events` cleanup so checks match the live preview
