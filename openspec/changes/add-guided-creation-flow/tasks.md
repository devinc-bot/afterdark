## 1. Routing & constants

- [x] 1.1 Add `ticketsNew: () => '/tickets/new' as const` to `DASHBOARD_ROUTES` in `apps/dashboard/app/modules/common/constants/routes.ts`

## 2. Ticket authoring page (`/tickets/new`)

- [x] 2.1 Refactor `apps/dashboard/app/modules/tickets/components/ticket-form.tsx` so its submit control can render in a standalone (page) context as well as inside the dialog footer, without duplicating fields (prefer a composition prop over boolean-mode branching; keep the existing `TICKET_FORM_ID` binding working for the modal)
- [x] 2.2 Create a `TicketCreateView` page component under `apps/dashboard/app/modules/tickets/components/` that renders `TicketForm` (mode CREATE) inside a page layout mirroring `LocationCreateView`/`EventCreateView`, with Spanish title/description and a submit action
- [x] 2.3 Create the route file `apps/dashboard/app/routes/_app/tickets/new.tsx` using `createFileRoute('/_app/tickets/new')`, set the page title via `usePageTitle('tickets', ...)`, and render `TicketCreateView`
- [x] 2.4 Verify the existing `TicketCreateDialog` on the tickets list still opens and creates tickets after the `TicketForm` refactor

## 3. Guided navigation redirects

- [x] 3.1 In `apps/dashboard/app/modules/locations/components/location-form-page.tsx`, when `mode === CREATE`, change the create-success navigation to `DASHBOARD_ROUTES.eventsNew()` (`/events/new`); keep edit-success navigation unchanged
- [x] 3.2 In `apps/dashboard/app/modules/events/components/event-form-page.tsx`, when creating, change the create-success navigation to `DASHBOARD_ROUTES.ticketsNew()` (`/tickets/new`); keep edit-success navigation unchanged

## 4. Panel onboarding alert

- [x] 4.1 Create an `OnboardingFlowAlert` component (dashboard) following the visual language of `modules/common/components/load-error-banner.tsx`, showing the 3 ordered steps (ubicación → evento → tickets) and a primary CTA button linking to `DASHBOARD_ROUTES.locationsNew()`
- [x] 4.2 Render `OnboardingFlowAlert` in `apps/dashboard/app/modules/owner/components/owner-panel-view.tsx` at the top of the panel

## 5. i18n copy

- [x] 5.1 Add Spanish + English keys for the onboarding alert (title, 3 step descriptions, CTA label) under the `dashboard` namespace in `packages/i18n/src/locales/dashboard/{es,en}.json`
- [x] 5.2 Add Spanish + English keys for the ticket authoring page (page title, meta title, description) under the `tickets` namespace in `packages/i18n/src/locales/tickets/{es,en}.json`

## 6. Verification

- [x] 6.1 Manually walk the guided flow: panel alert CTA → create location → lands on `/events/new` → create event → lands on `/tickets/new` → create ticket succeeds
- [x] 6.2 Confirm editing a location and editing an event do NOT redirect into the guided flow
- [x] 6.3 Run `pnpm lint` and `pnpm type-check` and fix any issues introduced by the change
