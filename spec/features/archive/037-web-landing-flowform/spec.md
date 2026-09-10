# Spec 037 - Web Landing Flowform Composition

## Context and Objective

The public web landing (`apps/web`) already has an image-led hero (036) but still reads as a linear marketing stack. This feature recomposes the landing using Flowform-inspired composition—large type, air, an elevated opaque panel that overlaps the hero, and an events list+preview—while keeping Lumina Citrus Soft identity (citrus primary, soft depth, Montserrat/Inter). No cream/beige clone, no oversized radii, no glass/transparent stacks, no teal/purple costume.

## Users / Actors

- Attendees / customers discovering Lumina on `apps/web`
- Organizers reaching the dashboard handoff CTA

## User Stories

- H1: As a visitor, I want a brand-first hero with clear type and one CTA group so that I understand Lumina immediately.
- H2: As a visitor, I want an elevated about panel and an events list+preview so that the page feels curated and product-clear, not generic SaaS cards.
- H3: As an organizer, I still want a clear path to the dashboard so that I can manage events.
- H4: As a visitor with reduced motion preference, I want motion to degrade safely so that content remains readable.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN the landing hero renders, THE SYSTEM SHALL show brand-level display type for Lumina (`#inicio`), a short headline and support line over a local hero image with contrast scrim, and auth CTAs for unauthenticated visitors (skeleton while session loads).
- RF-2: WHEN the about block renders, THE SYSTEM SHALL present short product copy plus local about imagery on an opaque elevated surface (`bg-surface-container-low` + `.panel` border/shadow, `rounded-app`) that overlaps the hero boundary via negative margin — no `glass-panel` / backdrop-blur transparency.
- RF-3: WHEN the events section renders (`#eventos`), THE SYSTEM SHALL provide a keyboard-accessible list (`button` + `aria-pressed`) and featured preview using local `LANDING_IMAGES.events` assets (no invented stats, no Unsplash).
- RF-4: THE SYSTEM SHALL keep bilingual landing copy via `@repo/i18n` (ES/EN) and first-class dark and light themes.
- RF-5: THE SYSTEM SHALL keep header nav anchors aligned to rendered sections: `#eventos`, `#como-funciona`, `#claridad` (plus `#inicio` on the hero; organizers via `#organizadores` / footer).
- RF-6: IF the user prefers reduced motion, THEN THE SYSTEM SHALL avoid motion that gates content visibility and keep selection/preview usable without entrance animation.
- RF-7: THE SYSTEM SHALL NOT use video on the web landing.

## Non-Functional Requirements

- Prefer existing design tokens; do not change global brand tokens or font families in `DESIGN.md`.
- Hero LCP: local hero imagery with `fetchPriority="high"`.
- Contrast WCAG AA for text over surfaces and media scrims.
- No new dependencies.

## Edge Cases

- Authenticated visitors: hide auth CTAs, keep discovery content.
- Session loading: keep CTA skeleton behavior.
- Events preview: selected item shows the matching local event image; copy stays honest that live agenda may not be open yet.

## Out of Scope

- Dashboard landing redesign (separate feature 038)
- Admin redesign
- Live event feed / scheduled events API
- Video on web landing
- Full marketing copy rewrite beyond composition-driven trim

## Definition of Done

- Web landing composition: hero → opaque about overlap → how → clarity → events list+preview → closing CTA → organizers
- Header nav anchors: `#eventos`, `#como-funciona`, `#claridad`
- About panel opaque (`.panel`, no glass blur)
- Dark and light themes usable; reduced motion respected
- Vitest contracts for structure/images/selection updated and passing

## Open Questions

- None blocking; composition delivered as implemented in `apps/web` landing module.
