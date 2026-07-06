# Configuración del staff

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor                |
| ---------- | -------------------- |
| **ID**     | `012-staff-settings` |
| **Status** | `done`               |
| **Apps**   | `api` · `dashboard`  |

---

## Qué hace

La pantalla `/settings` del dashboard, cuando el usuario logueado es `staff`, deja de mostrar el placeholder "Hello World" y muestra un formulario real donde el staff ve y edita su perfil básico (nombre, apellido, teléfono); email y avatar quedan de solo lectura.

## Por qué

`004-owner-settings` separó la estructura de settings por rol pero dejó el contenido real de staff explícitamente fuera ("queda para una spec/entrega futura"). Staff invitado (ver [mission.md](../../constitution/mission.md)) opera con permisos acotados pero igual necesita mantener sus propios datos de cuenta, igual que el owner.

## Alcance

### Incluye

- Formulario de perfil de staff en `apps/dashboard/app/modules/staff/` (reemplaza `StaffSettingsView` placeholder): `name`, `lastName`, `phone` editables.
- `email` (vía `accounts`) y `avatar` visibles pero de solo lectura (sin input de edición, sin subida de archivo).
- `PATCH /settings` real para `role === staff`: persiste `name`/`lastName`/`phone` en tabla `staff` (hoy es no-op defensivo que solo devuelve `{ role: 'staff' }`).
- `GET /settings` para `role === staff` devuelve datos reales del staff (hoy solo `{ role: 'staff' }`).
- Reuso de la infraestructura de `004-owner-settings` (`SettingsController`, `SettingsService`, dispatcher `SettingsView`, tipo discriminado `SettingsResponse`) vía tipos/componentes genéricos donde aplique — se detalla en Contratos (Fase 4) y Plan técnico (Fase 6).

### No incluye

- Subida/edición de avatar — pertenece a `005-club-assets` (R2/files), no a esta spec.
- Cambio de password propio del staff.
- Preferencias, notificaciones o idioma — el selector de idioma ya está resuelto en `011-language-switcher`.
- Gestión de permisos por club o reasignación de club del staff — eso lo maneja el owner en `003-staff-invitations`, no el propio staff.

---

## User stories

### US-1: Staff edita su perfil

**Como** usuario staff
**Quiero** ver y editar mis datos básicos de perfil en `/settings`
**Para** mantener mi información de cuenta actualizada

**Criterios de aceptación**

- [x] **Dado** que entro a `/settings` con rol `staff`, **Cuando** carga la pantalla, **Entonces** veo un formulario con `nombre`, `apellido` y `teléfono` editables, y `email`/`avatar` de solo lectura — reemplaza el placeholder "Hello World". Verificado en browser (Playwright) contra la API real.
- [x] **Dado** que edito uno o más campos y confirmo, **Cuando** el `PATCH /settings` resuelve OK, **Entonces** veo confirmación visual y los valores persisten (recargar la página mantiene los cambios). Verificado: editar nombre → "Listo. Actualizamos tu perfil." → reload → valor persiste.

---

## Contratos

### API (si aplica)

| Método | Ruta        | Auth |
| ------ | ----------- | ---- |
| GET    | `/settings` | JWT  |
| PATCH  | `/settings` | JWT  |

Sin rutas nuevas — mismos endpoints de `004-owner-settings`, `SettingsController`/`SettingsService` reciben lógica real para `role === staff`.

**Tipos (`@afterdark/types`, base compartida + extend)**

```ts
interface BaseProfileResponse {
  sub: string
  name: string
  lastName: string
  email: string
  avatar: string | null
  role: UserRole
}

interface CurrentOwnerResponse extends BaseProfileResponse {
  role: typeof USER_ROLE.OWNER
  phone: string
  birthday: string | null
  nationalId: string | null
  taxId: string | null
  status: OwnerStatus
}

interface CurrentStaffResponse extends BaseProfileResponse {
  role: typeof USER_ROLE.STAFF
  phone: string
  status: StaffStatus
}

type SettingsResponse = CurrentOwnerResponse | CurrentStaffResponse
```

Reemplaza el `StaffSettingsResponse` actual (`{ role: 'staff' }`) por `CurrentStaffResponse` con datos reales. `SettingsResponse` sigue discriminada por `role`.

**Schemas (`@afterdark/validators`, base compartida + extend)**

```ts
const baseProfileSchema = z.object({
  name: z.string().trim().min(2).max(255),
  lastName: z.string().trim().min(2).max(255),
  phone: z.string().trim().min(8, '…').max(30, '…'),
})

export const updateCurrentOwnerSchema = baseProfileSchema.extend({
  birthday: /* … igual que hoy … */,
  nationalId: /* … */,
  taxId: /* … */,
})

export const updateCurrentStaffSchema = baseProfileSchema
```

`SettingsController` deja de usar un pipe fijo (`updateCurrentOwnerSchema` hardcodeado): elige el schema según `user.role` antes de parsear el body (mismo criterio de dispatch que ya usa `SettingsService`).

**Request / Response**

