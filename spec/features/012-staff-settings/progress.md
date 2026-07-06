# Progreso de entrevista — `staff-settings`

> Estado de la entrevista guiada ([INTERVIEW.md](../../INTERVIEW.md)). Actualizar al cerrar cada fase.

| Fase | Nombre                   | Estado |
| ---- | ------------------------ | ------ |
| 1    | Identidad                | `done` |
| 2    | Comportamiento y alcance | `done` |
| 3    | User stories             | `done` |
| 4    | Contratos                | `done` |
| 5    | Reglas y cierre          | `done` |
| 6    | Plan técnico             | `done` |

Estados: `pending` · `in_progress` · `done`

---

## Log de respuestas

### Fase 1 — Identidad

- Feature nueva (no reabre `004-owner-settings`, que quedó `done`): esa spec dejó "contenido real de settings para staff" fuera de alcance explícitamente.
- ID: `012-staff-settings` (siguiente número libre en roadmap).
- Apps: `api` + `dashboard` (mismo patrón que 004).
- Dependencias: `004-owner-settings` (reusa `SettingsController`/`SettingsService`, dispatcher `SettingsView`, tipo `SettingsResponse` discriminado por `role`). Implícitas por transitividad: `001-auth-sessions` (JWT/guards) y `003-staff-invitations` (tabla `staff` con `name`, `lastName`, `phone`, `avatar`, `status`, más `staff-account-lnk` → email vía `accounts`).
- Pedido explícito del usuario: reusar lo del owner "mediante tipos genéricos" — se retoma en Fase 4/6 (contrato API/UI), no es una decisión de identidad.

### Fase 2 — Comportamiento y alcance

- Alcance: editar perfil básico (`name`, `lastName`, `phone`). `avatar` y `email` de solo lectura, sin subida de archivo.
- Motivación: cierra deuda explícita de `004-owner-settings`.
- Fuera de alcance: avatar upload (005), cambio de password, preferencias/notificaciones/idioma (011 ya resuelto), gestión de permisos por club (eso es del owner en 003).

### Fase 3 — User stories

- US-1 sin validación de formato como criterio explícito (se resuelve a nivel Zod schema en Contratos, no como criterio de aceptación aparte).
- Reuso confirmado: shell (`FormLayout`, `SettingsFormActions`, `SettingsStatusBanner`) compartido/genericizado entre owner y staff; `ProfileSettingsSection` (campos) queda específico por rol — pedido original del usuario de "tipos genéricos" se resuelve acá y en Plan técnico.

### Fase 4 — Contratos

- Tipos: `BaseProfileResponse` compartida, `CurrentOwnerResponse`/`CurrentStaffResponse` extienden. Esto responde al pedido original del usuario ("reusar via tipos genéricos").
- Validación PATCH: `baseProfileSchema` (name/lastName/phone) + `.extend()` para owner (birthday/nationalId/taxId). Controller dispatchea schema por `user.role` (reemplaza pipe fijo actual).
- Frontend: building blocks (`SettingsFormProvider`, `useSettingsFormValues`, `Actions`, `StatusBanner`, `SettingsSection`, constantes) se mudan de `modules/owner/` a `modules/settings/` como factory genérica `createSettingsFormProvider<TUser, TProfile>()`; owner y staff instancian cada uno con su tipo/schema/sección de campos propia.
- i18n: claves de acciones/mensajes comunes pasan a `settings.shared.*`; `owner.*`/`staff.*` quedan solo para lo específico de cada rol.
- Repos nuevos simétricos a owner: `findCurrentStaffByDocumentId`, `updateStaffProfileByDocumentId` en `staff.repository.ts`.
- Errores: reusa `staff.NOT_FOUND` (ya existe) y `validation:field.*` (mismos patrones que owner para name/lastName/phone).

### Fase 5 — Reglas y cierre

- Staff `INACTIVE` bloqueado en `PATCH /settings` (403, nueva clave `staff.INACTIVE`) — simétrico a como `003-staff-invitations` ya trata `INACTIVE` para operaciones de club. `GET` sigue permitido igual.
- Email de solo lectura para ambos roles, sin cambios.
- Identidad resuelta por `sub` del JWT, igual patrón que owner.
- Spec aprobada, status → `approved` en `spec.md` y `roadmap.md`.

### Fase 6 — Plan técnico

- `plan.md`: 6 capas (types → validators → db → api → i18n → dashboard). Generic real en frontend: `createSettingsFormProvider<TUser extends BaseProfileResponse, TProfile>()` factory movida a `modules/settings/`, instanciada por owner y staff. Generic en backend: `baseProfileSchema` + `.extend()` para owner.
- `tasks.md` generado, checklist sin marcar (excepto spec&plan, ya completos).
- Entrevista completa. Lista para implementar.

---

## Supuestos del asistente

-
