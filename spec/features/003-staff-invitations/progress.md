# Progreso de entrevista — `staff-invitations`

> Estado de la entrevista guiada ([INTERVIEW.md](../../INTERVIEW.md)). Actualizar al cerrar cada fase.

| Fase | Nombre                   | Estado |
| ---- | ------------------------ | ------ |
| 1    | Identidad                | `done` |
| 2    | Comportamiento y alcance | `done` |
| 3    | User stories             | `done` |
| 4    | Contratos                | `done` |
| 5    | Reglas y cierre          | `done` |
| 6    | Plan técnico             | `done` |

### Entrega 2 — Listado de invitaciones del dueño

| Fase | Nombre                   | Estado |
| ---- | ------------------------ | ------ |
| 1    | Identidad                | `done` |
| 2    | Comportamiento y alcance | `done` |
| 3    | User stories             | `done` |
| 4    | Contratos                | `done` |
| 5    | Reglas y cierre          | `done` |
| 6    | Plan técnico             | `done` |

Estados: `pending` · `in_progress` · `done`

### Entrega 5 — Eliminación de invitaciones al aceptar/expirar

| Fase | Nombre              | Estado |
| ---- | ------------------- | ------ |
| 1    | Identidad y alcance | `done` |
| 6    | Plan técnico        | `done` |

---

## Log de respuestas

### Fase 1 — Identidad

- **Encaje:** ampliar `003-staff-invitations` del roadmap (no nueva fila).
- **Foco de esta spec:** conectar `StaffUserRecords` en `staff-management-view.tsx` (tab Staff) — reemplazar `STAFF_USER_RECORDS_MOCK` por datos reales.
- **Alcance acordado:** solo listado (`GET /staff/my-personnel` ya existente en API). El toggle activar/desactivar (`onStatusChange`) **permanece local** hasta una spec futura.
- **Apps:** `dashboard` únicamente (sin cambios en `api` en esta entrega).
- **Dependencias:** `001-auth-sessions`, `002-club-management` (personal asociado a clubes del dueño).

### Fase 2 — Comportamiento y alcance

- **Carga:** prefetch en route loader de `/staff` + `Suspense` en el componente (patrón alineado con `club-management`).
- **Vacío:** sin filas → no mostrar tabla; empty state dedicado en el tab Staff.
- **Toggle estado:** deshabilitado en UI hasta spec/entrega de `PATCH` staff (no optimistic local).

### Fase 3 — User stories

- **Empty copy:** reutilizar `STAFF_COPY.table.emptyTitle` / `emptyDescription`.
- **Error:** banner en el tab + botón Reintentar.
- **KPI:** no incluir en esta entrega.

### Fase 4 — Contratos

- **Última actividad:** fecha/hora absoluta locale `es-AR` desde `lastActiveAt`.
- **Avatar:** URL si `avatar` viene informado; si no, iniciales con tono determinístico por `documentId`.

### Fase 5 — Reglas y cierre

- Status spec → `approved` (listo para implementar).

### Fase 6 — Plan técnico

- `plan.md` y `tasks.md` generados; pendiente revisión del usuario.

### Fase 6 — Plan técnico

### Entrega 2 — Fase 1 — Identidad

- **Encaje:** ampliar `003-staff-invitations` (no nueva fila en roadmap).
- **Foco:** tab _Invitaciones_ en `/staff` — `GET` de invitaciones creadas por el dueño autenticado + conexión en `StaffManagementView` / `StaffInvitations`.
- **Apps:** `api` + `dashboard`.
- **Dependencias:** `001-auth-sessions`, `002-club-management` (invitaciones ligadas a clubes del dueño).

### Entrega 2 — Fase 2 — Comportamiento y alcance

- **Listado:** todas las invitaciones del dueño (`pending`, `accepted`, `expired`, `cancelled`).
- **Carga:** lazy al abrir tab _Invitaciones_ (no prefetch en loader de `/staff`).
- **Tras crear:** invalidar query y refrescar desde API.
- **Fuera de alcance:** solo listar y mostrar; sin revocar, reenviar, aceptación por link ni filtros nuevos.

### Entrega 2 — Fase 3 — User stories

