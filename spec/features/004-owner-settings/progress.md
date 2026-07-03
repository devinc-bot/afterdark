# Progreso de entrevista — `owner-settings`

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

Pregunta enviada vía `AskUserQuestion` (fila roadmap / apps / dependencias). Sin respuesta directa, pero el usuario siguió la conversación aportando alcance nuevo (settings por rol: owner vs staff) sin corregir los supuestos → se toman como confirmados. Fila #004 owner-settings, apps `api`+`dashboard`, dependencia `001-auth-sessions` — más `003-staff-invitations` (concepto de rol staff) a confirmar en Fase 2.

### Fase 2 — Comportamiento y alcance

Usuario pidió: `/settings` debe renderizar pantalla distinta según rol del usuario logueado (owner vs staff). Módulo `staff` para la vista de settings del staff, contenido "Hello World" como placeholder (funcionalidad real después).

Hallazgos técnicos relevantes para esta fase:

- **Colisión de nombre**: `apps/dashboard/app/modules/staff/` ya existe, pero es el módulo del _owner_ para administrar personal (CRUD, invitaciones — feature 003-staff-invitations). No es el módulo de un usuario staff viendo su propia pantalla. Necesita nombre distinto.
- **Gap de contrato**: `SessionResponse` (`GET /session/me`) no expone `role` hoy (`packages/types/src/api.ts:37-43`); el dashboard no tiene forma de saber si el usuario logueado es owner o staff sin agregarlo.

Respuestas del usuario (`AskUserQuestion`):

- Nombre módulo: crear `modules/settings/` y mover ahí lo de owner y staff (solo lo relacionado a settings). Todo `modules/owner/` es settings → se renombra/mueve completo a `modules/settings/owner/`; nuevo `modules/settings/staff/` para el placeholder.
- Fuente de rol: sí, agregar `role` a `SessionResponse`.
- Ruteo: una sola ruta `/settings`, render condicional por rol.
- Alcance placeholder: con `PageLayout` + i18n (namespace a definir en Fase 4).

### Fase 3 — User stories

Owner: sin cambio funcional (solo se mueve de carpeta). Aclaración del usuario sobre "agregar opciones que faltan en owner (ej. taxId)": confirmado que `taxId` ya existe, ya es editable y ya persiste vía `PATCH /owners/me` (`packages/validators/src/owner.ts:25`) — no es un gap, era un ejemplo para ilustrar que owner tiene campos que staff no tendrá. No se agrega nada nuevo al owner.

Staff: placeholder "Hello World" con `PageLayout` + i18n, sin datos.

Fuera de alcance: roles `admin`/`user` sin vista definida.

### Fase 4 — Contratos

Respuestas del usuario (`AskUserQuestion`):

- **API**: agregar `role: UserRole` a `SessionResponse` (`packages/types/src/api.ts:37-43`); `session.service.ts` lo toma de `payload.role` (ya disponible en `JwtPayload`), sin query nueva. Sin endpoint nuevo.
- **i18n**: namespace `settings` con sub-keys `settings.staff.title` y `settings.staff.placeholder` (texto "Hello World"). `settings.owner.*` ya existe, se realinea al mover carpeta.
- **Errores HTTP**: sin cambios, N/A — `/session/me` mantiene 401/404 existentes; vista staff no llama APIs.

### Fase 5 — Reglas y cierre

Respuestas del usuario (`AskUserQuestion`):

- **Rol sin vista (admin/user)**: fuera de alcance, sin guard ni fallback. Queda en Preguntas abiertas para entrega futura.
- **JWT legado**: en vez de la pregunta original (tokens viejos sin `role`), el usuario redirigió a un cambio de contrato mayor: mover `GET /owners/details` y `PATCH /owners/me` (`owner.controller.ts`) a un nuevo módulo API `settings` (`apps/api/src/modules/settings/`), con endpoint único `GET/PATCH /settings` que resuelve por `role` — owner recibe `CurrentOwnerResponse` completo (delega en `OwnerService` reusado), staff recibe objeto mínimo (placeholder, sin datos reales). Reabrió y amplió Fase 4 (ver contratos actualizados en `spec.md`). Confirmado en ronda de seguimiento: ruta `/settings` (no `/settings/me`), ambos verbos (GET y PATCH) se mueven.
- **Status**: `approved`.

