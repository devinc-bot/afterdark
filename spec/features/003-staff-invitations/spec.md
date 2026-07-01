# Staff e invitaciones — listado de personal (dashboard)

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo       | Valor                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| **ID**      | `003-staff-invitations`                                                                                      |
| **Status**  | `approved`                                                                                                   |
| **Apps**    | `api`, `dashboard`                                                                                           |
| **Enfoque** | Entrega 1: tab _Staff_ (`GET /staff/my-personnel`). Entrega 2: tab _Invitaciones_ (`GET` listado del dueño). |

---

## Qué hace

### Entrega 1 — Tab Personal

El dueño de clubes ve en `/staff` (tab _Staff_) el personal real asociado a sus clubes, cargado desde la API, en lugar de datos mock. Si no hay personal, ve un estado vacío dedicado. Los controles de activar/desactivar quedan deshabilitados hasta que exista persistencia en backend.

### Entrega 2 — Tab Invitaciones

El dueño ve en `/staff` (tab _Invitaciones_) todas las invitaciones que creó, cargadas desde un nuevo endpoint `GET`. Al abrir el tab se dispara la carga; tras crear una invitación con `POST /invitations/staff`, el listado se refresca automáticamente.

## Por qué

### Entrega 1

La tabla `StaffUserRecords` hoy usa `STAFF_USER_RECORDS_MOCK` y engaña sobre el estado real del negocio. Conectar `GET /staff/my-personnel` cierra el hueco entre API ya implementada y la UI del dashboard.

### Entrega 2

El tab _Invitaciones_ hoy acumula solo invitaciones creadas en la sesión actual (`useState` local). Sin persistencia al recargar la página el dueño pierde visibilidad de invitaciones pendientes, aceptadas o vencidas.

## Alcance

### Entrega 1 — Incluye

- Prefetch del listado en el loader de la ruta `/staff`.
- Query/hook + service en `dashboard` contra `GET /api/staff/my-personnel`.
- Mapeo `StaffPersonnelItem` → `StaffUserRecord` (incl. `lastActiveLabel`, avatar/tone).
- Reemplazar `useState(STAFF_USER_RECORDS_MOCK)` en `StaffManagementView`.
- Estados: loading (Suspense), error recuperable, vacío sin tabla.
- Deshabilitar switch y acciones de cambio de estado en `StaffUserRecords`.

### Entrega 1 — No incluye

- Persistir activar/desactivar staff (`onStatusChange` / PATCH).
- Tab _Invitaciones_ conectado a API.
- Aceptación de invitaciones por link/token.
- Filtros o búsqueda nuevos en tab Personal.

### Entrega 2 — Incluye

- Nuevo endpoint `GET` en `apps/api` (invitaciones del dueño autenticado).
- Repository `findStaffInvitationsByOwnerDocumentId` (o equivalente) en `packages/db`.
- Tipo de respuesta en `@afterdark/types` (reutilizar o extender `CreateStaffInvitationResponse`).
- Service + hook + query en `dashboard`; carga lazy al activar tab _Invitaciones_.
- Reemplazar `useState<StaffInvitationRecord[]>` en `StaffManagementView` por datos de API.
- Invalidar query tras `POST /invitations/staff` exitoso.
- Estados: loading, error recuperable, vacío; badges por `status` (`pending`, `accepted`, `expired`, `cancelled`).

### Entrega 2 — No incluye

- Revocar / cancelar invitación.
- Reenviar invitación.
- Flujo de aceptación por link.
- Filtros o búsqueda en tab Invitaciones.
- Cambios en tab Personal (entrega 1).

### Entrega 4 — Campo de vencimiento en formulario — Incluye

