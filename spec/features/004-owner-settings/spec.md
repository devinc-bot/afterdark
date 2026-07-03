# Perfil y configuración del dueño

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor                |
| ---------- | -------------------- |
| **ID**     | `004-owner-settings` |
| **Status** | `done`               |
| **Apps**   | `api` · `dashboard`  |

---

## Qué hace

La pantalla `/settings` del dashboard muestra una vista distinta según el rol del usuario logueado: el dueño (`owner`) ve y edita su perfil (ya implementado); el staff (`staff`) ve una vista propia del módulo `settings` — por ahora un placeholder ("Hello World"), sin funcionalidad real todavía.

## Por qué

Owner y staff comparten el dashboard pero tienen necesidades de configuración distintas (staff opera con permisos acotados, ver [mission.md](../../constitution/mission.md)). Antes de construir el contenido real de settings para staff, se separa la estructura para que cada rol tenga su propio módulo sin mezclar código.

## Alcance

### Incluye

- `apps/dashboard/app/modules/owner/` (top-level, no anidado bajo `settings/`) con el formulario de perfil del owner.
- El placeholder de settings de staff ("Hello World", `PageLayout` + i18n, sin lógica de datos) vive como un componente más dentro de `apps/dashboard/app/modules/staff/` (módulo ya existente de gestión de personal, feature 003), no en un módulo separado.
- `SettingsView` en `modules/settings/` actúa como despachador: llama a `GET /settings` **una sola vez** y renderiza vista owner o staff según el `role` que viene en esa misma respuesta (no según la sesión).
- Nuevo módulo API `settings` (`apps/api/src/modules/settings/`) con `GET /settings` y `PATCH /settings`, que reemplazan a `GET /owners/details` y `PATCH /owners/me` (se eliminan de `modules/owner/`). Resuelve por `role` del JWT: delega en `OwnerService` para owner, devuelve objeto mínimo para staff. El `role` viaja en el **body de la respuesta** (`SettingsResponse`), no en `SessionResponse`.
- Ruta `/settings` (dashboard) sigue siendo única; sin rutas nuevas en el front.

### No incluye

- Contenido real de settings para staff (queda para una spec/entrega futura, solo placeholder ahora).
- Traer de vuelta las secciones Organización/Seguridad/Preferencias eliminadas en `a611b73` (fuera de esta spec).
- Cambios a permisos/guards de API más allá de exponer `role` en la sesión.

---

## User stories

### US-1: Owner edita su perfil

**Como** dueño de club
**Quiero** ver y editar mis datos de perfil en `/settings`
**Para** mantener mi información de cuenta actualizada

**Criterios de aceptación**

- [x] **Dado** que entro a `/settings` con rol `owner`, **Cuando** carga la pantalla, **Entonces** veo el formulario de perfil (nombre, apellido, teléfono, fecha de nacimiento, DNI, CUIT/CUIL editables; email de solo lectura) — verificado en browser (Playwright) contra la API real.
- [x] **Dado** que el owner tiene campos editables que el staff no tiene (ej. CUIT/CUIL), **Cuando** se compara con la vista de staff, **Entonces** la diferencia queda documentada acá — no implica agregar campos nuevos, `taxId` ya es editable y persiste vía `PATCH /settings`.

### US-2: Staff ve su propia pantalla de settings (placeholder)

**Como** usuario staff
**Quiero** tener mi propia pantalla en `/settings`, distinta a la del owner
**Para** que en el futuro pueda configurar mis propias preferencias sin mezclarse con las del dueño

**Criterios de aceptación**

- [x] **Dado** que entro a `/settings` con rol `staff`, **Cuando** carga la pantalla, **Entonces** veo un `PageLayout` con título (i18n) y el texto placeholder "Hello World" — sin formulario, sin llamadas a API de perfil (verificado: `SettingsFormContent`/`updateCurrentOwner` nunca se montan para staff).
- [x] **Dado** que soy staff, **Cuando** superviso las opciones disponibles, **Entonces** no veo ninguna de las opciones de perfil del owner (nombre, DNI, CUIT/CUIL, etc.) — son módulos separados, confirmado en screenshot.

---

**Fuera de esta spec:** roles `admin` y `user` no tienen vista definida en `/settings` todavía (no se contemplan en esta entrega).

---

## Contratos

### API (si aplica)

| Método | Ruta          | Auth             |
| ------ | ------------- | ---------------- |
| GET    | `/session/me` | JWT (sin cambio) |
| GET    | `/settings`   | JWT              |
| PATCH  | `/settings`   | JWT              |

