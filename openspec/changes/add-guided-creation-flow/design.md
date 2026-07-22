## Context

The dashboard has three independent creation screens: locations (`/locations/new`, full-page form), events (`/events/new`, single-page form after the wizard was removed), and tickets (created via a `TicketCreateDialog` modal on `/tickets`). Each currently returns to its own list on success. There is no onboarding guidance on the Owner panel (`modules/owner/components/owner-panel-view.tsx`), and there is no `/tickets/new` route (tickets have no `ticketsNew()` route constant).

Relevant existing code:
- `location-form-page.tsx` wires `onSuccess={goToList}` → `navigate({ to: DASHBOARD_ROUTES.locations() })`.
- `event-form-page.tsx` calls `goToList()` → `navigate({ to: DASHBOARD_ROUTES.events() })` after create/update.
- `ticket-form.tsx` is a shared TanStack Form component already used by both create and edit dialogs; it takes `mode` and `onSuccess` and uses `ticketFormSchema` + `useCreateTicket`/`useUpdateTicket`.
- Route constants live in `modules/common/constants/routes.ts`; i18n JSON lives in `packages/i18n/src/locales/<ns>/{en,es}.json` (namespaces include `dashboard`, `tickets`, `events`, `locations`).
- The closest existing "alert" pattern is `modules/common/components/load-error-banner.tsx` (`role="alert"`, tinted container, lucide icon, variants). There is no generic Alert in `packages/ui`.

## Goals / Non-Goals

**Goals:**
- Make the first-run setup path obvious via a panel tutorial alert with a CTA.
- Chain the creation flow: location create → `/events/new`, event create → `/tickets/new`.
- Add a `/tickets/new` full-page route reusing the existing ticket form fields/validation.
- Keep all new copy in Spanish and sourced from `@afterdark/i18n`.

**Non-Goals:**
- No changes to ticket/event/location data models, validators, API, or DB.
- No removal of existing ticket create/edit modals.
- No persisted onboarding/dismissal state, analytics, or Staff-panel changes.

## Decisions

### Decision: Reuse `TicketForm` for the `/tickets/new` page (do not duplicate fields)
`TicketForm` already renders every field and owns create/edit submit logic via `mode` + `onSuccess`. The `/tickets/new` page will mount `<TicketForm mode={CREATE} onSuccess={...} />` inside a page layout (mirroring `LocationCreateView`/`EventCreateView`), rather than re-implementing inputs.
- **Why**: single source of truth for fields and validation; the modal and page stay in sync automatically.
- **Alternative considered**: a separate page-only form — rejected (duplicate fields, drift risk).
- **Note**: `TicketForm`'s submit button currently lives in the modal's `DialogFooter` (targeting the form via `form={TICKET_FORM_ID}`). The page must render its own submit control bound to the same form id, so `TicketForm` needs a small tweak to optionally render/expose a submit action for the standalone (page) context. Prefer a `renderFooter`/`showSubmit`-style composition over adding boolean-mode branching.

### Decision: Post-create redirects are gated to CREATE mode only
Both `location-form-page.tsx` and `event-form-page.tsx` reuse the same page for create and edit. The new navigation targets (`/events/new`, `/tickets/new`) apply only when `mode === CREATE`; edit continues to use the existing list navigation.
- **Why**: editing an existing entity should not push the user into the setup funnel.
- **Alternative**: always redirect — rejected (surprising for edits).

### Decision: Onboarding alert as a dashboard component, not a `packages/ui` primitive
Add a dedicated `OnboardingFlowAlert` (or similar) component in the dashboard, following the visual language of `load-error-banner.tsx` (rounded tinted container, lucide icon, `role="note"`/`role="region"`), with an "info"/tutorial styling rather than error styling. Rendered inside `owner-panel-view.tsx`.
- **Why**: this is app-specific onboarding copy/behavior, not a generic primitive; avoids over-generalizing `packages/ui` in this change.
- **Alternative**: extend `LoadErrorBanner` with an `info` variant — acceptable, but the tutorial needs an ordered list + CTA button layout, which is distinct enough to warrant its own component.

### Decision: Add a `ticketsNew()` route constant + string-literal route file
`routes/_app/tickets/new.tsx` uses `createFileRoute('/_app/tickets/new')` (string literal, per TanStack codegen), and navigation uses a new `DASHBOARD_ROUTES.ticketsNew()` constant. `routeTree.gen.ts` regenerates on `pnpm dev` and is not edited.

## Risks / Trade-offs

- [Refactoring `TicketForm` to support a standalone submit control could regress the modal] → Keep the dialog's footer submit working by preserving the `TICKET_FORM_ID` binding; verify both entry points create tickets after the change.
- [Guided redirect to `/tickets/new` requires an event to exist; the ticket event selector must let the user pick the just-created event] → The selector already loads owner events via `useOwnerEventsForSelect()`; the newly created event will appear after its query invalidation. No preselection is required by the specs, but preselecting the most recent event is a possible nicety (out of scope unless trivial).
- [Users creating a location purely to edit later are now pushed into `/events/new`] → Mitigated by gating redirects to CREATE mode only; edit keeps list navigation.
- [Copy lives in two locales] → Add matching keys to both `en.json` and `es.json` for `dashboard` (onboarding alert) and `tickets` (page title/description); es is the user-facing source of truth.

## Open Questions

- Should the panel onboarding alert be dismissible (session-only) or always visible? Default assumption: always visible in this change (no persistence). Confirm during apply if a lightweight dismiss is desired.
- Should `/tickets/new` preselect the most recently created event in the selector? Assumed no (out of scope) unless trivial to wire from the event just created.
