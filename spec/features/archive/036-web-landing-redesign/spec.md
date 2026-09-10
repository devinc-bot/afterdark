# Spec 036 - Web Landing Redesign

## Context and Objective

The public web landing previously led with a heavy looping hero video and generic remote photography, and repeated the same “clarity / tickets ready” message across too many sections. This feature redesigns the landing to be image-led (no video), shorter, and aligned with Lumina Citrus Soft: cheerful, original, minimal, product-clear.

## Users / Actors

- Attendees / customers discovering Lumina on `apps/web`
- Organizers reaching the dashboard handoff CTA

## User Stories

- H1: As a visitor, I want a fast, image-led first impression so that I understand Lumina before I create an account.
- H2: As a visitor with reduced motion preference, I want a static hero so that motion never blocks understanding.
- H3: As an organizer, I still want a clear path to the dashboard so that I can manage events.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN the landing hero renders, THE SYSTEM SHALL use a full-bleed static image (no autoplaying video).
- RF-2: IF the user prefers reduced motion, THEN THE SYSTEM SHALL keep the same static-image hero without scroll-linked zoom or entrance motion that depends on motion preference.
- RF-3: WHILE unauthenticated, THE SYSTEM SHALL show primary and secondary auth CTAs in the hero (skeleton while session loads).
- RF-4: THE SYSTEM SHALL keep bilingual landing copy via `@repo/i18n` (ES/EN) and first-class dark and light themes.
- RF-5: THE SYSTEM SHALL keep public section anchors used by the landing header in sync with the rendered sections (`#eventos`, `#como-funciona`, `#claridad`; organizer handoff remains via `#organizadores` / footer). Hero retains `#inicio`.
- RF-6: WHEN landing imagery is served, THE SYSTEM SHALL prefer local assets under `apps/web/public/landing/` over remote Unsplash URLs for hero and primary section images.

## Non-Functional Requirements

- Hero LCP should improve vs video preload: prefer optimized local images with `fetchPriority="high"` on the hero only.
- Respect `prefers-reduced-motion` for landing motion utilities.
- Do not introduce new dependencies.
- UI copy remains Spanish/English through i18n; technical identifiers stay English.

## Edge Cases

- Authenticated visitors: hide auth CTAs, keep discovery content.
- Session loading: keep existing CTA skeleton behavior.
- Missing image file: browser broken-image state is acceptable; do not reintroduce remote Unsplash fallbacks in this iteration unless local assets fail generation.

## Out of Scope

- Dashboard or admin redesign
- Changing global brand tokens / font families in `DESIGN.md`
- Full marketing copy rewrite beyond trimming redundant sections
- Real live event feed / scheduled events list
- Video content of any kind on the web landing

## Definition of Done

- Hero uses local static imagery only (no `hero.mp4` reference from landing components; `LANDING_VIDEOS` removed from web landing)
- Landing page is shorter (Atmosphere/Pulse-style repetition removed)
- Section stack foundation: Hero → About → How → Clarity → Events → Closing CTA → Organizers
- Dark and light themes remain usable; reduced motion respected
- Delivered; Flowform composition completed under 037 (archived with this batch)

## Open Questions

- None blocking; direction confirmed: image-only hero, preserve Citrus Soft identity, slim section stack.