- **Rol:** solo dueño (`owner`).
- **Orden:** `createdAt` descendente (más recientes primero).
- **Badges:** según `status` de API (`pending`, `accepted`, `expired`, `cancelled`); no solo por fecha.
- **Copy:** reutilizar `STAFF_COPY.invitationsTable` + agregar error/reintentar si falta.

### Entrega 2 — Fase 4 — Contratos

- **GET** `/api/invitations/staff` — `JwtAuthGuard` + verificación rol `owner` en servicio (igual que `POST`).
- **Response:** `CreateStaffInvitationResponse[]` (incluye `url` con token para copiar enlace).
- **Sin migraciones;** lectura en `staff_invitations` filtrado por `invited_by_owner_id`.

### Entrega 2 — Fase 5 — Reglas y cierre

- **Vencimiento UI:** híbrido — `status` de DB; `pending` + `expiresAt` pasado → _Vencida_.
- **Copiar enlace:** oculto en `accepted` y `cancelled`.
- **Status spec:** `approved`.

### Entrega 2 — Fase 6 — Plan técnico

- Implementado según spec: repository → API `GET /invitations/staff` → dashboard lazy tab + invalidación tras POST.

---

### Entrega 3 — Aceptar invitación por link

| Fase | Nombre                   | Estado |
| ---- | ------------------------ | ------ |
| 1    | Identidad                | `done` |
| 2    | Comportamiento y alcance | `done` |
| 3    | Contratos                | `done` |
| 4    | Reglas y cierre          | `done` |
| 5    | Plan técnico             | `done` |

### Entrega 3 — Fase 1 — Identidad

- **Encaje:** ampliar `003-staff-invitations` (no nueva fila en roadmap).
- **Foco:** endpoint público `POST /invitations/staff/:slug/:token/accept` + conexión en `staff-invitation-accept-view.tsx`.
- **Apps:** `api` + `dashboard`.
- **Dependencias:** `001-auth-sessions` (crea account), `003-staff-invitations` E1+E2 (invitación preexistente).

### Entrega 3 — Fase 2 — Comportamiento y alcance

- **Crea:** `account` (email + bcrypt password) + `staff` (name, lastName, phone) + `staff_account_lnk` + marca invitación `accepted`.
- **Auth endpoint:** público — el token en URL actúa como credencial.
- **Response:** `{ message: string }` 200 OK. Frontend muestra toast y redirige a login.
- **Sin JWT emitido:** el staff debe iniciar sesión manualmente tras aceptar.

### Entrega 3 — Fase 3 — Contratos

- **Ruta:** `POST /invitations/staff/:slug/:token/accept`
- **Body:** `{ password, name, lastName, phone, securityWord? }` (expandir `acceptStaffInvitationSchema`).
- **Security word:** verificación server-side — cliente envía plaintext, API compara contra hash en DB. El hash nunca sale en `StaffInvitationPublicResponse`.
- **Response 200:** `{ message: 'Cuenta creada. Ya podés iniciar sesión.' }`
- **Errores:** 404 token inválido · 400 slug mismatch · 410 vencida/cancelada · 409 ya aceptada / email ya registrado · 403 security word incorrecta · 500 error interno.
- **DB:** nueva función `updateStaffInvitationAccepted(id)` en `staff-invitations.repository.ts`; reutilizar `registerAccount` de `auth.repository.ts`.

### Entrega 3 — Fase 4 — Reglas y cierre

- Validaciones en orden: token existe → slug coincide → status pending → no expirado → email libre → security word (si aplica) → crear registros → marcar accepted.
- El `staff` se crea con `status = 'active'` desde el inicio.
- `confirmPassword` se valida solo en cliente; el API recibe solo `password`.
- Status spec → `approved`.

---

### Entrega 5 — Fase 1 — Identidad y alcance

- **Encaje:** ampliar `003-staff-invitations` (no nueva fila en roadmap).
- **Foco:** hard delete al aceptar + cron diario para vencidas y canceladas.
- **Apps:** solo `api` (sin cambios en `dashboard`).
- **Dependencias:** E3 (flujo de aceptación); la función `updateStaffInvitationAccepted` de E3 se reemplaza por `deleteStaffInvitationById`.

### Entrega 5 — Decisiones

