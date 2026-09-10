# Spec 038 - Dashboard Landing Flowform Composition

## Context and Objective

The owner dashboard landing (`apps/dashboard`) already has marketing sections and a product promo. This feature recomposes it with the same Flowform-inspired language as web 037—large type, air, elevated opaque surfaces, list patterns—under Citrus Soft, tailored to venue owners. The product stage is a local owner-promo video panel that overlaps the hero (same chrome language as web about).

## Users / Actors

- Venue owners evaluating Lumina before register/login
- Staff candidates (secondary; discovery only)

## User Stories

- H1: As an owner, I want a brand-first hero and clear product demo so that I understand the panel quickly.
- H2: As an owner, I want features/audiences presented with air and product surfaces so that the page feels curated, not a dense marketing grid.
- H3: As a visitor with reduced motion, I want the demo video to stay paused so that motion never blocks understanding.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN the dashboard landing hero renders (`#inicio`), THE SYSTEM SHALL show brand-level display type and owner headline/CTAs over a local static hero image with contrast scrim — no full-bleed autoplay background video.
- RF-2: WHEN the demo section renders (`#demo`), THE SYSTEM SHALL embed `LANDING_VIDEOS.promo` with poster (`LANDING_IMAGES.demoPoster`) on an opaque elevated panel (`.panel`); the video SHALL be `muted`, `playsInline`, and `loop`; WHEN it is sufficiently in view and reduced motion is not preferred, THE SYSTEM SHALL play it; WHEN it leaves view or reduced motion is preferred, THE SYSTEM SHALL pause it; THE SYSTEM SHALL NOT rely on native `controls` or a hero-backdrop autoplay.
- RF-3: THE SYSTEM SHALL recompose features/how/audiences/value/social/faq/cta as airy list / split patterns (features: numbered list with icons, not identical icon-card grids); radii ≤ `rounded-app` scale.
- RF-4: THE SYSTEM SHALL keep bilingual copy via `@repo/i18n` dashboardLanding (ES/EN) and dark/light themes.
- RF-5: THE SYSTEM SHALL keep header nav anchors: `#features`, `#how`, `#audiences`, `#faq` (hero `#inicio`, demo `#demo`).
- RF-6: IF the user prefers reduced motion, THEN THE SYSTEM SHALL keep Reveal usable without gating content on motion and SHALL keep the demo video paused.

## Non-Functional Requirements

- Reuse Citrus Soft tokens; no cream/teal Flowform clone; no new dependencies.
- Local images/video under `apps/dashboard/public/landing/` (`hero.png`, `audiences.jpg`, `value.jpg`, `owner-promo.mp4`, `owner-promo-poster.jpg`).
- Contrast AA; no ghost-card border+wide-shadow pairs.
- Demo/about-style panels use opaque `.panel` (border + `shadow-glass`), not transparent glass.

## Edge Cases

- Missing promo video: browser empty media is acceptable; poster should still show.
- Reduced motion: demo never auto-plays.
- Off-screen demo: video pauses to save work.

## Out of Scope

- Web landing (037)
- Changing global DESIGN.md tokens
- Invented metrics/stats

## Definition of Done

- Dashboard landing composition: hero (static image) → overlapping demo stage → features → how → audiences → value → social → faq → cta
- Demo: poster + in-view muted loop play / pause; reduced-motion safe; opaque `.panel`
- Header nav anchors: `#features`, `#how`, `#audiences`, `#faq`
- Vitest landing contracts pass
- Dark/light checked

## Open Questions

- None blocking; behavior matches `SectionDemo` / landing module as shipped.
