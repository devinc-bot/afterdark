# Spec 037 - Web Landing Flowform Composition

## Context and Objective

The public web landing (`apps/web`) already has an image-led hero (036) but still reads as a linear marketing stack. This feature recomposes the landing using Flowform-inspired composition—large type, air, an elevated panel that overlaps the hero, and an events list+preview—while keeping Repo Citrus Soft identity (citrus primary, soft depth, Montserrat/Inter). No cream/beige clone, no oversized radii, no glass stacks, no teal/purple costume.

## Users / Actors

- Attendees / customers discovering Lumina on `apps/web`
- Organizers reaching the dashboard handoff CTA

## User Stories

- H1: As a visitor, I want a brand-first hero with clear type and one CTA group so that I understand Lumina immediately.
- H2: As a visitor, I want an elevated about panel and an events list+preview so that the page feels curated and product-clear, not generic SaaS cards.
- H3: As an organizer, I still want a clear path to the dashboard so that I can manage events.
- H4: As a visitor with reduced motion preference, I want motion to degrade safely so that content remains readable.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN the landing hero renders, THE SYSTEM SHALL show brand-level display type for Lumina, a short headline and support line, and auth CTAs for unauthenticated visitors (skeleton while session loads).
- RF-2: WHEN the about block renders, THE SYSTEM SHALL present short product copy on an elevated surface that visually overlaps or bridges the hero boundary (soft depth via surface tokens, `rounded-app` scale ≤ ~16px).
- RF-3: WHEN the events section renders, THE SYSTEM SHALL provide a keyboard-accessible list+preview using local `LANDING_IMAGES.events` assets (no invented stats, no Unsplash).
- RF-4: THE SYSTEM SHALL keep bilingual landing copy via `@repo/i18n` (ES/EN) and first-class dark and light themes.
- RF-5: THE SYSTEM SHALL preserve or update in the same change all public section anchors used by the landing header.
- RF-6: IF the user prefers reduced motion, THEN THE SYSTEM SHALL avoid motion that gates content visibility and keep selection/preview usable without entrance animation.
- RF-7: THE SYSTEM SHALL NOT use autoplaying video on the web landing.

## Non-Functional Requirements

- Prefer existing design tokens; do not change global brand tokens or font families in `DESIGN.md`.
- Hero LCP: keep optimized local hero imagery with `fetchPriority="high"` when an image remains in the hero.
- Contrast WCAG AA for text over surfaces and media scrims.
- No new dependencies.

## Edge Cases

- Authenticated visitors: hide auth CTAs, keep discovery content.
- Session loading: keep CTA skeleton behavior.
- Events list with no published dates: preview uses atmosphere imagery; copy remains honest that agenda is not open yet.

## Out of Scope

- Dashboard landing redesign (separate feature 038)
- Admin redesign
- Live event feed / scheduled events API
- Video on web landing
- Full marketing copy rewrite beyond composition-driven trim

## Definition of Done

- Web landing matches Flowform-inspired composition under Citrus Soft constraints (hero → about overlap → how → clarity → events list+preview → closing → organizers)
- Header nav anchors: `#eventos`, `#como-funciona`, `#claridad`
- Dark and light themes usable; reduced motion respected
- Vitest contracts for structure/images/selection updated and passing
- Delivery lead workflow completed for implementation tasks

## Open Questions

- None blocking; direction confirmed in plan (composition A, web first).
