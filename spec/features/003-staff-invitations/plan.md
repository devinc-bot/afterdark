# Plan de implementación — Staff e invitaciones

> Ver también Entrega 3 al final de este archivo.

---

# Entrega 1 — Listado de personal (dashboard)

> Complementa [spec.md](./spec.md). Status spec: `approved`.

## Orden de capas

```text
1. apps/dashboard — constants (API_ROUTES, QUERY_KEYS, copy)
2. apps/dashboard — service fetchStaffPersonnel
3. apps/dashboard — mapper StaffPersonnelItem → StaffUserRecord
4. apps/dashboard — queryOptions + useStaffPersonnel (Suspense-friendly)
5. apps/dashboard — route loader prefetch en _app/staff.tsx
6. apps/dashboard — StaffManagementView + StaffUserRecords (deshabilitar toggle)
```

Sin cambios en `@repo/validators`, `@repo/types`, `packages/db` ni `apps/api`.

## Archivos a crear / modificar

### Dashboard — config / constants

| Archivo                                      | Cambio                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `app/config/constants/api.ts`                | `API_STAFF_PREFIX`, `API_ROUTES.staff.path.listMyPersonnel()` → `/my-personnel` |
| `app/modules/common/constants/query-keys.ts` | `staffPersonnel: () => ['staff-personnel']`                                     |
| `app/modules/staff/constants/staff.copy.ts`  | `table.loadError`, `table.retry` (banner + reintentar)                          |

### Dashboard — staff module

| Archivo                                                  | Cambio                                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `app/modules/staff/services/staff-personnel.service.ts`  | **Nuevo** — `fetchStaffPersonnel()` → `GET /api/staff/my-personnel`                        |
| `app/modules/staff/utils/staff-personnel.mapper.ts`      | **Nuevo** — map a `StaffUserRecord`, formato `lastActiveAt` es-AR, avatar URL vs iniciales |
| `app/modules/staff/queries/use-staff-personnel.ts`       | **Nuevo** — `staffPersonnelQueryOptions`, `useStaffPersonnel`                              |
| `app/modules/staff/components/staff-management-view.tsx` | Quitar mock/state local de records; Suspense boundary + query; empty dedicado              |
| `app/modules/staff/components/staff-user-records.tsx`    | `readOnlyStatus` o prop `statusControlsDisabled`; soporte `AvatarImage` si hay URL         |
| `app/modules/staff/types/staff-user-record.ts`           | Opcional: campo `avatarUrl?: string \| null`; eliminar o aislar `STAFF_USER_RECORDS_MOCK`  |
| `app/routes/_app/staff.tsx`                              | `loader`: `ensureQueryData`; wrapper `Suspense` + fallback skeleton                        |

## Diseño técnico

- **Patrón:** igual que `useClubs` + `fetchClubs`, con prefetch en loader (primera ruta del dashboard que lo use).
- **Errores:** `useQuery` con `throwOnError: false` en el componente del tab, o error boundary local; banner + `refetch()` en el tab _Personal_ (no bloquear tab _Invitaciones_).
- **Empty:** si `data.length === 0`, renderizar bloque empty (sin `StaffUserRecords` tabla).
- **Toggle:** pasar `onStatusChange` no-op o `statusControlsDisabled={true}`; switch `disabled`.

```text
loader (/staff)
  └─ ensureQueryData(staffPersonnelQueryOptions)
       └─ StaffManagementView (Suspense)
            └─ useStaffPersonnel()
                 └─ map → StaffUserRecords | StaffEmptyState
```

## Riesgos / edge cases

| Caso                    | Comportamiento esperado                                   |
| ----------------------- | --------------------------------------------------------- |
| API `[]`                | Empty state, sin tabla                                    |
| API 500                 | Banner + Reintentar en tab Staff                          |
| `avatar` null           | Iniciales + `avatarClassName` por hash                    |
| `avatar` URL inválida   | Fallback a iniciales (onError en imagen)                  |
| Búsqueda sin resultados | `STAFF_COPY.table.noResultsTitle` (comportamiento actual) |
| Usuario no owner        | 403 → banner o redirect según manejo global de API        |

## Verificación manual

