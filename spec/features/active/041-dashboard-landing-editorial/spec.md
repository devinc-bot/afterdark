# Spec 041 - Dashboard Landing Editorial Refresh

## Context and Objective

The owner-facing marketing landing in `apps/dashboard` already covers Hero → Demo → Features → How → Audiences → Value → Social → FAQ → Closing → Footer (038/027). A new editorial HTML mock (floating pill header, cinematic hero with live-ops dock, high-fidelity console preview, numbered feature rows, oversized how steps, audience photo band, value split, testimonials, FAQ accordion, closing CTA, denser footer) should be adapted into the existing React module without pasting CDN Tailwind, Material Symbols, remote `googleusercontent` images, or inline DOM scripts. The goal is a closer visual and copy match to that mock while keeping Lumina Citrus Soft tokens, `dashboardLanding` i18n, real auth routes, and dark/light themes.

## Users / Actors

- Unauthenticated venue owners / organizers discovering the dashboard product on `/`
- Returning owners who land on `/` before login
- Staff who may hit the public landing before invitation acceptance (no special marketing path required)

## User Stories

- H1: As a venue owner, I want an editorial, operations-led landing so that Lumina feels ready for real night operations before I register.
- H2: As a visitor with reduced motion preference, I want motion that never blocks understanding.
- H3: As a bilingual visitor, I want ES/EN copy via the existing `dashboardLanding` i18n namespace.
- H4: As a guest, I want clear paths to register and login using existing dashboard routes.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN the dashboard landing renders, THE SYSTEM SHALL keep the section stack Hero → Demo → Features → How → Audiences → Value → Social → FAQ → Closing CTA → Footer unless a confirmed decision documents a different order in `plan.md`.
- RF-2: WHEN adapting the mock, THE SYSTEM SHALL map colors/spacing/typography to existing Citrus Soft / `@repo/ui` tokens (e.g. `bg-surface`, `primary-container`, `on-surface-variant`) — not introduce Tailwind CDN config or one-off MD3 color utilities.
- RF-3: THE SYSTEM SHALL keep public anchors in sync with header/footer nav: `#inicio`, `#features`, `#how`, `#audiences`, `#faq` (Spanish hash aliases only if already present; prefer existing English hashes).
- RF-4: THE SYSTEM SHALL update Spanish and English strings in `@repo/i18n` `dashboard-landing` locales to match the mock’s messaging without hardcoding UI copy in components.
- RF-5: WHEN imagery is shown, THE SYSTEM SHALL continue using local assets under `apps/dashboard/public/landing/`; THE SYSTEM SHALL NOT depend on live `lh3.googleusercontent.com` URLs at runtime.
- RF-6: WHEN the FAQ expands/collapses, THE SYSTEM SHALL use React state (existing accordion pattern), not `document.querySelector` scripts.
- RF-7: THE SYSTEM SHALL use Lucide (or existing `@repo/ui` icons), not Material Symbols font.
- RF-8: IF the user prefers reduced motion, THEN THE SYSTEM SHALL disable or neutralize decorative hover translate/scale/pulse that the mock uses for flourish.
- RF-9: THE SYSTEM SHALL wire auth CTAs to `DASHBOARD_ROUTES.register()` and `DASHBOARD_ROUTES.login()` (and contact only if an existing route/mailto already exists).
- RF-10: WHEN marketing copy mentions venues, THE SYSTEM SHALL keep domain identifiers as `location` in code/routes; UI marketing may say “club” only where product-approved copy already does or is confirmed in Open Questions.

## Non-Functional Requirements

- No new npm dependencies.
- Preserve dark and light themes as first-class.
- Prefer existing `LandingHeader` / `LandingFooter` / section composition; restyle toward floating pill chrome when feasible.
- Canonical domain language remains `location` in identifiers; avoid introducing `club` into routes or API wording.

## Edge Cases

- Reduced motion: pause/disable demo video autoplay if video is retained; neutralize pulse/ping on live dock.
- Missing local image: broken-image browser state is acceptable; do not reintroduce remote CDN fallbacks.
- Over-claiming: claims such as offline QR cache, T+24 settlement, “sublatency sync”, or fixed commission structures must not ship unless confirmed as accurate product promises.

## Out of Scope

- Web / admin landing redesign
- Real live ops metrics API for the hero dock / console preview (decorative static mock only)
- New product capabilities implied by mock copy (wallet, crypto QR, offline scanner, settlement SLA)
- New global font CDN links (Montserrat/Inter already in design system)
- Material Symbols / Tailwind CDN
- Authenticated session-aware header chrome (unless already present; not required for this refresh)

## Definition of Done

- Mock layout and hierarchy adapted into existing dashboard landing components with project tokens, routes, and i18n
- Local images only; React FAQ interaction
- Dark/light + reduced motion checked manually
- Open Questions resolved or documented as deferred with honest copy

## Open Questions

- None blocking. Confirmed:
  - Demo: **keep** the current local promo video (restyle chrome around it; no static console replacement).
  - Imagery: **download** mock remote photos into `apps/dashboard/public/landing/` (replace existing; no runtime remote URLs).
  - Copy: **tone down** to current product truth (no T+24 SLA, offline QR, “sublatency”, fixed commission schemes, or unverified % claims).
  - Tests: **update** existing `apps/dashboard` landing `*.test.*` only — do **not** add new test files.
  - Hero live-ops dock + ticker: **simplify** (lighter decorative hint, not full Niceto metrics card / dense ticker).
