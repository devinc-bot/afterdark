## Context

Event creation/editing in the dashboard lives in `apps/dashboard/app/modules/events/` as a 2-step wizard:

- **Step 1 (Location)** — `event-wizard-step-location.tsx`: tabs to either pick an existing location (`SelectField` of `useLocations()`) or create a new one inline (`event-wizard-new-location-form.tsx`, validated by `createLocationSchema`).
- **Step 2 (Details)** — `event-wizard-step-details.tsx`: name, description, startsAt, endsAt, status, images.

`event-wizard-page.tsx` orchestrates step/mode/dirty state and, on submit, optionally POSTs a new location first (`useCreateLocation`), then creates/updates the event via `parseEventFormToCreateInput` / `parseEventFormToUpdateInput`.

Separately, locations carry a `type` enum (`permanent` | `temporary`) that is defined in the DB schema, `LocationResponse`, `LocationUpsertInput`, and referenced in repositories + API mappers/use-cases — but it is **never surfaced in any UI**, is **not in `createLocationSchema`**, and the API always hardcodes `PERMANENT` on create / preserves existing on update.

This change collapses the wizard into a single form, drops inline location creation in favor of the existing `/locations/new` route, and removes the `type` field from the location entity.

## Goals / Non-Goals

**Goals:**

- One-page event form (location select + details + images) for both create and edit modes.
- Location chosen exclusively via a select populated by `useLocations()`.
- Clear empty-state when the owner has zero locations: message + "Agregar ubicación" link to `/locations/new`.
- Fully remove the location `type` attribute across db, types, validators, and API.
- Delete the now-dead wizard components without leaving dangling imports.

**Non-Goals:**

- Changing the standalone location create/edit pages (other than removing `type`, which is not in their UI).
- Altering event field validation or the set of event fields.
- Reworking the location select into a shared reusable component (inline `SelectField` is fine).

## Decisions

### 1. Single form replaces the wizard, not a redesign of fields

Keep the existing details form fields and image sub-form; merge the location select and the details into one `EventForm` rendered by both the create and edit views. Reuse `eventFormSchema` / `eventDetailsFormSchema` validators and the `parseEventFormTo*Input` converters. The single form validates all fields at once on submit (location required + event details).

**Alternative considered:** keep wizard but hide the stepper — rejected; leaves dead complexity and the two-mode location step.

### 2. Location selection is select-only; inline creation is removed

Remove `EVENT_LOCATION_MODE` (existing/new), the tabs, and `event-wizard-new-location-form.tsx`. The form renders a single `SelectField` of locations. `resolveLocationId` collapses to "use the selected id" (no create-location call inside the event flow). `useCreateLocation` is no longer used by the events module.

### 3. Empty-state links to the existing route

When `useLocations()` returns an empty list (and not loading), render a message + a link (`DASHBOARD_ROUTES.locationsNew()` → `/locations/new`) with copy "Agregar ubicación", instead of the select. Submit is disabled while there is no selectable location.

### 4. Remove `type` from the location entity via migration

Drop the `type` column with a new timestamp-prefixed drizzle migration. Remove `type` from `LocationResponse`, `LocationUpsertInput`, the two repository upserts, the API mapper (`toLocationResponse`, `toLocationUpsertInput`), and the create/update use-cases. Remove the unused `locationTypeSchema` from validators and the `LOCATION_TYPE` enum usages tied to locations (keep the enum only if referenced elsewhere; otherwise remove).

**Alternative considered:** keep the column, stop mapping it — rejected; leaves an unused NOT NULL column and dead enum, contrary to the request to remove it.

### 5. Component cleanup scope

Delete: `event-wizard-stepper.tsx`, `event-wizard-step-location.tsx`, `event-wizard-location-summary.tsx`, `event-wizard-new-location-form.tsx`. Drop the now-inaccurate `wizard`/`step` naming across the whole module since the flow is no longer step-based:

- `event-wizard-page.tsx` → `event-form-page.tsx` (`EventFormPage`)
- `event-wizard-page-layout.tsx` → `event-form-page-layout.tsx` (`EventFormPageLayout`)
- `event-wizard-error-alert.tsx` → `event-form-error-alert.tsx` (`EventFormErrorAlert`)
- `event-wizard-shortcut-hint.tsx` → `event-form-shortcut-hint.tsx` (`EventFormShortcutHint`)
- `event-wizard-create-view.tsx` → `event-create-view.tsx` (`EventCreateView`)
- `event-wizard-edit-view.tsx` → `event-edit-view.tsx` (`EventEditView`)
- `event-wizard-step-details.tsx` → `event-details-form.tsx` (`EventDetailsForm`)
- `utils/event-wizard.types.ts` → `utils/event-form.types.ts` (`EVENT_FORM_MODE`)
- new `event-location-field.tsx` (`EventLocationField`)

Update the `/events/new` and `/events/:id/edit` route imports accordingly. The i18n `events.wizard.*` namespace is removed; still-needed copy moves into `events.form.*` (section titles, metadata titles, back, load/not-found states) and the step/summary/new-location keys are dropped. Keep `images-event-form.tsx`, mappers, `last-location.storage.ts`, and the unsaved-changes dialog.

## Risks / Trade-offs

- [Dropping a NOT NULL column in SQLite/libSQL] → drizzle-kit generates a table rebuild; verify the generated migration is correct and preserves data for remaining columns. Test with `drizzle-kit generate` then `migrate` on a dev DB.
- [Dangling imports after deleting wizard files] → run `pnpm type-check` and `pnpm lint` after the cleanup; grep for removed symbols (`EVENT_LOCATION_MODE`, `EventWizardStepper`, `locationTypeSchema`, `LOCATION_TYPE`).
- [Last-used-location prefill breaks] → keep `last-location.storage.ts`; select should preselect the stored id if it still exists in the fetched list.
- [Removing `type` from `LocationResponse` may break web app consumers] → grep `apps/web` for `.type` on locations; none expected, but verify during implementation.

## Migration Plan

1. Land types/validators/db changes (remove `type`) with a new drizzle migration; run `drizzle-kit generate` + `migrate`.
2. Update API mappers/use-cases to stop referencing `type`; `pnpm type-check` the api.
3. Refactor the dashboard events module to the single form + location select + empty state.
4. Delete dead wizard components; run `pnpm lint` + `pnpm type-check` monorepo-wide.
5. Add/adjust i18n keys for the single form and the no-locations empty state.

Rollback: revert the change set; the dropped column would need to be re-added by a follow-up migration if already deployed.

## Open Questions

- Should `LOCATION_TYPE` enum be fully deleted or kept for potential future use? Default decision: delete if no remaining references after the change.