- Agregar campo `expiresInMs` a `createStaffInvitationSchema` (Zod enum de valores permitidos; default 48 h).
- Ampliar `buildStaffInvitationPayload` para aceptar `expiresInMs` en lugar del TTL hardcodeado.
- Pasar `input.expiresInMs` desde `InvitationsService.createStaffInvitation`.
- `SelectField` en `StaffUserForm` con opciones 12 h / 24 h / 48 h / 7 días; default 48 h pre-seleccionado.
- Claves i18n en `staff/es.json` y `staff/en.json` (label, placeholder, opciones).
- `invitation.successDescription` dinámico: mostrar la duración elegida en lugar de "5 minutos".

### Entrega 4 — No incluye

- TTL personalizado (número libre).
- Cambiar `expiresAt` de invitaciones ya creadas.
- Opciones distintas a las cuatro fijas (12 h / 24 h / 48 h / 7 días).

### No incluye (global, entregas futuras)

### Entrega 3 — Aceptar invitación por link — Incluye

- Endpoint público `POST /invitations/staff/:slug/:token/accept`.
- Verificación server-side de security word (bcrypt compare).
- Creación de `account` + `staff` + `staff_account_lnk` en transacción (reutilizar `registerAccount`).
- Marcar `staff_invitations.status = 'accepted'` + `acceptedAt`.
- Ampliar `acceptStaffInvitationSchema` con `name`, `lastName`, `phone`.
- Ampliar form `staff-invitation-accept-view.tsx` con los nuevos campos.
- Conexión real desde el form al endpoint (reemplazar submit vacío actual).
- Eliminar verificación client-side de security word hash (mover a API).

### Entrega 3 — No incluye

- Emitir JWT tras aceptar (staff debe iniciar sesión manualmente).
- Reenviar invitación.
- Perfil del staff editable desde la vista de aceptación (solo campos requeridos para crear la cuenta).

---

## User stories

### US-1: Ver personal real

**Como** dueño de clubes  
**Quiero** ver en el tab _Personal_ el equipo con invitación aceptada  
**Para** saber quién tiene acceso operativo en mis clubes

**Criterios de aceptación**

- [ ] **Dado** que inicié sesión como dueño con personal aceptado, **Cuando** entro a `/staff`, **Entonces** veo filas con nombre, correo, club, rol, última actividad y estado desde la API (no mock).
- [ ] **Dado** que la ruta carga, **Cuando** el prefetch está en curso, **Entonces** el tab _Personal_ muestra fallback de Suspense hasta tener datos.
- [ ] **Dado** que tengo personal, **Cuando** uso la búsqueda del toolbar, **Entonces** filtro por nombre o correo sobre los datos reales.

### US-2: Sin personal registrado

**Como** dueño sin invitaciones aceptadas  
**Quiero** un mensaje claro cuando no hay equipo  
**Para** entender que debo invitar personal primero

**Criterios de aceptación**

- [ ] **Dado** que `GET /staff/my-personnel` devuelve `[]`, **Cuando** abro el tab _Personal_, **Entonces** no veo la tabla y sí el empty state con `STAFF_COPY.table.emptyTitle` y `emptyDescription`.
- [ ] **Dado** el empty state, **Cuando** miro la pantalla, **Entonces** el botón _Invitar personal_ del header sigue visible y usable.

### US-3: Error de carga

**Como** dueño  
**Quiero** recuperarme si falla la carga del listado  
**Para** no quedar bloqueado sin opciones

**Criterios de aceptación**

- [ ] **Dado** que la API falla al listar personal, **Cuando** estoy en el tab _Personal_, **Entonces** veo un banner de error en español y un botón _Reintentar_.
- [ ] **Dado** el banner de error, **Cuando** pulso _Reintentar_, **Entonces** se vuelve a ejecutar la query y, si responde OK, se muestra la tabla o el empty state.

### US-4: Estado sin persistencia (acotación)

**Como** dueño  
**Quiero** que los controles de activar/desactivar no sugieran guardado falso  
**Para** no creer que cambié permisos en el servidor

**Criterios de aceptación**

