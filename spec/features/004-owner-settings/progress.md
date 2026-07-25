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
- Sin cambios en `@repo/validators` ni `packages/db`.

**Corrección durante la implementación (mismo hilo, ya con "hacé la implementación"):** el usuario frenó el primer intento — había agregado `role` a `SessionResponse` (`GET /session/me`). Indicó explícitamente **no** poner el rol ahí: esos datos los debe dar el endpoint `/settings`. Motivo real encontrado en el código: `apps/dashboard/app/modules/common/services/owner.service.ts:25-35` (`toSessionUser`) reconstruye `SessionResponse` a partir de un `Pick` de campos de owner sin `role`, usado para actualizar el store de sesión tras guardar el perfil (optimistic update) — agregar `role` ahí habría roto ese mapeo o forzado un valor hardcodeado falso. Se revirtió `SessionResponse` y en su lugar `CurrentOwnerResponse` y `StaffSettingsResponse` llevan cada una su propio `role` como discriminante de la unión `SettingsResponse`. El dispatcher del dashboard ahora resuelve qué vista mostrar en base a la respuesta de `GET /settings`, no de la sesión. `spec.md` y `plan.md` actualizados para reflejar esto.

Plan queda escrito, implementación en curso.

**Segunda corrección, post-implementación e post-verificación (mismo hilo):** el usuario pidió sacar `modules/settings/owner/` y `modules/settings/staff/` de adentro de `modules/settings/` y subirlas de nivel. Primer intento del asistente: `modules/settings-owner/` y `modules/settings-staff/` (para no colisionar con `modules/staff/` ya existente, gestión de personal). El usuario corrigió en dos pasos: `settings-owner` → simplemente `owner` (sin colisión real, no hacía falta el prefijo); `settings-staff` → fusionar sus archivos **dentro de** `modules/staff/` ya existente (no un módulo nuevo). Estructura final: `modules/owner/` (top-level), `modules/staff/components/staff-settings-view.tsx` (agregado al módulo existente), `modules/settings/` (solo el despachador + fetch compartido). Esto hace que `settings-view.tsx` importe de módulos hermanos (`owner`, `staff`), apartándose a propósito de la regla de `ARCHITECTURE.md` sobre no importar entre módulos. Type-check + lint verificados en verde tras cada paso.

---

---

## Ampliación (2026-07-04) — Dirección del owner

Feature `done` reabierta para un cambio acotado: agregar dirección editable en `/settings` del owner.

| Fase | Nombre          | Estado |
| ---- | --------------- | ------ |
| 2    | Alcance         | `done` |
| 3    | User stories    | `done` |
| 4    | Contratos       | `done` |
| 5    | Reglas y cierre | `done` |

**Fase 1 (identidad):** usuario eligió extender 004 directamente en vez de crear feature nueva (013) — sin reabrir fila de `roadmap.md`.

**Fase 2 (alcance) — respuestas `AskUserQuestion`:**

- Campos: `address`, `streetNumber`, `state`, `city` (igual que `ClubResponse`).
- Obligatoriedad: opcional, todo-o-nada (si se completa uno, los 4 son requeridos).
- Bloque separado `address` en el form, no aplanado dentro de `profile`.

**Fase 4 (contratos, parcial) — decisión de modelo de datos:** en vez de crear `owner_addresses_lnk` en paralelo a la `user_addresses_lnk` sin uso (propuesta inicial del asistente), el usuario pidió **repurpose**: renombrar `user_addresses_lnk` → `owner_addresses_lnk` (FK `ownerId` en vez de `userId`) y eliminar la definición vieja, en vez de mantener dos tablas de link. Ver `spec.md` → Contratos → Datos para el detalle. Falta cerrar: nombre exacto de columnas de migración, y si el `superRefine` va en `owner.ts` o se comparte utilitario con `user.ts` (asistente propone no compartir, a confirmar).

**Fase 3 (user stories) — respuestas `AskUserQuestion`:** US-3 confirmada (ver `spec.md`), staff queda fuera de esta ampliación.

**Fase 4 (contratos, cierre) — respuestas `AskUserQuestion`:** validador propio en `owner.ts`, sin helper compartido con `user.ts`.

**Fase 5 (reglas y cierre) — respuestas `AskUserQuestion`:**

- Edge case borrado: una vez cargada la dirección, los 4 campos quedan obligatorios (no se puede volver a vacío desde este form).
- Status: **`approved`** — spec lista para pasar a `plan.md`/`tasks.md` (Fase 6) o implementación directa.

### Fase 6 (plan técnico) + implementación

Usuario pidió "seguí con lo que tengas" — se pasó directo a `plan.md`/`tasks.md` e implementación en el mismo hilo.

**Ajuste de diseño encontrado durante la implementación:** al mirar `packages/validators/src/settings.ts`, `settingsFormSchema.profile` ya es literalmente `updateCurrentOwnerSchema` (sin wrapper adicional) y el submit del form (`settings-form-context.tsx`) manda `validation.data.profile` tal cual al `PATCH /settings`. Como `updateCurrentOwnerSchema` ahora incluye `address` como campo propio, el shape ya venía anidado (`profile.address`), no como hermano top-level de `profile` (lo que se había planteado como opción en Fase 4). Se implementó así — `address` como bloque separado _dentro_ de `profile` (con su propio setter `setNestedProfileField`, su propia sección de UI, su propio id de foco) — porque es el camino de menor fricción que ya coincide con el contrato real, sin tener que bifurcar el payload en el submit. Zod collapsa el error del `superRefine` (todo-o-nada) a un único campo `errors.profile.address` (el `mapSettingsFormErrors` existente ya lo maneja sin cambios, por cómo desestructura `issue.path`).

**Bloqueador encontrado (no relacionado a esta feature):** `packages/db/src/migrations/meta/0010_snapshot.json` no existe en el repo (confirmado con `git log` — nunca se commiteó), lo que rompe `drizzle-kit generate` para cualquier migración nueva, no solo `owner_addresses_lnk`. Se le preguntó al usuario cómo seguir (reconstruir el snapshot faltante vs. dejarlo para después); **el usuario eligió arreglarlo aparte** — el código de schema/repositorio quedó escrito y tipado, pero la migración SQL no se generó ni se corrió en esta sesión. La verificación manual en browser queda pendiente hasta que la migración exista.

**Verificado en esta sesión:** `tsc --noEmit` en `types`, `validators`, `db`, `i18n`, `api`, `dashboard` (todos en verde); `pnpm lint` (0 errores); `pnpm check:i18n` (paridad es/en OK). Pendiente: migración + verificación manual en browser (ver `tasks.md`).

## Supuestos del asistente

- Fila existente **#004 owner-settings** en `roadmap.md` (no feature nueva).
- Apps: `api` (`GET /owners/details`, `PATCH /owners/me` ya implementados en `owner.controller.ts`) + `dashboard` (ruta `/settings`, ya implementada parcialmente).
- Dependencia única: `001-auth-sessions`. `011-language-switcher` ya no depende de settings (el selector se movió al header del `AppShellLayout` en commit `a611b73`).
- Estado real del código al iniciar la spec: sección **Perfil** implementada y conectada a la API; secciones **Organización**, **Seguridad** y **Preferencias** fueron eliminadas en `a611b73` (2026-07-03) por quedar sin persistencia real — quedan pendientes de decidir si vuelven a la spec o quedan fuera de alcance (ver Fase 2).