- **Al aceptar:** hard delete de la fila (no soft delete).
- **Expiradas + canceladas:** cron diario, medianoche UTC.
- **Listado E2:** solo devuelve `pending` (las demás ya no existen en DB).
- **Status spec:** `approved`.

## Supuestos del asistente

- ***

### Entrega 4 — Campo de vencimiento en formulario de invitación

| Fase | Nombre              | Estado |
| ---- | ------------------- | ------ |
| 1    | Identidad y alcance | `done` |
| 2    | Contratos           | `done` |

### Entrega 4 — Fase 1 — Identidad y alcance

- **Encaje:** ampliar `003-staff-invitations` (no nueva fila en roadmap).
- **Foco:** agregar selector de tiempo de expiración en `StaffUserForm` (formulario de crear invitación).
- **Apps:** `api` + `dashboard` + `packages/validators`.
- **Dependencias:** E1–E3 ya `approved`.

### Entrega 4 — Fase 2 — Contratos

- **Opciones:** 12 h · 24 h · 48 h · 7 días — `SelectField` fijo, no input libre.
- **Default:** 48 h (172 800 000 ms).
- **Campo obligatorio:** con default pre-seleccionado; no se puede enviar sin valor.
- **Contrato API:** el cliente envía `expiresInMs: number` (ms). La API calcula `expiresAt = now + expiresInMs`.
- **Validación API:** `expiresInMs` debe ser uno de los valores permitidos (enum en schema Zod) — evita TTLs arbitrarios.
- **`successDescription`:** texto dinámico usando la opción elegida (no hardcoded "5 minutos").
- **Status spec:** `approved`.

---

### Entrega 6 — Eliminar / desactivar staff desde acciones

| Fase | Nombre                   | Estado |
| ---- | ------------------------ | ------ |
| 1    | Identidad                | `done` |
| 2    | Comportamiento y alcance | `done` |
| 3    | User stories             | `done` |
| 4    | Contratos                | `done` |
| 5    | Reglas y cierre          | `done` |
| 6    | Plan técnico             | `done` |

### Entrega 6 — Fase 1 — Identidad

- **Encaje:** ampliar `003-staff-invitations` (no nueva fila en roadmap).
- **Foco:** `StaffUserRecords` — quitar columnas "Última actividad" y "Estado"; en el menú de acciones quitar "Editar" y agregar "Eliminar usuario" / "Activar-Desactivar usuario". Simplificar `STAFF_STATUS` (quitar `PENDING`, sin uso real).
- **Apps:** `types` + `db` + `dashboard` + `api` (hoy no existe endpoint de delete/status persistido para staff).
- **Dependencias:** Entrega 1 (listado real conectado), Entrega 5 (patrón de hard delete ya usado en invitaciones).

### Entrega 6 — Fase 2 — Comportamiento y alcance

- **Columnas eliminadas:** "Última actividad" (`lastActiveLabel`) y "Estado" (switch `StaffUserStatusControl`). Quedan: Nombre, Sede, Rol, Acciones.
- **Menú de acciones:** quitar item "Editar" (deshabilitado hoy). Agregar:
  - **Activar/Desactivar usuario** — toggle dinámico según `record.status`: si está activo, el item dice "Desactivar usuario" y abre `StaffUserDeactivateDialog` (mismo diálogo de confirmación ya existente); si está inactivo, dice "Activar usuario" y activa directo (sin diálogo, igual que el switch actual).
  - **Eliminar usuario** — hard delete (mismo patrón que `deleteStaffInvitationById` de Entrega 5). Irreversible.
- **`STAFF_STATUS`:** se quita `PENDING` (sin uso — confirmado por grep). `INACTIVE` no cambia de valor ni significado; solo se limpia el enum en `packages/types` y el `text(..., { enum })` de `packages/db/src/schema/staff.ts` (requiere migración).
- **Persistencia:** a diferencia de Entrega 1 (controles deshabilitados), esta entrega conecta activar/desactivar y eliminar a endpoints reales de `apps/api`.

### Entrega 6 — Fase 3 — User stories