- [ ] **Dado** el listado cargado, **Cuando** veo el switch de estado de un usuario, **Entonces** está deshabilitado (no editable).
- [ ] **Dado** el menú de acciones, **Cuando** la acción implica cambio de estado, **Entonces** permanece deshabilitada o no disponible según el diseño actual de `StaffUserRecords`.

### US-5: Ver invitaciones enviadas (entrega 2)

**Como** dueño de clubes  
**Quiero** ver todas mis invitaciones al abrir el tab _Invitaciones_  
**Para** dar seguimiento a enlaces pendientes, aceptados o vencidos

**Criterios de aceptación**

- [ ] **Dado** que inicié sesión como dueño con invitaciones creadas, **Cuando** abro el tab _Invitaciones_, **Entonces** veo filas con correo, club, seguridad, vencimiento, estado y acción copiar enlace desde la API (no `useState` local).
- [ ] **Dado** el listado cargado, **Cuando** comparo el orden, **Entonces** las invitaciones más recientes (`createdAt`) aparecen primero.

### US-6: Sin invitaciones (entrega 2)

**Como** dueño sin invitaciones previas  
**Quiero** un mensaje claro en el tab _Invitaciones_  
**Para** saber que debo crear la primera

**Criterios de aceptación**

- [ ] **Dado** que el endpoint devuelve `[]`, **Cuando** abro el tab _Invitaciones_, **Entonces** veo `STAFF_COPY.invitationsTable.emptyTitle` y `emptyDescription` sin tabla.
- [ ] **Dado** el empty state, **Cuando** miro el header, **Entonces** el botón _Invitar personal_ sigue disponible.

### US-7: Error al cargar invitaciones (entrega 2)

**Como** dueño  
**Quiero** reintentar si falla la carga del tab _Invitaciones_  
**Para** no perder acceso al historial

**Criterios de aceptación**

- [ ] **Dado** que la API falla al listar invitaciones, **Cuando** estoy en el tab _Invitaciones_, **Entonces** veo mensaje de error en español y botón _Reintentar_.
- [ ] **Dado** el error, **Cuando** pulso _Reintentar_, **Entonces** se vuelve a ejecutar la query.

### US-8: Estados de invitación (entrega 2)

**Como** dueño  
**Quiero** distinguir invitaciones pendientes, aceptadas, vencidas y canceladas  
**Para** saber qué enlaces siguen siendo útiles

**Criterios de aceptación**

- [ ] **Dado** una invitación con `status: pending` y no vencida, **Cuando** veo la fila, **Entonces** el badge muestra _Pendiente_.
- [ ] **Dado** `status: accepted`, **Cuando** veo la fila, **Entonces** el badge refleja _Aceptada_ (copy nuevo en `staff.copy.ts`).
- [ ] **Dado** `status: expired` o `cancelled`, **Cuando** veo la fila, **Entonces** el badge refleja el estado correspondiente en español.

### US-9: Refresco tras crear (entrega 2)

**Como** dueño  
**Quiero** que la nueva invitación aparezca en el listado tras crearla  
**Para** confirmar que se guardó correctamente

**Criterios de aceptación**

- [ ] **Dado** que creé una invitación con éxito (`POST /invitations/staff`), **Cuando** se abre el tab _Invitaciones_, **Entonces** el listado se refresca desde la API e incluye la nueva fila.

---

## Contratos

### API — Entrega 1 (personal)

| Método | Ruta                      | Auth                                                 |
| ------ | ------------------------- | ---------------------------------------------------- |
| `GET`  | `/api/staff/my-personnel` | JWT + rol `owner` (`JwtAuthGuard`, `OwnerRoleGuard`) |

**Response:** `StaffPersonnelItem[]` (`@afterdark/types`)

```ts
{
  documentId: string
  name: string
  email: string
  clubId: string
  clubName: string
  role: UserRole
  status: StaffStatus
  avatar: string | null
  lastActiveAt: Date
}
```

**Errores (mensaje al usuario en español)**

