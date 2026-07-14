# Progreso de entrevista — `google-auth`

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

- Feature nueva: `022-google-auth` — «Registro e inicio de sesión con Google».
- Apps: `api`, `web`, `dashboard`.
- Roles: cliente (`web`) + dueño (`dashboard`). Staff fuera de alcance.
- Depende de: `001-auth-sessions`. Reutiliza pantallas de login/registro existentes.
- UI: botón «Continuar con Google» (referencia visual; solo Google).

### Fase 2 — Comportamiento y alcance

- Qué hace: Continuar con Google en login/registro web+dashboard → sesión del rol.
- Por qué: bajar fricción de alta/login.
- Incluye: botón + separador «o», OAuth API (alta/login), auto-login post-callback, i18n.
- No incluye: otros providers, staff, account linking, badge Last used, Terms/Privacy del mock.
- Email ya existente con password: **B** — error, no vincular.

### Fase 3 — User stories

- Roles: cliente + dueño.
- US-1 / US-2 / US-3 aceptadas.
- Redirect post-éxito: home de cada app.
- Botón en login y registro de ambas apps.

### Fase 4 — Contratos

- Usuario: «sigue» → se adoptan las propuestas.
- API: `GET /auth/google` + `GET /auth/google/callback`; query `role` + `app`.
- Datos: `accounts.provider` (`local`\|`google`) + `provider_account_id` + `password` nullable (sin tabla `oauth_accounts`).
- UI: «Continuar con Google» + «o»; errores vía `/login?error=…`.

### Fase 5 — Reglas y cierre

- Usuario: «ok» → reglas aceptadas; status `approved`.
- Cross-rol (mismo email Google como user y owner): error, sin segundo perfil.
- Pregunta abierta: handoff JWT post-callback (hoy `localStorage` / cookie).

### Fase 6 — Plan técnico

- Usuario: «ok» → borrador `plan.md` + `tasks.md`.
- Handoff: bridge `/auth/callback?token=` por app (web localStorage, dashboard cookie).
- Sin Better Auth; OAuth sobre Nest actual.
- Guards login/forgot para `password == null`.

---

### Cambio acotado post-approved

- Usuario: columna `accounts.provider` (`local` \| `google`); auth original = `local`.
- Se añade también `provider_account_id` (Google `sub`) en `accounts`; se elimina la tabla `oauth_accounts` del plan.
-
