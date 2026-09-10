# Tasks 034 - Legal Reacceptance After Publish

- [x] T1: Add stale-acceptance DTOs, validators, `API_ROUTES` (pending GET + accept POST), and i18n error for required reacceptance.
- [x] T2: Add repository queries for current published ids vs account acceptances; compute stale types per `user`/`owner` audience.
- [x] T3: Add authenticated pending GET and accept POST (persist current published rows for requested stale types only); reject unknown/non-audience types.
- [x] T4: Enforce the API allow-list after JWT for `user` and `owner` when any audience document is stale; skip `admin`, `staff`, and unauthenticated.
- [x] T5: Add web `/legal-acceptance` page (stale checkboxes + dialogs) and redirect other authenticated routes until current.
- [x] T6: Add the same dedicated page and redirect on dashboard for owners.
