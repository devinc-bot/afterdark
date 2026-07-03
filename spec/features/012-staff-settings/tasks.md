# Tasks — Configuración del staff

> Checklist de tareas. Marcar `[x]` al completar. Orden sugerido de arriba a abajo.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [x] `packages/types/src/api.ts`: `BaseProfileResponse`, `CurrentOwnerResponse`/`CurrentStaffResponse` extienden, `SettingsResponse` actualizado
- [x] `packages/validators/src/owner.ts`: extraer `baseProfileSchema`, `updateCurrentOwnerSchema` lo extiende
- [x] `packages/validators/src/user.ts`: `updateCurrentStaffSchema = baseProfileSchema`
- [x] `packages/db/src/repositories/staff.repository.ts`: `findCurrentStaffByDocumentId`, `updateStaffProfileByDocumentId`
- [x] Sin migración — schema `staff` sin cambios

## i18n

- [x] `STAFF_ERROR_CODE.INACTIVE` en `error-codes.ts`
- [x] Mensaje `staff.INACTIVE` en `locales/errors/es.json` y `en.json`
- [x] Namespace `settings`: mover `actions.*`/`messages.*` de `owner` a `shared`, agregar campos reales bajo `staff.*` en `es.json`/`en.json`

## API

- [x] `SettingsController`: dispatch de schema Zod por `user.role` en `PATCH /settings` (reemplaza pipe fijo)
- [x] `SettingsService`: `getSettings`/`updateSettings` con lógica real para `role === staff` (404 `staff.NOT_FOUND`, 403 `staff.INACTIVE`)
- [x] Lógica de staff expuesta en `StaffService.getCurrentStaff`/`updateCurrentStaff` (simetría con `OwnerService`)
- [x] `SettingsModule`: importa `StaffModule`

## Client

- [x] Building blocks movidos a `modules/settings/`: `hooks/settings-form-context.tsx` (factory genérica `createSettingsFormProvider`), `hooks/use-settings-form-values.ts`, `components/settings-form-actions.tsx` (prop-driven), `components/settings-status-banner.tsx` (prop-driven), `components/settings-section.tsx`, `constants/settings-form.ts`, `utils/settings-form.utils.ts`
- [x] `modules/owner/`: instancia `createSettingsFormProvider<CurrentOwnerResponse, …>` con `updateCurrentOwnerSchema`; `profile-settings-section.tsx` sin cambios de UI
- [x] `modules/staff/`: `staff-settings-view.tsx` deja de ser placeholder, instancia la factory con `CurrentStaffResponse`/`updateCurrentStaffSchema`
- [x] `modules/staff/components/staff-profile-settings-section.tsx` (nuevo): nombre/apellido/teléfono editables, avatar/email solo lectura
- [x] `modules/settings/components/settings-view.tsx`: pasa `data` como prop a `StaffSettingsView` (igual que owner)

## Calidad

- [x] `pnpm type-check` (todos los workspaces afectados)
- [x] `pnpm lint`
- [x] `pnpm format` (archivos tocados)
- [x] Verificación manual end-to-end en browser real (Playwright): registro owner → club → invitación → aceptación staff → login → `/settings` real (sin "Hello World") → editar nombre → guardar → mensaje de éxito → reload persiste el cambio → owner sin regresión (todos sus campos, incluido `taxId`, siguen funcionando)
- [x] Criterios de aceptación de `spec.md` (US-1) cumplidos

## Cierre

- [x] Status → `done` en `spec.md` y `roadmap.md`
