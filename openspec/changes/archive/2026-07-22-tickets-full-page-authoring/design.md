## Context

`/tickets/new` and `TicketCreateView` already exist from the guided-creation flow, but `TicketsManagementView` still mounts `TicketCreateDialog` / `TicketEditDialog`. Locations and events already use list → Link/navigate to `/…/new` and `/…/$documentId/edit`. There is no owner `GET` ticket-by-id yet; update/delete already resolve ownership via `findTicketWithRelationsOwnedByOwner`.

## Goals / Non-Goals

**Goals:**

- Make list create navigate to `/tickets/new` (remove create modal).
- Add `/tickets/$documentId/edit` + list navigation (remove edit modal).
- Add a thin owner GET-by-id so the edit page works on deep link / refresh.
- Keep delete as a dialog; keep shared `TicketForm` + validators.

**Non-Goals:**

- Ticket schema / field redesign; DB migrations; guided-flow redirect changes.

## Decisions

### Decision: Mirror events/locations list CTAs

Replace `headerAction={<TicketCreateDialog />}` with a `Button asChild` + `Link` to `DASHBOARD_ROUTES.ticketsNew()`, same as `EventsManagementView`. Edit uses `navigate({ to: '/tickets/$documentId/edit', params: { documentId } })` (string-literal route file; constant only for Link/`to` helpers).

**Alternatives considered:** Keep create as modal and only add a page for guided flow — rejected; user wants one pattern.

### Decision: Add owner GET ticket by documentId

Implement `GET` under the tickets module (path constant in `API_ROUTES.tickets`), use-case wrapping `findTicketWithRelationsOwnedByOwner`, map with existing tickets mapper. Dashboard: `fetchTicket` + `useTicket(documentId)` like events. Edit route loads via that query (loading / error / not-found), then `TicketEditView` with `TicketForm` mode EDIT.

**Alternatives considered:** Prefill from list cache / router state only — rejected (broken on refresh and across pages). Scan paginated list for the id — rejected (unreliable).

### Decision: Page shell for edit mirrors `TicketCreateView`

Reuse the create page layout (back link, title, bordered form card, footer cancel/submit via `renderFooter`) rather than inventing a shared `TicketFormPage` in this change unless duplication is painful. Prefer copying the create-view structure into `TicketEditView` for a small diff; optional extract later.

### Decision: Delete dialogs and unused components

Remove `dialog-create-ticket.tsx` and `dialog-edit-ticket.tsx` after wiring. Leave `dialog-remove-ticket.tsx` and view-ticket dialogs as-is.

### Decision: i18n

Add `editPage` (or reuse `form.editTitle` / `form.editDescription` + new `editPage.metaTitle` / `back`) in `tickets` es/en, parallel to `createPage`. UI Spanish remains source of truth.

## Risks / Trade-offs

- [GET endpoint missing today] → Ship GET with the edit route in the same change; reuse existing ownership lookup.
- [routeTree.gen.ts] → Do not hand-edit; regenerate via `pnpm dev` / dashboard codegen.
- [Modal regression in guided flow] → Guided flow already lands on `/tickets/new`; list CTA now matches that destination.

## Migration Plan

1. Wire list create → `/tickets/new`; delete create dialog.
2. Add API GET + dashboard `useTicket`; add edit route/view; wire list edit; delete edit dialog.
3. i18n keys; smoke-test create/edit/delete and deep-link edit.

Rollback: restore dialogs and list wiring; leave GET unused if already deployed (harmless).

## Open Questions

- None for apply: edit is included for locations/events parity (user highlighted both list create and edit dialogs). If scope should be create-only, drop edit route + GET tasks before `/opsx:apply`.