- `GET /settings` (staff) → `CurrentStaffResponse` completo (antes solo `{ role: 'staff' }`).
- `PATCH /settings` (staff) → body validado con `updateCurrentStaffSchema` (`name`, `lastName`, `phone`), persiste en tabla `staff`, devuelve `CurrentStaffResponse` actualizado (antes no-op).

**Errores (mensaje al usuario en español)**

| HTTP | Cuándo                                                               | Mensaje                                                                                                           |
| ---- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 401  | Sin sesión / JWT inválido                                            | Sin cambios (guard existente)                                                                                     |
| 404  | Staff no encontrado (`sub` no resuelve a `staff.documentId` vigente) | Reusa clave `staff.NOT_FOUND` (ya existe en `staff.service.ts`)                                                   |
| 400  | Validación de `name`/`lastName`/`phone`                              | Reusa claves `validation:field.*` ya usadas por owner (mismos patrones/mensajes, campos compartidos)              |
| 403  | Staff con `status = INACTIVE` intenta `PATCH /settings`              | Nueva clave `staff.INACTIVE` en `error-codes.ts` — "Tu cuenta de staff está inactiva, no podés editar tu perfil." |

### Datos (si aplica)

| Tabla / campo | Cambio                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `staff`       | Ninguno — `name`, `lastName`, `phone`, `avatar`, `status` ya existen. Solo se exponen/editan vía API. |

Repos nuevos en `packages/db/src/repositories/staff.repository.ts` (simétricos a `owners.repository.ts`):

- `findCurrentStaffByDocumentId(documentId)` — como `findCurrentOwnerByDocumentId`, pero con los campos de `staff` (agrega `status`, que `findStaffProfileByDocumentId` hoy no trae).
- `updateStaffProfileByDocumentId(documentId, { name, lastName, phone })` — como `updateOwnerByDocumentId`, acotado a los 3 campos editables.

### UI (si aplica)

| Ruta        | Pantalla                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/settings` | `StaffSettingsView` (`modules/staff/`) reemplaza el placeholder: formulario real con los mismos building blocks genéricos que usa `OwnerSettingsView`. |

**Reuso genérico (frontend)** — building blocks se mudan a `modules/settings/` como factory genérica, parametrizada por tipo de usuario/perfil:

- `createSettingsFormProvider<TUser extends BaseProfileResponse, TProfile>()` (reemplaza el actual `SettingsFormProvider` hardcodeado a owner) — vive en `modules/settings/hooks/`.
- `useSettingsFormValues` genérico sobre `TProfile` — vive en `modules/settings/hooks/`.
- `SettingsFormActions`, `SettingsStatusBanner`, `SettingsSection`, `SETTINGS_FORM_ID`/`SETTINGS_SAVE_STATUS` — se mudan a `modules/settings/components|constants/` sin cambios de comportamiento, solo dejan de ser específicos de owner.
- `modules/owner/` instancia la factory con `CurrentOwnerResponse` + `updateCurrentOwnerSchema` + `ProfileSettingsSection` (campos owner, sin cambios visuales).
- `modules/staff/` instancia la misma factory con `CurrentStaffResponse` + `updateCurrentStaffSchema` + un `StaffProfileSettingsSection` nuevo (campos: nombre, apellido, teléfono editables; avatar/email solo lectura — sin fecha nac./DNI/CUIT/CUIL/password, que no aplican a staff).

**Copy (español)**

| Contexto                                   | Clave i18n                                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acciones compartidas (guardar/descartar/…) | `settings.shared.actions.save\|discard\|dirty\|clean\|confirmLeave` (nuevo, reemplaza `settings.owner.actions.*` en el código pero mismo texto visible) |
| Mensajes compartidos (guardando/éxito/…)   | `settings.shared.messages.saving\|saveSuccess\|saveFallback\|validationSummary` (nuevo, ídem)                                                           |
| Título/descripción página staff            | `settings.staff.page.title` (ya existe, se reusa), agrega `settings.staff.page.description`                                                             |
| Campos staff                               | `settings.staff.profile.name\|lastName\|phone\|email\|avatarFallback` (nuevo, mismo copy visible que `owner.profile.*` para los campos compartidos)     |
| Sección                                    | `settings.staff.sections.profile` (nuevo)                                                                                                               |

Namespace `settings` pasa a tener `settings.shared.*` (acciones/mensajes comunes), `settings.owner.*` (campos/página específicos de owner) y `settings.staff.*` (campos/página específicos de staff, ya no placeholder).

---

## Reglas de negocio

- `GET /settings` (staff) funciona sin importar el `status` — solo lectura, no hay riesgo de que un staff inactivo lo use para operar.
- `PATCH /settings` (staff) chequea `status === ACTIVE` antes de persistir; si está `INACTIVE`, devuelve 403 con `staff.INACTIVE` (nueva clave) — mismo criterio que otros flujos de staff inactivo (ver `003-staff-invitations`, donde `INACTIVE` ya bloquea operaciones del club).
- El `email` nunca se edita desde `/settings`, para ningún rol — simétrico a owner (input `readOnly` en UI, no viaja en el schema de update).
- Igual que owner: `GET/PATCH /settings` resuelve la identidad del staff por `sub` del JWT (`staff.documentId`), no por parámetro de ruta/body.

## Preguntas abiertas

-