- **Eliminar (hard delete):** borra `staff` + `staff_account_lnk` + `staff_club_lnk` + `accounts` en una transacción. La persona pierde acceso por completo (no puede volver a loguearse con ese email).
- **Confirmación:** nuevo `StaffUserDeleteDialog` (análogo a `StaffUserDeactivateDialog`) — copy que aclara que es irreversible y borra la cuenta.
- **Permisos (asumido, sin objeción):** mismo patrón que `/staff/my-personnel` — `JwtAuthGuard` + `OwnerRoleGuard`; el service verifica que el staff pertenece a un club del dueño autenticado antes de desactivar/eliminar (404 o 403 si no).

### Entrega 6 — Fase 4 — Contratos

- **`DELETE /api/staff/:documentId`** — `JwtAuthGuard` + `OwnerRoleGuard`. Service verifica pertenencia vía join `staff_club_lnk` → `clubs` → `owners`. Transacción: borra `staff_club_lnk`, `staff_account_lnk`, `staff`, `accounts` (en ese orden, por FKs). Response `200 { message: 'Usuario eliminado.' }`.
- **`PATCH /api/staff/:documentId/status`** — mismas guardias. Body `{ status: 'active' | 'inactive' }` (Zod enum, ya sin `pending`). Response `200 { message: 'Estado actualizado.' }`.
- **Errores (ambos endpoints, mensaje en español):**

  | HTTP | Cuándo                                   | Mensaje                                              |
  | ---- | ---------------------------------------- | ---------------------------------------------------- |
  | 401  | Sin sesión                               | Redirigir a login                                    |
  | 403  | No es dueño                              | Mensaje de API / fallback dashboard                  |
  | 404  | `documentId` no existe o no es del dueño | `Usuario no encontrado.`                             |
  | 400  | `status` fuera del enum (solo PATCH)     | `Estado inválido.`                                   |
  | 500  | Error al eliminar                        | `No pudimos eliminar el usuario. Intentá de nuevo.`  |
  | 500  | Error al actualizar estado               | `No pudimos actualizar el estado. Intentá de nuevo.` |

- **DB (`packages/db`):** nuevas funciones en `staff.repository.ts` — `deleteStaffByDocumentId(documentId)` (transacción con los 4 deletes) y `updateStaffStatusByDocumentId(documentId, status)`. Ambas primero resuelven `staff.id` + verifican pertenencia al owner (reuso de join similar a `findPersonnelByOwnerDocumentId`).
- **Sin migración de schema:** en SQLite, `text(..., { enum })` de Drizzle es solo a nivel TS (no genera `CHECK` — confirmado en migraciones existentes). Quitar `PENDING` de `STAFF_STATUS` y del array `enum` en `schema/staff.ts` no requiere migración nueva.
- **UI (`dashboard`):** dos mutations con TanStack Query (`useDeleteStaffUser`, `useUpdateStaffUserStatus`); `onSuccess` invalida `QUERY_KEYS.staffPersonnel()`. `StaffUserRecords` deja de recibir `statusControlsDisabled` fijo en `true` desde `StaffPersonnelTab` (ahora hay persistencia real).

### Entrega 6 — Fase 5 — Reglas y cierre

- **Alcance del status/delete:** ambos son sobre el registro `staff` completo (no por club) — si el dueño desactiva/elimina desde una fila, afecta a todas las filas de esa persona (todos sus clubes), porque `status` vive en `staff`, no en `staff_club_lnk`.
- **Copy:** usar claves i18n (no hardcodear), mismo patrón que `deactivate.*` en `staff/es.json` / `staff/en.json`. Nuevo namespace `delete.*`: `delete.title`, `delete.descriptionPrefix`, `delete.descriptionSuffix`, `delete.cancel`, `delete.confirm`. Reusar `table.deactivateAccess` / `table.activateAccess` para el label del toggle en el menú (ya existen como aria-label; agregar `table.deactivateUser` / `table.activateUser` para el texto del item de menú) y `table.deleteUser` para el nuevo item.
- **Edge case — activar sin diálogo:** igual que el switch actual, "Activar usuario" ejecuta directo (sin confirmación); solo "Desactivar" y "Eliminar" piden confirmación.
- **Status spec:** `approved` — pasa a plan técnico (fase 6).

## Preguntas abiertas — Entrega 6

- Copy exacto en español/inglés de las nuevas claves i18n (`delete.*`, `table.deleteUser`, `table.deactivateUser`, `table.activateUser`) se define durante la implementación siguiendo el tono ya usado en `deactivate.*`.