### Fase 6 — Plan técnico

Borrador propuesto por el asistente en `plan.md` + `tasks.md`, leyendo `ARCHITECTURE.md` y código existente (`owner.controller.ts`, `owner.service.ts`, `session.service.ts`, `config/constants/api.ts`, `modules/common/queries/use-current-user.ts`, `locales/settings/es.json`). Resumen:

- Nuevo módulo API `apps/api/src/modules/settings/` (controller + service) que reusa `OwnerService` vía DI; `owner.controller.ts` se elimina.
- Dashboard: `modules/owner/` → `modules/settings/owner/`; nuevo `modules/settings/staff/`; dispatcher `modules/settings/components/settings-view.tsx` decide por `role` de la respuesta de `GET /settings`.
- i18n namespace `settings` se reestructura: contenido actual bajo `owner.*`, nuevo `staff.*`.
- Sin cambios en `@afterdark/validators` ni `packages/db`.

**Corrección durante la implementación (mismo hilo, ya con "hacé la implementación"):** el usuario frenó el primer intento — había agregado `role` a `SessionResponse` (`GET /session/me`). Indicó explícitamente **no** poner el rol ahí: esos datos los debe dar el endpoint `/settings`. Motivo real encontrado en el código: `apps/dashboard/app/modules/common/services/owner.service.ts:25-35` (`toSessionUser`) reconstruye `SessionResponse` a partir de un `Pick` de campos de owner sin `role`, usado para actualizar el store de sesión tras guardar el perfil (optimistic update) — agregar `role` ahí habría roto ese mapeo o forzado un valor hardcodeado falso. Se revirtió `SessionResponse` y en su lugar `CurrentOwnerResponse` y `StaffSettingsResponse` llevan cada una su propio `role` como discriminante de la unión `SettingsResponse`. El dispatcher del dashboard ahora resuelve qué vista mostrar en base a la respuesta de `GET /settings`, no de la sesión. `spec.md` y `plan.md` actualizados para reflejar esto.

Plan queda escrito, implementación en curso.

**Segunda corrección, post-implementación e post-verificación (mismo hilo):** el usuario pidió sacar `modules/settings/owner/` y `modules/settings/staff/` de adentro de `modules/settings/` y subirlas de nivel. Primer intento del asistente: `modules/settings-owner/` y `modules/settings-staff/` (para no colisionar con `modules/staff/` ya existente, gestión de personal). El usuario corrigió en dos pasos: `settings-owner` → simplemente `owner` (sin colisión real, no hacía falta el prefijo); `settings-staff` → fusionar sus archivos **dentro de** `modules/staff/` ya existente (no un módulo nuevo). Estructura final: `modules/owner/` (top-level), `modules/staff/components/staff-settings-view.tsx` (agregado al módulo existente), `modules/settings/` (solo el despachador + fetch compartido). Esto hace que `settings-view.tsx` importe de módulos hermanos (`owner`, `staff`), apartándose a propósito de la regla de `ARCHITECTURE.md` sobre no importar entre módulos. Type-check + lint verificados en verde tras cada paso.

---

## Supuestos del asistente

- Fila existente **#004 owner-settings** en `roadmap.md` (no feature nueva).
- Apps: `api` (`GET /owners/details`, `PATCH /owners/me` ya implementados en `owner.controller.ts`) + `dashboard` (ruta `/settings`, ya implementada parcialmente).
- Dependencia única: `001-auth-sessions`. `011-language-switcher` ya no depende de settings (el selector se movió al header del `AppShellLayout` en commit `a611b73`).
- Estado real del código al iniciar la spec: sección **Perfil** implementada y conectada a la API; secciones **Organización**, **Seguridad** y **Preferencias** fueron eliminadas en `a611b73` (2026-07-03) por quedar sin persistencia real — quedan pendientes de decidir si vuelven a la spec o quedan fuera de alcance (ver Fase 2).
