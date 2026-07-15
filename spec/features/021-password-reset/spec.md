# Reset de contraseña

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor                       |
| ---------- | --------------------------- |
| **ID**     | `021-password-reset`        |
| **Status** | `approved`                  |
| **Apps**   | `api` · `dashboard` · `web` |

---

## Qué hace

Un dueño, staff o cliente puede pedir un link de recuperación por email y, al abrirlo, definir una contraseña nueva para volver a iniciar sesión (dashboard o web según el rol).

## Por qué

Hoy `/forgot-password` es un placeholder: si olvidan la contraseña, no hay forma de recuperar el acceso al panel. Cerrar ese hueco alinea con cuentas confiables y operación del club ([mission.md](../../constitution/mission.md)). Reutiliza la infra de mail ya aprobada (`019-email-service`). Los clientes en `web` necesitan el mismo flujo.

## Alcance

### Incluye

- Formulario “olvidé mi contraseña” (email) en `dashboard` y `web`.
- Envío de email con link de reset (template `passwordReset` de `019`).
- Pantalla para definir nueva contraseña mediante token del link (ambas apps).
- Endpoints API: solicitar reset + confirmar nueva contraseña.
- Persistencia de token de reset (`password_reset_tokens`).
- Link del mail según rol: `user` → `WEB_URL`, `owner`/`staff` → `DASHBOARD_URL`.

### No incluye

- Cambio de contraseña estando autenticado (settings / perfil).
- Magic link o OTP sin contraseña nueva.
- SMS u otros canales fuera de email.
- Rediseño del flujo de login más allá del enlace a forgot-password.

---

## User stories

### US-1: Solicitar link de recuperación

**Como** dueño, staff o cliente  
**Quiero** pedir un link de recuperación con mi email  
**Para** recuperar el acceso sin ayuda externa

**Criterios de aceptación**

- [ ] **Dado** un email de cuenta existente (user/owner/staff) **Cuando** envío el formulario de forgot-password **Entonces** veo una confirmación genérica y recibo un email con el link de reset (web o dashboard según rol).
- [ ] **Dado** un email que no existe (o rol no elegible) **Cuando** envío el formulario **Entonces** veo la misma confirmación genérica (sin revelar si el email existe).

### US-2: Definir contraseña nueva

**Como** dueño, staff o cliente con un link válido  
**Quiero** elegir una contraseña nueva  
**Para** poder iniciar sesión de nuevo

**Criterios de aceptación**

- [ ] **Dado** un token válido, no usado y no expirado **Cuando** envío contraseña + confirmación válidas **Entonces** se actualiza el hash de la cuenta y puedo hacer login con la nueva contraseña.
- [ ] **Dado** un token inválido, expirado o ya usado **Cuando** abro el link o envío el formulario **Entonces** veo un error en español y la contraseña no cambia.

### US-3: Volver al login

**Como** visitante en forgot-password o reset-password  
**Quiero** volver a la pantalla de login  
**Para** entrar si ya recuerdo la contraseña

**Criterios de aceptación**

- [ ] **Dado** que estoy en `/forgot-password` o en la pantalla de reset **Cuando** uso el enlace/botón de volver **Entonces** navego a `/login`.

---

## Contratos

### API

| Método | Ruta                    | Auth    |
| ------ | ----------------------- | ------- |
| `POST` | `/auth/forgot-password` | público |
| `POST` | `/auth/reset-password`  | público |

**Request / Response**

| Endpoint | Schema (Zod)           | Body                                   | Response                                         |
| -------- | ---------------------- | -------------------------------------- | ------------------------------------------------ |
| Forgot   | `forgotPasswordSchema` | `{ email }`                            | `204 No Content` (siempre, si el body es válido) |
| Reset    | `resetPasswordSchema`  | `{ token, password, confirmPassword }` | `204 No Content`                                 |

- `password` / `confirmPassword`: mínimo 8 caracteres; deben coincidir (mismo patrón que registro).
- Rutas registradas en `API_ROUTES.auth` (`packages/common`).

**Errores (mensaje al usuario en español)**

| HTTP | Cuándo                                                    | Mensaje                                                 |
| ---- | --------------------------------------------------------- | ------------------------------------------------------- |
| 400  | Validación Zod (email, password, match)                   | Mensajes de `@afterdark/validators` / i18n `validation` |
| 400  | Token inválido, expirado o ya usado                       | `El enlace no es válido o ya expiró.`                   |
| 429  | ≥10 forgot-password el mismo día UTC (cuenta owner/staff) | `Demasiados intentos. Probá de nuevo más tarde.`        |

### Datos

| Tabla / campo                   | Cambio                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `password_reset_tokens` (nueva) | `accountId` → `accounts`, `token` UNIQUE, `expiresAt`, `usedAt` nullable, columnas base |
| `accounts.password`             | Se actualiza el hash al confirmar reset (sin columna nueva)                             |

- Un nuevo forgot para la misma cuenta invalida (o marca usados) los tokens previos pendientes.
- El link del email apunta a `/reset-password?token=…` en `WEB_URL` (rol `user`) o `DASHBOARD_URL` (owner/staff).

### UI (`dashboard` · `web`)

| Ruta               | Pantalla                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| `/forgot-password` | Formulario email → estado de éxito genérico                            |
| `/reset-password`  | Formulario nueva contraseña + confirmación (token por query `?token=`) |

**Copy (español)** — namespace i18n `auth`

| Contexto             | Texto (propuesta)                                              |
| -------------------- | -------------------------------------------------------------- |
| Forgot — título      | Recuperar contraseña                                           |
| Forgot — descripción | Ingresá tu email y te enviamos un enlace.                      |
| Forgot — CTA         | Enviar enlace                                                  |
| Forgot — éxito       | Si el email está registrado, vas a recibir un enlace en breve. |
| Forgot — volver      | Volver al inicio de sesión                                     |
| Reset — título       | Nueva contraseña                                               |
| Reset — CTA          | Guardar contraseña                                             |
| Reset — error token  | El enlace no es válido o ya expiró.                            |
| Reset — éxito        | Contraseña actualizada. Ya podés iniciar sesión.               |

---

## Reglas de negocio

1. Cuentas con rol **user**, **owner** o **staff** reciben email de reset. Email inexistente u otro rol: misma respuesta `204`, sin mail.
2. TTL del token: **60 minutos** desde la creación.
3. Un forgot nuevo para la misma cuenta invalida (marca usados / descarta) los tokens previos pendientes.
4. Token de **uso único**: al reset exitoso se setea `usedAt`; no se puede reutilizar.
5. Anti-enumeración: `POST /auth/forgot-password` responde `204` si el body es válido y no hay rate limit (email inexistente o rol no elegible: sin mail).
6. No se invalidan JWT/refresh existentes en esta entrega (no hay store de revocación hoy).
7. Máximo **10** solicitudes de forgot-password por cuenta y día UTC; al superar el límite → `429` con mensaje de demasiados intentos.
8. Password nueva: mínimo 8 caracteres; debe coincidir con `confirmPassword`.
9. Cron diario (medianoche UTC) elimina filas de `password_reset_tokens` con `expiresAt` pasado.
10. URL del link: rol `user` → `WEB_URL`; `owner`/`staff` → `DASHBOARD_URL`.

## Preguntas abiertas

- Reset también en `web` → entrega posterior (fuera de alcance).
- Invalidar sesiones / refresh al completar reset → follow-up cuando exista revocación de tokens.
-
