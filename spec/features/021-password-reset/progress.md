# Progreso de entrevista — `password-reset`

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

- Feature **nueva** (no estaba en roadmap).
- Título: **Reset de contraseña (dashboard)** · slug: `password-reset` · ID: `021`.
- Apps: `api` + `dashboard`. `web` fuera de esta entrega.
- Dependencias: `001-auth-sessions`, `019-email-service`.
- Usuario: “continua” → se aceptó la propuesta del asistente.

### Fase 2 — Comportamiento y alcance

- Usuario: “sigue” → se aceptó la propuesta.
- Qué hace / por qué / incluye / no incluye escritos en `spec.md`.

### Fase 3 — User stories

- Usuario: “sigue” → se aceptaron US-1/2/3 (solicitar link, definir password, volver al login).
- Invalidación de sesiones al resetear: queda como pregunta abierta / follow-up.

### Fase 4 — Contratos

- Usuario: “continua” → se aceptó la propuesta.
- API: `POST /auth/forgot-password`, `POST /auth/reset-password`; token en query `?token=`.
- Tabla `password_reset_tokens`; UI `/forgot-password` + `/reset-password`.

### Fase 5 — Reglas y cierre

- Usuario: “sigue” → reglas aceptadas; status → `approved`.
- TTL 60 min; solo owner/staff; anti-enumeración; sin rate limit ni revocación de sesiones en v1.

### Fase 6 — Plan técnico

- Usuario: “implementa” → plan aceptado; implementación en curso.
- Decisión: token JWT (paridad con invitaciones).

### Ampliación web (post-aprobación)

- Usuario: “continúa” → sumar `web`; roles `user`+owner+staff; link por rol (`WEB_URL` / `DASHBOARD_URL`).
-

## Supuestos del asistente

- Se reutiliza el template `passwordReset` de `019-email-service`.
- Roles: `user`, `owner`, `staff`.
- Token en query string (`/reset-password?token=`), no en path.
- Link del mail según rol (no según app de origen).
-
