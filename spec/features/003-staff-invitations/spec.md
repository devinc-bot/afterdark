# Staff e invitaciones — listado de personal (dashboard)

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo | Valor |
| ----- | ----- |
| **ID** | `003-staff-invitations` |
| **Status** | `approved` |
| **Apps** | `dashboard` |
| **Enfoque** | Conexión API del tab *Staff* (`StaffUserRecords`) en `/staff` |

---

## Qué hace

El dueño de clubes ve en `/staff` (tab *Staff*) el personal real asociado a sus clubes, cargado desde la API, en lugar de datos mock. Si no hay personal, ve un estado vacío dedicado. Los controles de activar/desactivar quedan deshabilitados hasta que exista persistencia en backend.

## Por qué

La tabla `StaffUserRecords` hoy usa `STAFF_USER_RECORDS_MOCK` y engaña sobre el estado real del negocio. Conectar `GET /staff/my-personnel` cierra el hueco entre API ya implementada y la UI del dashboard, sin ampliar scope a cambios de estado ni invitaciones en esta entrega.

## Alcance

### Incluye

- Prefetch del listado en el loader de la ruta `/staff`.
- Query/hook + service en `dashboard` contra `GET /api/staff/my-personnel`.
- Mapeo `StaffPersonnelItem` → `StaffUserRecord` (incl. `lastActiveLabel`, avatar/tone).
- Reemplazar `useState(STAFF_USER_RECORDS_MOCK)` en `StaffManagementView`.
- Estados: loading (Suspense), error recuperable, vacío sin tabla.
- Deshabilitar switch y acciones de cambio de estado en `StaffUserRecords`.

### No incluye

- Nuevos endpoints ni cambios en `apps/api`.
- Persistir activar/desactivar staff (`onStatusChange` / PATCH).
- Tab *Invitaciones* ni `POST /invitations/staff` (otra entrega de `003`).
- Aceptación de invitaciones por link/token.
- Filtros o búsqueda nuevos (se mantiene toolbar existente sobre datos reales).

---

## User stories

### US-1: Ver personal real

**Como** dueño de clubes  
**Quiero** ver en el tab *Personal* el equipo con invitación aceptada  
**Para** saber quién tiene acceso operativo en mis clubes

**Criterios de aceptación**

- [ ] **Dado** que inicié sesión como dueño con personal aceptado, **Cuando** entro a `/staff`, **Entonces** veo filas con nombre, correo, club, rol, última actividad y estado desde la API (no mock).
- [ ] **Dado** que la ruta carga, **Cuando** el prefetch está en curso, **Entonces** el tab *Personal* muestra fallback de Suspense hasta tener datos.
- [ ] **Dado** que tengo personal, **Cuando** uso la búsqueda del toolbar, **Entonces** filtro por nombre o correo sobre los datos reales.

### US-2: Sin personal registrado

**Como** dueño sin invitaciones aceptadas  
**Quiero** un mensaje claro cuando no hay equipo  
**Para** entender que debo invitar personal primero

**Criterios de aceptación**

- [ ] **Dado** que `GET /staff/my-personnel` devuelve `[]`, **Cuando** abro el tab *Personal*, **Entonces** no veo la tabla y sí el empty state con `STAFF_COPY.table.emptyTitle` y `emptyDescription`.
- [ ] **Dado** el empty state, **Cuando** miro la pantalla, **Entonces** el botón *Invitar personal* del header sigue visible y usable.

### US-3: Error de carga

**Como** dueño  
**Quiero** recuperarme si falla la carga del listado  
**Para** no quedar bloqueado sin opciones

**Criterios de aceptación**

- [ ] **Dado** que la API falla al listar personal, **Cuando** estoy en el tab *Personal*, **Entonces** veo un banner de error en español y un botón *Reintentar*.
- [ ] **Dado** el banner de error, **Cuando** pulso *Reintentar*, **Entonces** se vuelve a ejecutar la query y, si responde OK, se muestra la tabla o el empty state.

### US-4: Estado sin persistencia (acotación)

**Como** dueño  
**Quiero** que los controles de activar/desactivar no sugieran guardado falso  
**Para** no creer que cambié permisos en el servidor

**Criterios de aceptación**

- [ ] **Dado** el listado cargado, **Cuando** veo el switch de estado de un usuario, **Entonces** está deshabilitado (no editable).
- [ ] **Dado** el menú de acciones, **Cuando** la acción implica cambio de estado, **Entonces** permanece deshabilitada o no disponible según el diseño actual de `StaffUserRecords`.

---

## Contratos

### API (consumo existente)

| Método | Ruta | Auth |
| ------ | ---- | ---- |
| `GET` | `/api/staff/my-personnel` | JWT + rol `owner` (`JwtAuthGuard`, `OwnerRoleGuard`) |

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

| HTTP | Cuándo | Mensaje |
| ---- | ------ | ------- |
| 401 | Sin sesión / token inválido | Redirigir a login (comportamiento existente de `_app`) |
| 403 | Usuario no es dueño | Mensaje de API o fallback del dashboard |
| 500 | Error al listar | `No pudimos cargar el personal. Intentá de nuevo en unos minutos.` (`STAFF_MESSAGE.LIST_FAILED`) |

Sin cambios de request body ni endpoints nuevos en esta entrega.

### Datos

| Tabla / campo | Cambio |
| ------------- | ------ |
| — | Sin migraciones. Lectura vía `findPersonnelByOwnerDocumentId` (solo invitaciones `accepted`). |

### UI (`dashboard`)

| Ruta | Pantalla |
| ---- | -------- |
| `/_app/staff` | Tab *Personal*: tabla o empty; tab *Invitaciones* sin cambios en esta spec |

**Loader:** `beforeLoad` o `loader` de la ruta hace `queryClient.ensureQueryData(staffPersonnelQueryOptions())`.

**Mapeo API → `StaffUserRecord`**

| Campo UI | Origen |
| -------- | ------ |
| `id` | `documentId` |
| `name`, `email`, `clubId`, `clubName`, `role`, `status` | directo |
| `lastActiveAt` | `lastActiveAt.getTime()` |
| `lastActiveLabel` | `lastActiveAt` formateado absoluto `es-AR` (fecha + hora) |
| `avatarClassName` | tono por hash de `documentId` si no hay imagen; ignorar si hay URL de avatar |

**Copy (español)** — reutilizar `STAFF_COPY` salvo:

| Contexto | Texto |
| -------- | ----- |
| Error en tab + reintentar | `No pudimos cargar el personal. Intentá de nuevo.` + botón `Reintentar` (agregar en `staff.copy.ts` si no existe) |
| Empty tab Staff | `STAFF_COPY.table.emptyTitle` / `emptyDescription` |

---

## Reglas de negocio

- Solo aparece personal con invitación en estado `accepted` vinculada a un club del dueño autenticado (query en `staff.repository.ts`).
- El listado requiere sesión de dueño; la API aplica `OwnerRoleGuard`.
- Un mismo staff puede figurar más de una vez si está asignado a varios clubes (una fila por club/invitación aceptada).
- `lastActiveAt` en API hoy mapea `staff.updatedAt`; la UI lo muestra como actividad absoluta, sin reinterpretar en relativo.
- Cambios de `staff.status` no se envían al servidor en esta entrega; controles deshabilitados.

## Preguntas abiertas

- ¿Agregar `AvatarImage` cuando `avatar` es URL absoluta de R2 o solo paths relativos? (definir al implementar según formato real en DB.)
- ¿Invalidar query de personal tras aceptar invitación en otra pestaña? (fuera de scope; posible `invalidateQueries` en entrega de invitaciones.)