| Paso                                 | Resultado esperado                                                |
| ------------------------------------ | ----------------------------------------------------------------- |
| 1. Dueño con personal aceptado en DB | `/staff` muestra filas reales (nombre, club, rol)                 |
| 2. Dueño sin personal                | Empty `Todavía no hay usuarios`, sin tabla; invitar sigue visible |
| 3. API caída o 500                   | Banner + Reintentar; al recuperar API, lista carga                |
| 4. Switch de estado                  | Deshabilitado en todas las filas                                  |
| 5. `pnpm type-check` + `lint`        | Sin errores                                                       |

---

# Entrega 3 — Aceptar invitación por link

> Status spec: `approved`.

## Orden de capas

```text
1. packages/validators — ampliar acceptStaffInvitationSchema (name, lastName, phone)
2. packages/db       — nueva función updateStaffInvitationAccepted + export
3. apps/api          — service.acceptStaffInvitation + controller POST /:slug/:token/accept
4. apps/dashboard    — actualizar acceptStaffInvitationSchema bindings + campos en el form
5. apps/dashboard    — service acceptStaffInvitation + llamada real en onSubmit
6. apps/dashboard    — eliminar verificación client-side de securityWordHash
```

## Archivos a crear / modificar

### `packages/validators`

| Archivo       | Cambio                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/user.ts` | `acceptStaffInvitationSchema` → agregar `name` (min 2, max 255), `lastName` (min 2, max 255), `phone` (min 8, max 30) |

### `packages/db`

| Archivo                                            | Cambio                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `src/repositories/staff-invitations.repository.ts` | Agregar `updateStaffInvitationAccepted(id: number): Promise<void>` |
| `src/repositories/index.ts`                        | Exportar `updateStaffInvitationAccepted`                           |

### `apps/api`

| Archivo                                             | Cambio                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/modules/invitations/invitations.constants.ts`  | Agregar `ACCEPT_FAILED`, `SECURITY_WORD_INVALID`, `EMAIL_ALREADY_REGISTERED` (si no existe) |
| `src/modules/invitations/invitations.service.ts`    | Método `acceptStaffInvitation(slug, token, input)`                                          |
| `src/modules/invitations/invitations.controller.ts` | `@Post('staff/:slug/:token/accept')` → sin guard → llama `acceptStaffInvitation`            |

### `apps/dashboard`

| Archivo                                                         | Cambio                                                                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `app/modules/staff/services/staff-invitation.service.ts`        | Agregar `acceptStaffInvitation(slug, token, body)` → `POST /api/invitations/staff/:slug/:token/accept`         |
| `app/modules/staff/components/staff-invitation-accept-view.tsx` | Agregar campos name/lastName/phone; reemplazar submit vacío por llamada real; eliminar client-side hash verify |
| `app/modules/staff/constants/staff.copy.ts`                     | Copy para nuevos campos + errores de aceptación                                                                |

## Diseño técnico

### Service `acceptStaffInvitation` (API)

```text
1. findStaffInvitationByTokenWithClub(token)     → null → 404
2. invitation.slug !== slug                       → 400
3. status === ACCEPTED                            → 409
4. status === CANCELLED || EXPIRED               → 410
5. expiresAt <= Date.now()                       → 410
6. status !== PENDING                            → 404
7. accountExistsByEmail(invitation.email)         → 409
8. invitation.securityWordHash && !bcrypt.compare(securityWord, hash) → 403
9. findRoleByName(USER_ROLE.STAFF)               → null → 500
10. registerAccount({ email, bcrypt(password), roleId, STAFF, { name, lastName, phone } })
11. updateStaffInvitationAccepted(invitation.id)
12. return { message: INVITATION_MESSAGE.ACCEPT_SUCCESS }
```

### Dashboard form changes

- `defaultValues` agrega `name: '', lastName: '', phone: ''`
- `onSubmit` llama `acceptStaffInvitation(invitation.slug, routeToken, { password, name, lastName, phone, securityWord? })`
- Quitar `verifyStaffInvitationSecurityWordHash` (ya no necesario).
- `toast.success` → mantener; `navigate` → mantener.

## Riesgos / edge cases

