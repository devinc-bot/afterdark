## 1. Types & validators

- [x] 1.1 Add `organizationName` to owner DTOs / repository update types in `@repo/types` (`CurrentOwnerResponse`, `OwnerUpdateInput`, related owner read shapes).
- [x] 1.2 Extend `updateCurrentOwnerSchema` in `@repo/validators` with `organizationName` and a `superRefine` that requires non-empty name when `taxId` is present; empty name remains valid when `taxId` is empty. Wire through `settingsFormSchema`. Add validation i18n keys (ES + EN) as needed.

## 2. Database

- [x] 2.1 Add nullable `organizationName` / `organization_name` on `owners` schema and generate a timestamp-prefixed drizzle migration.
- [x] 2.2 Update owner repositories (`find-current-owner-by-document-id`, `update-owner-by-document-id`, and any related selects) to read/write `organizationName`.

## 3. API

- [x] 3.1 Map `organizationName` through get/update current-owner use cases (and mappers if any): empty name on update forces `organizationName` and `taxId` to null; non-empty name persists name + optional `taxId`.

## 4. Dashboard UI & i18n

- [x] 4.1 Add settings i18n (ES + EN) for the Organización section (title, description, “¿Eres una organización?”, organization name label, move/reuse CUIT label as needed).
- [x] 4.2 Add organization `FormSection` to owner settings: derived checkbox, conditional name + CUIT fields, clear both on uncheck; remove CUIT from the personal profile section; include `organizationName` in form values, field order, and save payload.
