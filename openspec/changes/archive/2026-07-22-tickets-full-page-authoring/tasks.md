## 1. API route + get-by-id

- [x] 1.1 Add `get: (documentId: string) => \`/${documentId}\` as const` to `API_ROUTES.tickets.path` in `packages/common/src/config/api-routes.ts` (same shape as events)
- [x] 1.2 Add `GetTicketUseCase` in `apps/api` tickets module using `findTicketWithRelationsOwnedByOwner` + existing mapper; wire into `TicketsController` as `GET` by `documentId` (owner-only); register provider in the tickets module

## 2. Dashboard data layer

- [x] 2.1 Add `fetchTicket(documentId)` to `tickets.service.ts` calling the new GET route
- [x] 2.2 Add `QUERY_KEYS.ticket(documentId)` and `useTicket(documentId)` alongside existing ticket list queries

## 3. List create → page (remove create modal)

- [x] 3.1 In `tickets-management-view.tsx`, replace `headerAction={<TicketCreateDialog />}` with a `Button asChild` + `Link` to `DASHBOARD_ROUTES.ticketsNew()`, matching events
- [x] 3.2 Delete `dialog-create-ticket.tsx` once unused; remove imports

## 4. Edit page route

- [x] 4.1 Add `ticketsEdit: (documentId: string) => \`/tickets/${documentId}/edit\` as const` to `DASHBOARD_ROUTES`
- [x] 4.2 Create `TicketEditView` (and loading/error/not-found helpers as needed) mirroring `TicketCreateView` / events edit, wiring `TicketForm` mode EDIT with `onSuccess` → tickets list
- [x] 4.3 Add route `apps/dashboard/app/routes/_app/tickets/$documentId/edit.tsx` with `createFileRoute('/_app/tickets/$documentId/edit')`, `usePageTitle`, and `useTicket` load states (do not edit `routeTree.gen.ts`)
- [x] 4.4 In `tickets-management-view.tsx`, navigate edit actions to `/tickets/$documentId/edit`; remove edit dialog state and `TicketEditDialog`
- [x] 4.5 Delete `dialog-edit-ticket.tsx` once unused

## 5. i18n

- [x] 5.1 Add Spanish + English `editPage` keys (metaTitle, title, description, back) under `tickets` locales; add any missing load/not-found strings used by the edit route

## 6. Smoke check

- [x] 6.1 Manually verify: list create → `/tickets/new` → success returns to list; list edit → edit page (incl. refresh) → save returns to list; delete dialog still works; guided event→`/tickets/new` still works