| HTTP | Cuándo                      | Mensaje                                                            |
| ---- | --------------------------- | ------------------------------------------------------------------ |
| 401  | Sin sesión / token inválido | Redirigir a login (comportamiento existente de `_app`)             |
| 403  | Usuario no es dueño         | Mensaje de API o fallback del dashboard                            |
| 500  | Error al listar personal    | `No pudimos cargar el personal. Intentá de nuevo en unos minutos.` |

### API — Entrega 2 (invitaciones)

| Método | Ruta                     | Auth                                                           |
| ------ | ------------------------ | -------------------------------------------------------------- |
| `GET`  | `/api/invitations/staff` | JWT + rol `owner` (mismo patrón que `POST /invitations/staff`) |
| `POST` | `/api/invitations/staff` | (existente) crear invitación                                   |

**Response `GET`:** `CreateStaffInvitationResponse[]` — mismo shape que el `POST`, ordenado por `createdAt` desc.

```ts
{
  documentId: string
  email: string
  clubId: string // documentId del club
  clubName: string
  invitedByOwnerId: string
  slug: string
  url: string // enlace completo con token (para copiar)
  expiresAt: Date
  hasSecurityWord: boolean
  status: StaffInvitationStatus
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
```

**Errores `GET` (mensaje al usuario en español)**

| HTTP | Cuándo          | Mensaje                                                                      |
| ---- | --------------- | ---------------------------------------------------------------------------- |
| 401  | Sin sesión      | Redirigir a login                                                            |
| 403  | No es dueño     | Mensaje de API (`INVITATION_MESSAGE.FORBIDDEN`) o fallback dashboard         |
| 500  | Error al listar | `No pudimos cargar las invitaciones. Intentá de nuevo.` + botón _Reintentar_ |

### Datos

| Tabla / campo       | Cambio                                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `staff_invitations` | Sin migraciones. Entrega 1: lectura vía `findPersonnelByOwnerDocumentId` (solo `accepted`). Entrega 2: nueva query por `invited_by_owner_id` del dueño autenticado, join `clubs` para `clubName`. |

### UI (`dashboard`) — Entrega 1

| Ruta          | Pantalla                      |
| ------------- | ----------------------------- |
| `/_app/staff` | Tab _Personal_: tabla o empty |

**Loader:** `beforeLoad` o `loader` de la ruta hace `queryClient.ensureQueryData(staffPersonnelQueryOptions())`.

**Mapeo API → `StaffUserRecord`**

| Campo UI                                                | Origen                                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `id`                                                    | `documentId`                                                                 |
| `name`, `email`, `clubId`, `clubName`, `role`, `status` | directo                                                                      |
| `lastActiveAt`                                          | `lastActiveAt.getTime()`                                                     |
| `lastActiveLabel`                                       | `lastActiveAt` formateado absoluto `es-AR` (fecha + hora)                    |
| `avatarClassName`                                       | tono por hash de `documentId` si no hay imagen; ignorar si hay URL de avatar |

**Copy (español)** — reutilizar `STAFF_COPY` salvo:

| Contexto                  | Texto                                                                   |
| ------------------------- | ----------------------------------------------------------------------- |
| Error en tab + reintentar | `No pudimos cargar el personal. Intentá de nuevo.` + botón `Reintentar` |
| Empty tab Staff           | `STAFF_COPY.table.emptyTitle` / `emptyDescription`                      |

### UI (`dashboard`) — Entrega 2

| Ruta          | Pantalla                                                            |
| ------------- | ------------------------------------------------------------------- |
| `/_app/staff` | Tab _Invitaciones_: tabla, empty o error; carga lazy al activar tab |

**Query:** `useStaffInvitations` habilitada cuando `activeTab === STAFF_TAB.INVITATIONS`.

**Mapeo API → `StaffInvitationRecord`**

