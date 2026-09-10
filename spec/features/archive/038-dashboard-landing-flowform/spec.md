# Spec 038 - Dashboard Landing Flowform Composition

## Context and Objective

The owner dashboard landing (`apps/dashboard`) already has a pattern hero, demo video, and SaaS sections. This feature recomposes it with the same Flowform-inspired language as web 037—large type, air, elevated surfaces, list+preview patterns—under Citrus Soft, tailored to venue owners. Keep the HyperFrames promo embed as the product stage.

## Users / Actors

- Venue owners evaluating Lumina before register/login
- Staff candidates (secondary; discovery only)

## User Stories

- H1: As an owner, I want a brand-first hero and clear product demo so that I understand the panel quickly.
- H2: As an owner, I want features/audiences presented with air and product surfaces so that the page feels curated, not a dense marketing grid.
- H3: As a visitor with reduced motion, I want controllable video (no autoplay backdrop) so that motion never blocks understanding.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN the dashboard landing hero renders, THE SYSTEM SHALL show brand-level display type and owner headline/CTAs without a full-bleed autoplay background video.
- RF-2: WHEN the demo section renders, THE SYSTEM SHALL embed `LANDING_VIDEOS.promo` with `controls` and a poster (no autoPlay/loop backdrop).
- RF-3: THE SYSTEM SHALL recompose features/how/audiences/value/social/faq/cta with elevated soft-depth surfaces and list patterns; no identical icon-card grids; radii ≤ `rounded-app` scale.
- RF-4: THE SYSTEM SHALL keep bilingual copy via `@repo/i18n` dashboardLanding (ES/EN) and dark/light themes.
- RF-5: THE SYSTEM SHALL preserve or update header section anchors in the same change.
- RF-6: IF the user prefers reduced motion, THEN THE SYSTEM SHALL keep Reveal/demo usable without gating content on motion.

## Non-Functional Requirements

- Reuse Citrus Soft tokens; no cream/teal Flowform clone; no new dependencies.
- Local images/video under `apps/dashboard/public/landing/`.
- Contrast AA; no ghost-card border+wide-shadow pairs.

## Edge Cases

- Missing promo video: browser empty media control is acceptable; poster should still show.
- Reduced motion: no autoplay required.

## Out of Scope

- Web landing (037)
- Changing global DESIGN.md tokens
- Invented metrics/stats

## Definition of Done

- Dashboard landing matches shared Flowform×Citrus visual language with controllable promo demo stage (`LANDING_VIDEOS.promo`, poster + controls, no autoplay backdrop)
- Header nav anchors: `#features`, `#how`, `#audiences`, `#faq`
- Vitest landing contracts pass
- Dark/light + reduced-motion checked

## Open Questions

- None blocking.
