# Spec 040 - Landing Events Preview

## Context and Objective

The public landing `#eventos` section still shows static preview cards and “coming soon” copy even when published events exist in the catalog. Visitors should see up to three real published events (cover-led grid) with a path to the full `/events` list, while keeping a calm empty state when none are published.

## Users / Actors

- Unauthenticated visitors on `apps/web` landing
- Authenticated customers on the same landing (no guest-only notify CTA)

## User Stories

- H1: As a visitor, I want to see real published events on the landing so that I know Lumina has a live agenda.
- H2: As a visitor, I want each preview to open the event detail so that I can continue discovery without hunting the nav.
- H3: As a visitor when no events are published, I want the existing coming-soon messaging so that the section stays honest.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN the landing events section renders, THE SYSTEM SHALL load published events via the same public listing path used by `/events` (`usePublicEventsInfiniteQuery` / `fetchPublicEvents`).
- RF-2: WHEN at least one published event exists, THE SYSTEM SHALL show up to three events as a cover grid/row; each item SHALL link to `/events/$slug`.
- RF-3: WHEN at least one published event exists, THE SYSTEM SHALL show a “Ver todos” (EN equivalent) control linking to `/events`.
- RF-4: IF zero published events are returned, THEN THE SYSTEM SHALL keep the coming-soon headline/support and notify CTA pattern (session-aware auth CTA); THE SYSTEM SHALL NOT show fake static preview event cards.
- RF-5: WHILE the public events query is loading, THE SYSTEM SHALL show non-blocking skeletons for the preview grid.
- RF-6: IF the public events query fails, THEN THE SYSTEM SHALL show a short recoverable message and a link to `/events`.
- RF-7: THE SYSTEM SHALL keep section landmark `#eventos` and bilingual copy via `@repo/i18n` `landing` namespace (plus existing event date/place formatters where reused).

## Non-Functional Requirements

- No new npm dependencies.
- Dark and light themes remain first-class; reduced-motion: no decorative scale flourishes required for this section.
- Prefer reusing existing public-events hook/service rather than duplicating HTTP.

## Edge Cases

- Empty list (0 events): empty/coming-soon UI only.
- Events without images: show `NotImage` (or equivalent) placeholder; link still works.
- Long event names: clamp; no overflow.
- Authenticated visitor: hide guest notify/register CTA in empty state; keep section readable.

## Out of Scope

- Filters, infinite scroll, or coverflow from the full discover page
- Changing the public events API contract
- Dashboard/admin surfaces
- Fake atmosphere tiles from `LANDING_IMAGES.events` when live data is available

## Definition of Done

- Landing `#eventos` shows live preview (cap 3) or empty/coming-soon with notify
- Loading and error states covered
- i18n ES/EN updated; static preview item keys unused/removed from UI
- Manual check dark/light + empty/live paths

## Open Questions

- None blocking (confirmed: grid of covers, cap 3 + Ver todos, keep empty coming-soon copy).