| Caso                                                           | Comportamiento esperado                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| Token válido pero slug incorrecto                              | 400                                                           |
| Invitación sin security word, cliente envía `securityWord: ''` | API ignora (no hay hash en DB)                                |
| Invitación ya aceptada                                         | 409 — no re-crear cuenta                                      |
| Email del invitado ya tiene cuenta (registro previo)           | 409                                                           |
| `registerAccount` falla a mitad (rollback)                     | La invitación NO queda en `accepted`; rollback de transacción |

## Verificación manual

| Paso                                   | Resultado esperado                           |
| -------------------------------------- | -------------------------------------------- |
| 1. Link válido, completar form, submit | Cuenta creada, toast éxito, redirect a login |
| 2. Link expirado                       | 410 → error en UI                            |
| 3. Security word incorrecta            | 403 → toast/error en UI                      |
| 4. Submit dos veces con mismo link     | Segundo submit → 404 (ya fue borrada)        |
| 5. Email ya registrado en otra cuenta  | 409 → error en UI                            |
| 6. `pnpm type-check` + `lint`          | Sin errores                                  |

---

# Entrega 5 — Eliminación de invitaciones al aceptar/expirar

> Status spec: `approved`.

## Orden de capas

```text
1. packages/db       — deleteStaffInvitationById + deleteExpiredAndCancelledInvitations
2. apps/api          — instalar @nestjs/schedule; ScheduleModule en AppModule
3. apps/api          — InvitationsCleanupScheduler (@Cron diario)
4. apps/api          — reemplazar updateStaffInvitationAccepted → deleteStaffInvitationById en service E3
```

## Archivos a crear / modificar

### `packages/db`

| Archivo                                            | Cambio                                                                                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/repositories/staff-invitations.repository.ts` | **Agregar** `deleteStaffInvitationById(id)` y `deleteExpiredAndCancelledInvitations()`. Reemplaza `updateStaffInvitationAccepted`. |
| `src/repositories/index.ts`                        | Exportar `deleteStaffInvitationById`, `deleteExpiredAndCancelledInvitations`. Eliminar export de `updateStaffInvitationAccepted`.  |

### `apps/api`

| Archivo                                                    | Cambio                                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `package.json`                                             | Agregar `@nestjs/schedule` a dependencies                                                                                      |
| `src/app.module.ts`                                        | Importar `ScheduleModule.forRoot()`                                                                                            |
| `src/modules/invitations/invitations-cleanup.scheduler.ts` | **Nuevo** — `@Injectable()` con `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)` que llama `deleteExpiredAndCancelledInvitations` |
| `src/modules/invitations/invitations.module.ts`            | Agregar `InvitationsCleanupScheduler` a `providers`                                                                            |
| `src/modules/invitations/invitations.service.ts`           | Paso 11 de `acceptStaffInvitation`: `deleteStaffInvitationById` en lugar de `updateStaffInvitationAccepted`                    |

## Diseño técnico

```text
acceptStaffInvitation (service E3, paso 11):
  - antes: updateStaffInvitationAccepted(invitation.id)
  - ahora: deleteStaffInvitationById(invitation.id)

InvitationsCleanupScheduler:
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupInvitations() {
    await deleteExpiredAndCancelledInvitations()
  }

deleteExpiredAndCancelledInvitations (repository):
  DELETE FROM staff_invitations
  WHERE expires_at < NOW()
     OR status IN ('expired', 'cancelled')
