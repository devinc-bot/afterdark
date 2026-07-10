# Progreso de entrevista — `web-user-registration`

> Estado de la entrevista guiada ([INTERVIEW.md](../../INTERVIEW.md)). Actualizar al cerrar cada fase.

| Fase | Nombre                   | Estado         |
| ---- | ------------------------ | -------------- |
| 1    | Identidad                | `done`         |
| 2    | Comportamiento y alcance | `done`         |
| 3    | User stories             | `done`         |
| 4    | Contratos                | `done`         |
| 5    | Reglas y cierre          | `done`         |
| 6    | Plan técnico             | `done`         |

Estados: `pending` · `in_progress` · `done`

---

## Log de respuestas

### Fase 1 — Identidad

**Respuestas del usuario:**

- Documentación: **nueva feature** `018-web-user-registration` (no ampliar 001).
- Post-registro: **redirigir a `/login` con mensaje de éxito**.
- Formulario: **incluye `confirmPassword`** (validación client-side, patrón dashboard).
- Copy: **namespace i18n `auth`**.

**Contexto del repo (pre-relleno):**

- `apps/web/app/routes/register.tsx` — placeholder: "El registro todavía no está disponible".
- `apps/web` ya tiene login funcional (`loginFn` → `POST /api/auth/login`).
- API ya expone `POST /auth/register/user` (`registerUserSchema`: name, lastName, email, password).
- `apps/dashboard` ya registra **dueños** en `/register` (`registerOwnerFn` → `POST /auth/register/owner`); tras éxito redirige a login sin mensaje visible hoy.
- Roadmap `001-auth-sessions` menciona registro user/owner pero `web` sigue sin implementar el de cliente.

### Fase 2 — Comportamiento y alcance

**Respuestas del usuario:**

- `RequireGuest` en **/register y /login** (redirige al home si ya hay sesión).
- Post-registro: redirigir a login y mostrar **toast** con mensaje de éxito.
- Copy registro: **reutilizar** claves `auth.register` existentes.
- Alcance: **migrar login de web a i18n** `auth` en la misma feature.

### Fase 3 — User stories

**Respuestas:** historias propuestas **aprobadas**. `RequireGuest` vía `GET /session/me`. Toast con clave i18n en cliente.

### Fase 4 — Contratos

Documentados en `spec.md` (API existente, UI, i18n, infra `web`).

### Fase 5 — Reglas y cierre

**Sesión en web (pregunta desarrollada):** patrón mínimo solo en `apps/web` — zustand store + `fetchSessionFn` + `useSession` + `RequireGuest`, token desde `localStorage` (no cookies como dashboard). Extraer a paquete compartido queda fuera de alcance.

**Meta title:** i18n en `head()` de cada ruta.

**Status:** `approved`.

### Fase 6 — Plan técnico

`plan.md` y `tasks.md` escritos.

### Fase 6 — Plan técnico

---

## Supuestos del asistente

- Rol objetivo: **cliente** (`USER_ROLE.USER`), no dueño ni staff.
- La API de registro de usuario ya existe; el alcance principal es UI + integración en `apps/web`.
