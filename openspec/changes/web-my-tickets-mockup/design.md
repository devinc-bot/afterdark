## Context

The web header already shows “Entradas” for authenticated users as a disabled “próximamente” affordance. Settings and other authenticated pages live under `/_app` with `RequireAuth` + `PublicAppShell`. Event discover cards (`Card` from `@repo/ui`) are the closest visual pattern. There is no purchase or ticket-ownership API yet — this change is UI-only mockup.

## Goals / Non-Goals

**Goals:**

- Authenticated `/tickets` page listing mock purchased tickets as cards.
- Each card: event cover, name, date/time, venue, ticket type, quantity, status (`válido` / `usado`), and a visible QR.
- Enable header “Entradas” (desktop + mobile sheet) to navigate to `/tickets`.
- Spanish + English i18n for page chrome and card labels.

**Non-Goals:**

- API, DB, validators, purchase, empty state, ticket detail, transfer/refund.
- Real QR encoding of ticket secrets (mock visual only).

## Decisions

1. **Route under `/_app/tickets`.** Same pattern as `/_app/settings`: `createFileRoute('/_app/tickets')`, `WEB_ROUTES.tickets() => '/tickets'`. Auth via existing `RequireAuth` layout — no extra guard.

2. **Module layout.** `apps/web/app/modules/tickets/` with:
   - `components/my-tickets-page.tsx` — page shell + list
   - `components/ticket-card.tsx` — single card
   - `constants/mock-tickets.ts` — static mock data (2–3 tickets covering both statuses)
   - Types co-located or a small `types.ts` for the mock shape (local only; no `@repo/types` until real API).

3. **Cards.** Compose `@repo/ui` `Card` (and subcomponents as needed), mirroring discover-list card density: cover image on top/side, metadata, status badge, QR block. Status labels via i18n (`tickets.status.valid` / `tickets.status.used`).

4. **QR mock without new dependency.** Render a fixed SVG (or static asset) that reads as a QR visually, with `alt`/aria describing it as the ticket QR. Payload is decorative. Rationale: mockup only; avoid pinning a QR library until real codes exist. Swap later when API provides codes.

5. **Nav enablement.** Replace disabled `<span>` for tickets with `<Link to={WEB_ROUTES.tickets()}>` in desktop nav and mobile sheet when `showAuthChrome`. Remove reliance on `nav.ticketsSoon` for that control (key can remain unused or be deleted if unused elsewhere).

6. **i18n.** Extend the existing `tickets` namespace (already used by dashboard authoring) with a nested `mine` section for the web my-tickets page (title, heading, card field labels, status). Do not overwrite dashboard `page.*` keys. UI copy Spanish-first; EN parity.

7. **No empty state.** Mock list always has ≥1 ticket; do not implement empty UI.

## Risks / Trade-offs

- [Users expect real tickets] → Mitigation: mock data clearly local; non-goals documented; replace with API in a follow-up change.
- [QR not scannable] → Acceptable for mockup; document in card aria that it is illustrative.
- [Nav visible while session loading] → Same pattern as settings/user menu (`showAuthChrome`); link works once auth resolves; unauthenticated direct URL hits `RequireAuth` redirect.

## Migration Plan

No DB/API migrations. Rollback: remove route + module + revert header links + i18n keys.

## Open Questions

- None blocking (scope locked with product answers: auth required, card fields + QR, no empty state, nav on).