```

## Riesgos / edge cases

| Caso                                                | Comportamiento esperado                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `deleteStaffInvitationById` falla tras crear cuenta | Loguear error; no revertir cuenta. Cron limpiará la fila.                              |
| Link usado por segunda vez                          | `findStaffInvitationByToken` devuelve null → 404 (fila ya fue borrada)                 |
| Cron corre mientras alguien acepta                  | Si cron borra antes que el service lea la fila → service recibe null → 404 (aceptable) |
| `@nestjs/schedule` no instalado                     | App no compila; instalar antes de arrancar                                             |

## Verificación manual

| Paso                                        | Resultado esperado                                   |
| ------------------------------------------- | ---------------------------------------------------- |
| 1. Aceptar invitación válida                | Cuenta creada; fila en `staff_invitations` eliminada |
| 2. Reintentar con el mismo link             | 404 — invitación no encontrada                       |
| 3. Invocar manualmente `cleanupInvitations` | Filas vencidas/canceladas eliminadas de DB           |
| 4. `GET /invitations/staff` post-limpieza   | Solo devuelve invitaciones `pending`                 |
| 5. `pnpm type-check` + `lint`               | Sin errores                                          |

---

# Entrega 6 — Eliminar / desactivar staff desde acciones

> Status spec: `approved`.

## Orden de capas

```text
1. packages/types      — STAFF_STATUS: quitar PENDING
2. packages/db          — schema/staff.ts: enum sin PENDING; staff.repository.ts: deleteStaffByDocumentId + updateStaffStatusByDocumentId
3. packages/i18n        — STAFF_ERROR_CODE: agregar UPDATE_FAILED, DELETE_FAILED; es/en errors.json
4. packages/validators  — updateStaffStatusSchema (status: STAFF_STATUS sin PENDING)
5. apps/api             — staff.service.ts (deleteStaff, updateStaffStatus); staff.controller.ts (DELETE, PATCH)
6. apps/dashboard       — mutations + invalidación; StaffUserRecords (columnas + menú); nuevo StaffUserDeleteDialog; i18n staff/es.json + en.json
```

## Archivos a crear / modificar

### `packages/types`

| Archivo         | Cambio                           |
| --------------- | -------------------------------- |
| `src/domain.ts` | `STAFF_STATUS`: quitar `PENDING` |

### `packages/db`

| Archivo                                | Cambio                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/schema/staff.ts`                  | `enum: [STAFF_STATUS.ACTIVE, STAFF_STATUS.INACTIVE]` (quitar `PENDING` del array)                                                                                                                                                                                                                                                       |
| `src/repositories/staff.repository.ts` | Agregar `deleteStaffByDocumentId(documentId, ownerDocumentId)` (transacción: `staff_club_lnk` → `staff_account_lnk` → `staff` → `accounts`); `updateStaffStatusByDocumentId(documentId, ownerDocumentId, status)`. Ambas verifican pertenencia al owner (join tipo `findPersonnelByOwnerDocumentId`), devuelven `null` si no pertenece. |
| `src/repositories/index.ts`            | Exportar las dos funciones nuevas                                                                                                                                                                                                                                                                                                       |

### `packages/i18n`

| Archivo                        | Cambio                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `src/constants/error-codes.ts` | `STAFF_ERROR_CODE`: agregar `UPDATE_FAILED`, `DELETE_FAILED`, `INVALID_STATUS` |
| `src/locales/errors/es.json`   | `staff.UPDATE_FAILED`, `staff.DELETE_FAILED`, `staff.INVALID_STATUS`           |
| `src/locales/errors/en.json`   | ídem en inglés                                                                 |

### `packages/validators`

| Archivo       | Cambio                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/user.ts` | Nuevo `updateStaffStatusSchema = z.object({ status: z.enum([STAFF_STATUS.ACTIVE, STAFF_STATUS.INACTIVE]) })` |

### `apps/api`

| Archivo                                 | Cambio                                                                                                                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/staff/staff.service.ts`    | Agregar `deleteStaff(ownerDocumentId, staffDocumentId)` y `updateStaffStatus(ownerDocumentId, staffDocumentId, status)`; `NotFoundException` con `STAFF_ERROR_CODE.NOT_FOUND` si no pertenece |
| `src/modules/staff/staff.controller.ts` | Agregar `@Delete(':documentId')` y `@Patch(':documentId/status')` (mismas guardias `JwtAuthGuard` + `OwnerRoleGuard`)                                                                         |

### `apps/dashboard`

