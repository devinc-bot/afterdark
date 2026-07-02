# Tasks — Staff e invitaciones (listado de personal)

> Checklist de tareas. Marcar `[x]` al completar.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [ ] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md` (fila `003`)

## Shared packages

- [x] Sin cambios en validators / types / db (N/A)

## API

- [x] Sin cambios — `GET /staff/my-personnel` existente

## Client (`dashboard`)

- [ ] `API_ROUTES.staff` en `app/config/constants/api.ts`
- [ ] `QUERY_KEYS.staffPersonnel`
- [ ] `staff-personnel.service.ts` — fetch listado
- [ ] `staff-personnel.mapper.ts` — `StaffPersonnelItem` → `StaffUserRecord`
- [ ] `use-staff-personnel.ts` — queryOptions + hook
- [ ] Copy `table.loadError` / `table.retry` en `staff.copy.ts`
- [ ] Loader + Suspense en `routes/_app/staff.tsx`
- [ ] `StaffManagementView` — quitar mock; empty dedicado; error banner
- [ ] `StaffUserRecords` — deshabilitar controles de estado; avatar con URL
- [ ] Eliminar o dejar de exportar `STAFF_USER_RECORDS_MOCK` en producción

## Calidad

- [ ] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] `pnpm format` (o pre-commit)
- [ ] Verificación manual según `plan.md`
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`

---

# Entrega 3 — Aceptar invitación por link

## Shared packages

- [ ] `packages/validators/src/user.ts` — `acceptStaffInvitationSchema` agregar `name`, `lastName`, `phone`
- [ ] `packages/db/src/repositories/staff-invitations.repository.ts` — `updateStaffInvitationAccepted(id)`
- [ ] `packages/db/src/repositories/index.ts` — exportar `updateStaffInvitationAccepted`

## API (`apps/api`)

- [ ] `invitations.constants.ts` — agregar `ACCEPT_SUCCESS`, `ACCEPT_FAILED`, `SECURITY_WORD_INVALID`
- [ ] `invitations.service.ts` — método `acceptStaffInvitation(slug, token, input)`
- [ ] `invitations.controller.ts` — `POST /staff/:slug/:token/accept` sin guard → `acceptStaffInvitation`

## Dashboard (`apps/dashboard`)

- [ ] `staff-invitation.service.ts` (o equivalente) — `acceptStaffInvitation(slug, token, body)` → fetch
- [ ] `staff.copy.ts` — copy para name/lastName/phone + errores de aceptación
- [ ] `staff-invitation-accept-view.tsx` — agregar campos name/lastName/phone al form
- [ ] `staff-invitation-accept-view.tsx` — reemplazar submit vacío por llamada real a API
- [ ] `staff-invitation-accept-view.tsx` — eliminar `verifyStaffInvitationSecurityWordHash` client-side

## Calidad

- [ ] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] Verificación manual según `plan.md` Entrega 3

---

# Entrega 5 — Eliminación de invitaciones al aceptar/expirar

## Shared packages (`packages/db`)

- [ ] `staff-invitations.repository.ts` — `deleteStaffInvitationById(id)` (reemplaza `updateStaffInvitationAccepted`)
- [ ] `staff-invitations.repository.ts` — `deleteExpiredAndCancelledInvitations()`
- [ ] `repositories/index.ts` — exportar las dos funciones nuevas; quitar `updateStaffInvitationAccepted`

## API (`apps/api`)

- [ ] `apps/api/package.json` — agregar `@nestjs/schedule` a dependencies; correr `pnpm install`
- [ ] `src/app.module.ts` — `ScheduleModule.forRoot()` en imports
- [ ] `src/modules/invitations/invitations-cleanup.scheduler.ts` — `InvitationsCleanupScheduler` con `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`
- [ ] `src/modules/invitations/invitations.module.ts` — agregar `InvitationsCleanupScheduler` a `providers`
- [ ] `src/modules/invitations/invitations.service.ts` — paso 11 de `acceptStaffInvitation`: `deleteStaffInvitationById` en lugar de `updateStaffInvitationAccepted`

## Calidad

- [ ] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] Verificación manual según `plan.md` Entrega 5

---

# Entrega 6 — Eliminar / desactivar staff desde acciones

## Shared packages

- [x] `packages/types/src/domain.ts` — `STAFF_STATUS`: quitar `PENDING`
- [x] `packages/db/src/schema/staff.ts` — `enum` sin `PENDING`
- [x] `packages/db/src/repositories/staff.repository.ts` — `deleteStaffByDocumentId(documentId, ownerDocumentId)`
- [x] `packages/db/src/repositories/staff.repository.ts` — `updateStaffStatusByDocumentId(documentId, ownerDocumentId, status)`
- [x] `packages/db/src/repositories/index.ts` — exportar las dos funciones nuevas (ya cubierto por `export *`)
- [x] `packages/i18n/src/constants/error-codes.ts` — `STAFF_ERROR_CODE`: agregar `UPDATE_FAILED`, `DELETE_FAILED`, `INVALID_STATUS`
- [x] `packages/i18n/src/locales/errors/es.json` + `en.json` — mensajes de los códigos nuevos
- [x] `packages/validators/src/user.ts` — `updateStaffStatusSchema`

## API (`apps/api`)

- [x] `src/modules/staff/staff.service.ts` — `deleteStaff(ownerDocumentId, staffDocumentId)`
- [x] `src/modules/staff/staff.service.ts` — `updateStaffStatus(ownerDocumentId, staffDocumentId, status)`
- [x] `src/modules/staff/staff.controller.ts` — `DELETE :documentId` (204 No Content)
- [x] `src/modules/staff/staff.controller.ts` — `PATCH :documentId/status`

## Dashboard (`apps/dashboard`)

- [x] `app/config/constants/api.ts` — rutas `delete` / `updateStatus`
- [x] `app/modules/staff/services/staff-personnel.service.ts` — `deleteStaffUser`, `updateStaffUserStatus`
- [x] `app/modules/staff/mutations/use-staff-personnel-mutations.ts` — `useDeleteStaffUser`, `useUpdateStaffUserStatus`
- [x] `app/modules/staff/components/staff-user-records.tsx` — quitar columnas Última actividad/Estado
- [x] `app/modules/staff/components/staff-user-records.tsx` — menú de acciones: quitar Editar; agregar toggle activar/desactivar + eliminar
- [x] `app/modules/staff/components/staff-user-delete-dialog.tsx` — nuevo diálogo de confirmación
- [x] `app/modules/staff/components/staff-personnel-tab.tsx` — quitar `statusControlsDisabled` fijo, conectar mutations reales
- [x] `packages/i18n/src/locales/staff/es.json` + `en.json` — `delete.*`, `table.deleteUser`, `table.deactivateUser`, `table.activateUser` (+ limpieza de claves muertas: `lastActive`, `status`, `edit`, `editUnavailableTooltip`, `activateAccess`, `deactivateAccess`, `statusActive`, `statusInactive`, `offline`, `justCreated`, `justActivated`)

## Calidad

- [x] `pnpm type-check` (types, db, validators, api, dashboard — sin errores)
- [x] `pnpm lint` (oxlint — sin errores)
- [x] `pnpm check:i18n` (paridad es/en — OK)
- [ ] Verificación manual en navegador (no ejecutada en esta sesión — falta correr `pnpm dev` y probar el flujo)
- [ ] Criterios de aceptación US-10 a US-13 de `spec.md` cumplidos (pendiente de verificación manual)
