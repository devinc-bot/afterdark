# Spec 039 - Web Landing Editorial Refresh

## Context and Objective

The public `apps/web` landing already follows the Hero → About → How → Clarity → Events → Closing → Organizers stack (036/037). A new editorial HTML mock (Material-style surfaces, floating pill chrome, denser about/how/clarity/events layouts, ticket mock card, and gallery tabs) should be adapted into the existing React module without pasting CDN Tailwind, Material Symbols, remote `googleusercontent` images, or inline DOM scripts. The goal is a closer visual and copy match to that mock while keeping Lumina Citrus Soft tokens, i18n, session-aware CTAs, and dark/light themes.

## Users / Actors

- Unauthenticated visitors discovering Lumina on `apps/web`
- Authenticated customers browsing the same landing without auth CTAs
- Organizers using the dashboard handoff CTA

## User Stories

- H1: As a visitor, I want an editorial, image-led landing so that Lumina feels clear and premium before I register.
- H2: As a visitor with reduced motion preference, I want motion that never blocks understanding.
- H3: As an organizer, I want a clear path to the dashboard panel.
- H4: As a bilingual visitor, I want ES/EN copy via the existing `landing` i18n namespace.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN the landing renders, THE SYSTEM SHALL keep the section stack Hero → About → How → Clarity → Events → Closing CTA → Organizers → Footer (order may place Organizers before Closing if that better matches the mock; document the chosen order in `plan.md`).
- RF-2: WHEN adapting the mock, THE SYSTEM SHALL map colors/spacing/typography to existing Citrus Soft / `@repo/ui` tokens (e.g. `bg-surface`, `primary`, `on-surface-variant`) — not introduce Tailwind CDN config or one-off MD3 color utilities.
- RF-3: WHILE the visitor is unauthenticated (and while session is loading), THE SYSTEM SHALL keep hero/header auth CTAs with the existing skeleton pattern; IF authenticated, THEN THE SYSTEM SHALL hide guest auth CTAs and keep account chrome.
- RF-4: THE SYSTEM SHALL keep public anchors in sync with header/footer nav: `#inicio`, `#eventos`, `#como-funciona`, `#claridad`, `#organizadores` (add `#para-organizadores` only as an alias if needed; prefer existing `#organizadores`).
- RF-5: THE SYSTEM SHALL update Spanish and English strings in `@repo/i18n` `landing` locales to match the mock’s messaging (season badge, metrics, how meta lines, clarity footers, events gallery labels, closing microcopy) without hardcoding UI copy in components.
- RF-6: WHEN imagery is shown, THE SYSTEM SHALL continue using local assets under `apps/web/public/landing/` (reuse or replace files); THE SYSTEM SHALL NOT depend on live `lh3.googleusercontent.com` URLs at runtime.
- RF-7: WHEN the events gallery tabs change, THE SYSTEM SHALL use React state (existing `SectionEvents` pattern), not `onclick` / `document.querySelector` scripts.
- RF-8: THE SYSTEM SHALL use Lucide (or existing `@repo/ui` icons), not Material Symbols font.
- RF-9: IF the user prefers reduced motion, THEN THE SYSTEM SHALL disable or neutralize decorative hover translate/scale/pulse that the mock uses for flourish.

## Non-Functional Requirements

- No new npm dependencies.
- Preserve dark and light themes as first-class.
- Prefer existing `LandingHeader` / `LandingFooter` composition; restyle toward the pill chrome when feasible without breaking non-landing public pages that reuse the header.
- Do not add or update automated tests under `apps/web/app/modules/landing/` for this feature (explicit product request).

## Edge Cases

- Authenticated visitor: no “Crear cuenta / Iniciar sesión” in hero, events notify, or closing CTA.
- Session loading: keep CTA skeletons.
- Missing local image: broken-image browser state is acceptable; do not reintroduce remote CDN fallbacks.

## Out of Scope

- Dashboard / admin landing redesign
- Real published events feed / catalog API
- Wallet integrations, offline QR crypto claims, calendar sync (copy may mention product intent only if already present; no new product claims that over-promise)
- New global font CDN links (Montserrat/Inter already in design system)
- Material Symbols
- Writing or updating landing unit/component tests

## Definition of Done

- Mock layout and hierarchy adapted into existing landing components with project tokens, routes, i18n, and session behavior
- Local images only; React gallery interaction
- Dark/light + reduced motion checked manually
- No new/updated files under `**/landing/**/*.test.*` for this feature

## Open Questions

- None blocking. Confirmed: floating pill header (mock), replace local images with mock assets downloaded into `public/landing/`, section order matches mock (Organizers before Closing CTA).
