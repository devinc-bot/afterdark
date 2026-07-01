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

Sin cambios en `@afterdark/validators`, `@afterdark/types`, `packages/db` ni `apps/api`.

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
