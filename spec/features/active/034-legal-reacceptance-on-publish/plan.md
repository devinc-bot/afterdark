# Plan 034 - Legal Reacceptance After Publish

## Approach

Reuse published rows and `account_legal_acceptances`. A type is **stale** when the latest published document for that type has no acceptance row for the account. Gate `user` (web types) and `owner` (dashboard types) after JWT authentication. Skip `admin` and `staff`. Unauthenticated requests are unchanged.

Clients get a dedicated authenticated route (`/legal-acceptance`) that lists only stale types, reuses register dialogs/checkboxes, and POSTs acceptances. Other `_app` routes redirect there until the account is current.

## Layers

1. Types, validators, `API_ROUTES`, i18n error `legalDocument.ACCEPTANCE_REQUIRED` (and accept-failed if needed).
2. Repository: latest published id per type; accepted `legalDocumentId`s for an account (or “is current for types”).
3. Application: compute stale types for a role; POST accept loads **current published** ids for requested types (do not trust client ids); insert acceptances.
4. HTTP: `GET` pending/stale types for the current account; `POST` accept. Guard after `JwtAuthGuard` on authenticated routes with an allow-list: refresh, logout, session read, public legal GET, pending GET, accept POST. Other authenticated routes return 403 with the error code.
5. Web `_app`: redirect to `/legal-acceptance` when stale; page with checkboxes/dialogs; after success, continue.
6. Dashboard: same for owner.

## Allow-list (authenticated but stale)

- Auth refresh and logout
- Session endpoints required to render the shell (`GET /session/me` or equivalent already used by RequireAuth)
- `GET /legal-documents/public/:type`
- Pending/stale legal status GET
- Accept POST
- Public unauthenticated routes (no JWT)

## Assumptions

- JWT has `role` only; map `user` → web types, `owner` → dashboard types (same map as registration).
- `GET /session/me` stays allowed so the client can load identity and decide to redirect.
- No schema/migration.
- Staff using dashboard is not blocked in this increment even if they share the app.

## Verification

- API: stale owner/user blocked; accept of current published unblocks; only-one-type; admin/staff skip; anonymous skip.
- Web and dashboard: redirect, only stale checkboxes, dialog HTML lists, submit gated, success leaves the page.
- `pnpm check` on touched packages as applicable.