| Campo UI                             | Origen                            |
| ------------------------------------ | --------------------------------- |
| `id`                                 | `documentId`                      |
| `email`, `clubId`, `clubName`, `url` | directo                           |
| `expiresAt`                          | `expiresAt.getTime()`             |
| `createdAt`                          | `createdAt.getTime()`             |
| `hasSecurityWord`                    | `hasSecurityWord`                 |
| `status`                             | `status` (nuevo campo en tipo UI) |

**Copy (español)**

| Contexto                  | Texto                                                                  |
| ------------------------- | ---------------------------------------------------------------------- |
| Empty                     | `STAFF_COPY.invitationsTable.emptyTitle` / `emptyDescription`          |
| Error + reintentar        | `No pudimos cargar las invitaciones. Intentá de nuevo.` + `Reintentar` |
| Badge aceptada            | `Aceptada` (`statusAccepted` en `invitationsTable`)                    |
| Badge cancelada           | `Cancelada` (`statusCancelled` en `invitationsTable`)                  |
| Badge pendiente / vencida | `statusPending` / `statusExpired` existentes                           |

**Tras POST:** `queryClient.invalidateQueries` en la query de invitaciones.

---

### API — Entrega 4 (campo de vencimiento)

`POST /api/invitations/staff` — mismo endpoint de E1; se amplía el body.

**Body ampliado:** `CreateStaffInvitationInput`

```ts
{
  email: string
  clubId: string
  securityWord?: string
  expiresInMs: 43200000 | 86400000 | 172800000 | 604800000  // 12h | 24h | 48h | 7d
}
```

**Validación:** Zod enum con los cuatro valores; cualquier otro valor → 400.

**`expiresAt` calculado:** `new Date(Date.now() + input.expiresInMs)`.

**`successDescription` dinámico (UI):** mapeado desde `expiresInMs` a una etiqueta legible (ej. `"48 horas"`).

### UI — Entrega 4 (`dashboard`)

**Nuevo campo en `StaffUserForm`:**

| Campo         | Tipo          | Label            | Default            |
| ------------- | ------------- | ---------------- | ------------------ |
| `expiresInMs` | `SelectField` | `form.expiresIn` | `172800000` (48 h) |

**Opciones del select:**

| Valor (ms)  | Etiqueta                         |
| ----------- | -------------------------------- |
| `43200000`  | `form.expires12h` → `"12 horas"` |
| `86400000`  | `form.expires24h` → `"24 horas"` |
| `172800000` | `form.expires48h` → `"48 horas"` |
| `604800000` | `form.expires7d` → `"7 días"`    |

**`invitation.successDescription`:** interpolado con la duración elegida.

| Clave i18n                      | ES                                                                     | EN                                                                           |
| ------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `form.expiresIn`                | `"Vencimiento del enlace"`                                             | `"Link expiry"`                                                              |
| `form.expires12h`               | `"12 horas"`                                                           | `"12 hours"`                                                                 |
| `form.expires24h`               | `"24 horas"`                                                           | `"24 hours"`                                                                 |
| `form.expires48h`               | `"48 horas"`                                                           | `"48 hours"`                                                                 |
| `form.expires7d`                | `"7 días"`                                                             | `"7 days"`                                                                   |
| `invitation.successDescription` | `"Compartí este enlace con la persona invitada. Vence en {duration}."` | `"Share this link with the invited staff member. It expires in {duration}."` |

---

### API — Entrega 3 (aceptar invitación)

| Método | Ruta                                         | Auth              |
| ------ | -------------------------------------------- | ----------------- |
| `POST` | `/api/invitations/staff/:slug/:token/accept` | Público (sin JWT) |

**Body:** `AcceptStaffInvitationInput` (schema ampliado)

```ts
{
  name: string        // min 2, max 255
  lastName: string    // min 2, max 255
  phone: string       // min 8, max 30
  password: string    // min 8
  securityWord?: string  // solo si hasSecurityWord = true
}
```

> `confirmPassword` se valida solo en cliente; no se envía al API.

**Response 200:**