**`/session/me`** — **sin cambios**. `SessionResponse` (`packages/types/src/api.ts:37-43`) no agrega `role`: el dashboard usa `toSessionUser` (`apps/dashboard/app/modules/common/services/owner.service.ts`), que construye `SessionResponse` a partir de un subconjunto de campos de owner sin `role` — agregar `role` ahí rompería ese mapeo (optimistic update del store de sesión tras guardar el perfil). El rol se obtiene únicamente de la respuesta de `/settings`.

**`/settings` (nuevo módulo `settings` en `apps/api/src/modules/settings/`)** — reemplaza a `GET /owners/details` y `PATCH /owners/me` (`owner.controller.ts`), que se eliminan de `modules/owner/`:

- `SettingsController` (`@Controller('settings')`) resuelve por `user.role` (del JWT, `payload.role` — interno, no expuesto en `/session/me`) y delega en `OwnerService` (reusado, sin cambios internos) cuando `role === owner`.
- `GET /settings` → `SettingsResponse = CurrentOwnerResponse | StaffSettingsResponse`, discriminada por el campo `role` que ambas variantes incluyen:
  - `role === owner` → `CurrentOwnerResponse` completo (igual a lo que hoy devuelve `GET /owners/details`), con `role: 'owner'` agregado.
  - `role === staff` → `{ role: 'staff' }` — sin datos reales todavía, el dashboard solo lo usa para decidir qué vista renderizar.
- `PATCH /settings`:
  - `role === owner` → misma validación y lógica que hoy `PATCH /owners/me` (`updateCurrentOwnerSchema`, `OwnerService.updateCurrentOwner`), solo cambia la ruta.
  - `role === staff` → no-op defensivo, devuelve `{ role: 'staff' }` sin persistir nada (staff no edita nada todavía; el placeholder de dashboard nunca llama este PATCH).
- El dashboard llama `GET /settings` **una sola vez** desde el despachador `SettingsView`; mientras carga muestra un estado de loading genérico (no sabe todavía si es owner o staff). Al resolver, discrimina por `data.role` y renderiza la vista correspondiente — la vista owner recibe los datos ya obtenidos como prop (sin fetch duplicado).

**Errores (mensaje al usuario en español)**

Sin cambios de fondo: mismos casos que hoy tienen `/owners/details` y `/owners/me` (401 sin sesión, 404 `owner.NOT_FOUND` para owner), solo se reubican bajo `/settings`. `/session/me` mantiene 401/404 `auth.SESSION_NOT_FOUND` sin cambios.

### Datos (si aplica)

| Tabla / campo | Cambio                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------- |
| —             | Ninguno — `role` ya existe en `JwtPayload`; `OwnerService` se reutiliza sin cambios de esquema. |

### UI (si aplica)

| Ruta        | Pantalla                                                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/settings` | `SettingsView` (en `modules/settings/`) despacha por `role`: `modules/owner/` (perfil, sin cambios funcionales) o `modules/staff/` (placeholder, componente agregado al módulo existente). |

**Copy (español)**

| Contexto           | Texto (clave i18n)                                                         |
| ------------------ | -------------------------------------------------------------------------- |
| Título vista staff | `settings.staff.title`                                                     |
| Cuerpo placeholder | `settings.staff.placeholder` → "Hello World" (placeholder, sin copy final) |

Namespace `settings` agrupa `settings.owner.*` (ya existente, se realinea) y `settings.staff.*` (nuevo).

---

## Reglas de negocio

- El endpoint `GET/PATCH /settings` resuelve la lógica por `role` del JWT (`payload.role`), igual patrón que `SessionService.findProfileByRole` — no por parámetro de query ni body.
- Roles `admin`/`user` no tienen caso definido en `/settings` (ni dashboard ni API) — ver Preguntas abiertas.
- Tokens JWT emitidos antes de este cambio no tienen impacto práctico: los access tokens de corta vida se renuevan naturalmente tras el deploy: no se agrega manejo especial para `role` ausente.

## Preguntas abiertas

- **Fase 1 (identidad) respondida por defecto sin confirmación del usuario** — no hubo respuesta a `AskUserQuestion` en 60s. Asumido: fila existente #004 owner-settings, apps `api`+`dashboard`, dependencia única `001-auth-sessions`. Confirmar en próximo turno.
- **Rol sin vista (admin/user) en `/settings`** — queda explícitamente fuera de alcance de esta spec, tanto en dashboard (`SettingsView`) como en API (`SettingsController`). Sin guard, sin redirect, sin fallback definido. Pendiente para una entrega futura si estos roles llegan a usar el dashboard.