| Archivo                                                        | Cambio                                                                                                                                                                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/config/constants/api.ts`                                  | `API_ROUTES.staff.path.delete(documentId)`, `API_ROUTES.staff.path.updateStatus(documentId)`                                                                                        |
| `app/modules/staff/services/staff-personnel.service.ts`        | Agregar `deleteStaffUser(documentId)`, `updateStaffUserStatus(documentId, status)`                                                                                                  |
| `app/modules/staff/mutations/use-staff-personnel-mutations.ts` | Nuevo — `useDeleteStaffUser()`, `useUpdateStaffUserStatus()` (mutations; `onSuccess` invalida `QUERY_KEYS.staffPersonnel()`), mismo patrón que `use-staff-invitations-mutations.ts` |
| `app/modules/staff/components/staff-user-records.tsx`          | Quitar columnas Última actividad/Estado y `StaffUserStatusControl`; `StaffUserRecordActions` con toggle activar/desactivar + eliminar                                               |
| `app/modules/staff/components/staff-user-delete-dialog.tsx`    | Nuevo — análogo a `staff-user-deactivate-dialog.tsx`                                                                                                                                |
| `app/modules/staff/components/staff-personnel-tab.tsx`         | Quitar `statusControlsDisabled` fijo; conectar mutations reales                                                                                                                     |
| `packages/i18n/src/locales/staff/es.json` + `en.json`          | `delete.*`, `table.deleteUser`, `table.deactivateUser`, `table.activateUser`                                                                                                        |

## Diseño técnico

### Repository — delete transaccional

```text
deleteStaffByDocumentId(documentId, ownerDocumentId):
  1. resolver staff.id + verificar pertenencia (join staff_club_lnk -> clubs -> owners)
     -> si no existe o no pertenece: return null
  2. resolver accountId via staff_account_lnk
  3. db.transaction:
     - DELETE FROM staff_club_lnk WHERE staff_id = ?
     - DELETE FROM staff_account_lnk WHERE staff_id = ?
     - DELETE FROM staff WHERE id = ?
     - DELETE FROM accounts WHERE id = ? (accountId)
  4. return { deleted: true }
```

### Service (API)

```text
deleteStaff(ownerDocumentId, staffDocumentId):
  result = deleteStaffByDocumentId(staffDocumentId, ownerDocumentId)
  result === null -> NotFoundException(STAFF_ERROR_CODE.NOT_FOUND)
  catch -> InternalServerErrorException(STAFF_ERROR_CODE.DELETE_FAILED)
  return { message }

updateStaffStatus(ownerDocumentId, staffDocumentId, status):
  result = updateStaffStatusByDocumentId(staffDocumentId, ownerDocumentId, status)
  result === null -> NotFoundException(STAFF_ERROR_CODE.NOT_FOUND)
  catch -> InternalServerErrorException(STAFF_ERROR_CODE.UPDATE_FAILED)
  return { message }
```

### Dashboard — menú de acciones

```text
StaffUserRecordActions(record):
  isActive = record.status === STAFF_STATUS.ACTIVE
  item 1: isActive ? "Desactivar usuario" (abre StaffUserDeactivateDialog) : "Activar usuario" (mutate directo)
  item 2: "Eliminar usuario" (abre StaffUserDeleteDialog)
  ambos onSuccess -> invalidateQueries(QUERY_KEYS.staffPersonnel())
```

## Riesgos / edge cases

| Caso                                            | Comportamiento esperado                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `documentId` no pertenece al owner autenticado  | 404 Usuario no encontrado.                                                                              |
| Staff con varias filas (varios clubes)          | Delete/status afecta el registro `staff` completo -> se refleja en todas sus filas tras invalidar query |
| Delete falla a mitad de transacción             | Rollback completo (transacción atómica); ninguna tabla queda parcialmente modificada                    |
| `status` fuera de `{active, inactive}` en PATCH | 400 Estado inválido (validación Zod)                                                                    |
| Refetch tras eliminar el único staff            | Lista vuelve a `[]` -> empty state                                                                      |

## Verificación manual

| Paso                                               | Resultado esperado                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| 1. Tabla `/staff` tab Personal                     | Solo columnas Nombre, Sede, Rol, Acciones (sin Última actividad/Estado)    |
| 2. Menú de acciones de un staff activo             | Muestra "Desactivar usuario" y "Eliminar usuario"; no "Editar"             |
| 3. Desactivar con confirmación                     | Diálogo -> confirmar -> status pasa a inactive, tabla refresca             |
| 4. Activar un staff inactivo                       | Directo, sin diálogo; status pasa a active                                 |
| 5. Eliminar con confirmación                       | Diálogo -> confirmar -> fila desaparece; login del staff deja de funcionar |
| 6. Staff en 2 clubes (2 filas), eliminar desde una | Ambas filas desaparecen tras refetch                                       |
| 7. `pnpm type-check` + `lint`                      | Sin errores                                                                |
