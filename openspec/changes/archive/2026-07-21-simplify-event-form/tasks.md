## 1. Remove location `type` — types & validators

- [x] 1.1 Remove `type` from `LocationResponse` in `packages/types/src/dto/location.ts`
- [x] 1.2 Remove `type` from `LocationUpsertInput` in `packages/types/src/repository/locations.ts`
- [x] 1.3 Remove the unused `locationTypeSchema` from `packages/validators/src/location.ts`
- [x] 1.4 Remove the location `LOCATION_TYPE` enum in `packages/types/src/enums/location.ts` if it has no remaining references (grep first)

## 2. Remove location `type` — db & migration

- [x] 2.1 Remove the `type` column from `packages/db/src/schema/location.ts` (and its `LOCATION_TYPE` import)
- [x] 2.2 Remove `type` from `create-location-with-address.ts` and `update-location-with-address.ts` repositories
- [x] 2.3 Generate a new timestamp-prefixed migration with `drizzle-kit generate` and apply it with `drizzle-kit migrate` on a dev DB
- [x] 2.4 Verify the generated migration drops the column and preserves remaining data

## 3. Remove location `type` — API

- [x] 3.1 Remove `type` from `toLocationResponse` in `apps/api/src/modules/locations/mappers/location.mapper.ts`
- [x] 3.2 Remove the `type` parameter from `toLocationUpsertInput` and stop passing it
- [x] 3.3 Update `create-location.use-case.ts` and `update-location.use-case.ts` to no longer reference `type`
- [x] 3.4 Run `pnpm type-check` for the api and confirm no dangling `type`/`LOCATION_TYPE` references remain

## 4. Event form — single-form refactor

- [x] 4.1 Create a single `EventForm` (from the current details form) that also renders the location `SelectField` populated by `useLocations()`, validating with `eventFormSchema` / `eventDetailsFormSchema`
- [x] 4.2 Wire create and edit views to render the single form; on submit use `parseEventFormToCreateInput` / `parseEventFormToUpdateInput` with the selected `locationId`
- [x] 4.3 Preserve last-used-location prefill (`last-location.storage.ts`) by preselecting the stored id when present in the fetched locations
- [x] 4.4 Keep images sub-form, error alert, unsaved-changes dialog, and ⌘/Ctrl+Enter submit shortcut working in the single form

## 5. Location select empty-state

- [x] 5.1 When `useLocations()` returns an empty list (not loading), hide the select and render a message plus an "Agregar ubicación" link to `DASHBOARD_ROUTES.locationsNew()` (`/locations/new`)
- [x] 5.2 Disable event submission while there is no selectable location

## 6. Delete dead wizard code

- [x] 6.1 Delete `event-wizard-stepper.tsx`, `event-wizard-step-location.tsx`, `event-wizard-location-summary.tsx`, and `event-wizard-new-location-form.tsx`
- [x] 6.2 Remove `EVENT_WIZARD_STEP` / `EVENT_LOCATION_MODE` usages and trim or delete `utils/event-wizard.types.ts`
- [x] 6.3 Remove the now-unused `useCreateLocation` usage from the events module
- [x] 6.4 Rename/simplify `event-wizard-page.tsx` and `event-wizard-step-details.tsx` to reflect the single-form structure and update imports

## 7. i18n & verification

- [x] 7.1 Add/adjust Spanish i18n keys for the single event form and the no-locations empty-state ("Agregar ubicación")
- [x] 7.2 Grep for removed symbols (`EVENT_LOCATION_MODE`, `EventWizardStepper`, `locationTypeSchema`, location `type`) to confirm none remain
- [x] 7.3 Run `pnpm lint` and `pnpm type-check` across the monorepo and fix any issues
- [ ] 7.4 Manually verify create/edit event flows and the empty-state link in the dashboard