```ts
{
  message: string
} // "Cuenta creada. Ya podés iniciar sesión."
```

**Errores `POST` (mensaje al usuario en español)**

| HTTP | Cuándo                        | Mensaje                                         |
| ---- | ----------------------------- | ----------------------------------------------- |
| 400  | Slug no coincide con el token | `El enlace de invitación no es válido.`         |
| 403  | Security word incorrecta      | `La palabra de seguridad es incorrecta.`        |
| 404  | Token no encontrado           | `El enlace de invitación no es válido.`         |
| 409  | Ya aceptada                   | `Esta invitación ya fue aceptada.`              |
| 409  | Email ya registrado           | `Este correo ya está registrado.`               |
| 410  | Vencida o cancelada           | `El enlace de invitación expiró.`               |
| 500  | Error al crear cuenta         | `No se pudo crear la cuenta. Intentá de nuevo.` |

**DB — Entrega 3**

| Operación                        | Tabla                                                        | Función                                               |
| -------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| Leer invitación                  | `staff_invitations` JOIN `clubs`                             | `findStaffInvitationByTokenWithClub` (existente)      |
| Verificar email libre            | `accounts`                                                   | `accountExistsByEmail` (existente)                    |
| Crear cuenta + staff + rol + lnk | `accounts`, `staff`, `staff_account_lnk`, `account_role_lnk` | `registerAccount` (existente en `auth.repository.ts`) |
| Marcar accepted                  | `staff_invitations`                                          | `updateStaffInvitationAccepted` (nueva)               |

**UI — Entrega 3 (dashboard)**

| Ruta                                      | Pantalla                                    |
| ----------------------------------------- | ------------------------------------------- |
| `/_public/invitations/staff/:slug/:token` | `StaffInvitationAcceptView` — form ampliado |

**Nuevos campos en el form**

| Campo      | Label    | Validación     |
| ---------- | -------- | -------------- |
| `name`     | Nombre   | min 2, max 255 |
| `lastName` | Apellido | min 2, max 255 |
| `phone`    | Teléfono | min 8, max 30  |

**Copy (español)**

| Contexto               | Texto                                           |
| ---------------------- | ----------------------------------------------- |
| Campo nombre           | `Nombre` / placeholder `Tu nombre`              |
| Campo apellido         | `Apellido` / placeholder `Tu apellido`          |
| Campo teléfono         | `Teléfono` / placeholder `Ej: 11 1234-5678`     |
| Submit                 | `Crear cuenta` / submitting `Creando cuenta…`   |
| Éxito (toast)          | `Cuenta creada. Ya podés iniciar sesión.`       |
| Error security word    | `La palabra de seguridad es incorrecta.`        |
| Error email registrado | `Este correo ya está registrado.`               |
| Error genérico         | `No se pudo crear la cuenta. Intentá de nuevo.` |

---

## Reglas de negocio

### Entrega 1 — Personal

- Solo aparece personal con invitación en estado `accepted` vinculada a un club del dueño autenticado (query en `staff.repository.ts`).
- El listado requiere sesión de dueño; la API aplica `OwnerRoleGuard`.
- Un mismo staff puede figurar más de una vez si está asignado a varios clubes (una fila por club/invitación aceptada).
- `lastActiveAt` en API hoy mapea `staff.updatedAt`; la UI lo muestra como actividad absoluta, sin reinterpretar en relativo.
- Cambios de `staff.status` no se envían al servidor en esta entrega; controles deshabilitados.

### Entrega 2 — Invitaciones

- El listado incluye todas las invitaciones donde `invited_by_owner_id` corresponde al dueño autenticado, sin filtrar por status.
- Orden: `createdAt` descendente.
- Badge: priorizar `status` de DB; si `pending` y `expiresAt` ya pasó, mostrar como _Vencida_ en UI.
- Copiar enlace: visible solo para `pending` y `expired`; oculto si `accepted` o `cancelled`.
- Carga lazy al activar tab; tras `POST` exitoso, invalidar query de invitaciones.

### Entrega 3 — Aceptar invitación

- Orden de validaciones: token existe → slug coincide → status `pending` → no expirado (`expiresAt > now`) → email libre → security word (si aplica).
- Si algún paso falla, no se crea ningún registro (nada parcial en DB).
- La creación es transaccional: `registerAccount` ya usa `db.transaction`; `updateStaffInvitationAccepted` se ejecuta fuera de esa transacción pero inmediatamente después.
- El `staff` se crea con `status = 'active'` por defecto (valor del schema).
- La verificación de security word ocurre server-side con `bcrypt.compare(securityWord, invitation.securityWordHash)`. Si la invitación no tiene security word, se omite.
- `confirmPassword` no se envía al API; se valida solo en el form del dashboard.

### Entrega 4 — Campo de vencimiento

- `expiresInMs` es obligatorio en el form; el `SelectField` siempre tiene el valor default (48 h) pre-seleccionado.
- Valores permitidos fijos: `43200000` (12 h), `86400000` (24 h), `172800000` (48 h), `604800000` (7 d). La API rechaza cualquier otro valor con 400.
- El TTL hardcodeado (`STAFF_INVITATION_TTL_MS`) en `staff-invitation.utils.ts` queda como fallback del API si `expiresInMs` no se provee (compatibilidad); en la práctica el form siempre lo envía.
- El `successDescription` en la UI usa la duración elegida, no un texto fijo.

### Entrega 5 — Eliminación de invitaciones al aceptar/expirar — Incluye

- `deleteStaffInvitationById(id)` en `staff-invitations.repository.ts` — hard delete por ID; reemplaza `updateStaffInvitationAccepted` del plan E3.
- `deleteExpiredAndCancelledInvitations()` en `staff-invitations.repository.ts` — `DELETE WHERE expiresAt < now OR status = 'cancelled'`.
- `InvitationsCleanupScheduler` en `apps/api` — `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)` llama `deleteExpiredAndCancelledInvitations`.
- `ScheduleModule.forRoot()` en `AppModule` + instalar `@nestjs/schedule`.

### Entrega 5 — No incluye

- Log o auditoría de invitaciones eliminadas.
- Restaurar invitaciones borradas.
- Cambios en `dashboard` (GET devuelve solo las filas existentes, que serán `pending`).

---

### Contratos — Entrega 5

**DB**

| Función                                  | Tabla               | Operación                                                             |
| ---------------------------------------- | ------------------- | --------------------------------------------------------------------- |
| `deleteStaffInvitationById(id)`          | `staff_invitations` | `DELETE WHERE id = ?`                                                 |
| `deleteExpiredAndCancelledInvitations()` | `staff_invitations` | `DELETE WHERE expiresAt < now() OR status IN ('expired','cancelled')` |

> `deleteStaffInvitationById` reemplaza `updateStaffInvitationAccepted` en el flujo de E3 (paso 11 del service).

---

### Reglas de negocio — Entrega 5

- **Al aceptar:** borrar la fila de `staff_invitations` tras crear `account` + `staff` + `staff_account_lnk`. Si el delete falla, loguear el error y no revertir la creación de cuenta.
- **Cron:** ejecuta diariamente a medianoche UTC. Elimina filas donde `expiresAt < now()` O `status IN ('expired', 'cancelled')`.
- **Listado E2:** el `GET /invitations/staff` devuelve solo las filas existentes; en la práctica solo `pending` con eventual aparición de `cancelled` en la ventana entre cancelación y cron.
- **Badge UI "vencida":** sigue siendo válida para `pending` con `expiresAt` pasado en la ventana antes del cron.

---

## Preguntas abiertas

- ¿Agregar `AvatarImage` cuando `avatar` es URL absoluta de R2 o solo paths relativos? (entrega 1)
- ¿Conectar `POST /invitations/staff` en el formulario si aún usa generación local? → incluido en implementación entrega 2.
