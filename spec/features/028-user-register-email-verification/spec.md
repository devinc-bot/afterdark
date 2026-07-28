# Verificación de email en registro (cliente + dueño)

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor                                  |
| ---------- | -------------------------------------- |
| **ID**     | `028-user-register-email-verification` |
| **Status** | `approved`                             |
| **Apps**   | `api` · `web` · `dashboard`            |

---

## Qué hace

El usuario completa el registro manual, recibe un email con un link, y al abrirlo su cuenta se crea y queda autenticado.

- **Cliente (`web`):** rol `user` → home de la web.
- **Dueño (`dashboard`):** rol `owner` → panel `/dashboard`.

Hasta confirmar el correo **no** existe la cuenta en la base.

## Por qué

Hoy el registro manual puede persistir la cuenta sin comprobar que el correo sea real. Verificar el buzón antes de crear la cuenta reduce cuentas basura y alinea con cuentas confiables ([mission.md](../../constitution/mission.md)). Reutiliza `019-email-service` y el patrón token+link de `021-password-reset`. El flujo de **owner** en dashboard debe paridad con el de **user** en web.

## Alcance

### Incluye

- Flujo de registro manual del **cliente** (`web`): submit → “revisá tu correo” (sin crear cuenta aún).
- Flujo de registro manual del **dueño** (`dashboard`): mismo patrón UX.
- Endpoints:
  - `POST /auth/register/user/request` + `POST /auth/register/user/confirm`
  - `POST /auth/register/owner/request` + `POST /auth/register/owner/confirm`
- Persistencia de tokens pendientes:
  - `user_registration_tokens` (user)
  - `owner_registration_tokens` (owner) — misma forma de columnas
- Template(s) de email de verificación (React Email + i18n vía `019`); puede reutilizarse el de user con copy/URL de app.
- Rutas de confirmación:
  - `web`: `/register/confirm?token=…`
  - `dashboard`: `/register/confirm?token=…`
- Manejo de token inválido, expirado o ya usado (mensaje claro; si ya confirmado, login o CTA a login).
- Google **no** cambia (ni user ni owner).

### No incluye

- Deprecar/borrar de inmediato `POST /auth/register/user` ni `POST /auth/register/owner` (las apps dejan de usarlos; limpieza aparte).
- Registro / verificación de **staff**.
- Re-verificación o cambio de email de una cuenta ya creada.
- OTP / código numérico (solo link con token).
- Reenviar mail desde UI dedicada (re-submit del form = nuevo `request`).
- SMS u otros canales.
- Cambios al panel `/_app/dashboard` (KPI); solo el flujo de **auth/register**.

---

## User stories

### US-1: Solicitar registro con verificación (cliente)

**Como** cliente  
**Quiero** enviar el formulario de registro manual en la web  
**Para** recibir un email y confirmar que el correo es mío antes de crear la cuenta

**Criterios de aceptación**

- [ ] **Dado** que el formulario es válido y el email no está registrado, **Cuando** envío el registro, **Entonces** se llama a `POST /auth/register/user/request`, no se crea cuenta en DB, veo “revisá tu correo” y llega un email con el link.
- [ ] **Dado** que el email ya está registrado, **Cuando** envío el registro, **Entonces** recibo `409` en español y no se crea cuenta ni sesión.

### US-2: Confirmar email, registrar e iniciar sesión (cliente)

**Como** cliente  
**Quiero** abrir el link del email de verificación  
**Para** que se cree mi cuenta e inicie sesión automáticamente

**Criterios de aceptación**

- [ ] **Dado** un token válido, no expirado y no usado, **Cuando** abro `/register/confirm` en `web`, **Entonces** se llama a `POST /auth/register/user/confirm`, se crea account + user y quedo autenticado en el home.
- [ ] **Dado** un token inválido o expirado (sin cuenta creada), **Cuando** abro el link, **Entonces** veo error de enlace expirado/inválido (sin decir “ya verificado”), no hay sesión.
- [ ] **Dado** un token ya usado con cuenta existente, **Cuando** abro el link, **Entonces** inicio sesión (o veo CTA claro a login).

### US-3: Solicitar registro con verificación (dueño)

**Como** dueño  
**Quiero** enviar el formulario de registro manual en el dashboard  
**Para** recibir un email y confirmar el correo antes de crear la cuenta owner

**Criterios de aceptación**

- [ ] **Dado** formulario válido y email libre, **Cuando** envío el registro, **Entonces** se llama a `POST /auth/register/owner/request`, no se crea owner, veo “revisá tu correo” y llega el mail con link a dashboard.
- [ ] **Dado** email ya registrado, **Cuando** envío el registro, **Entonces** recibo `409` y no hay sesión.

### US-4: Confirmar email e iniciar sesión (dueño)

**Como** dueño  
**Quiero** abrir el link del email  
**Para** crear mi cuenta owner e ir al panel

**Criterios de aceptación**

- [ ] **Dado** token válido, **Cuando** abro `/register/confirm` en `dashboard`, **Entonces** se llama a `confirm` owner, se crea account + owner y quedo en `/dashboard`.
- [ ] **Dado** token inválido/expirado sin cuenta, **Cuando** abro el link, **Entonces** veo error claro sin mensaje engañoso de “ya verificado”.
- [ ] **Dado** token ya usado con cuenta owner, **Cuando** abro el link, **Entonces** inicio sesión o CTA a login.

### US-5: Google sin este flujo

**Como** cliente o dueño  
**Quiero** seguir con Google sin pasar por verificación por mail  
**Para** no duplicar un paso que Google ya resolvió

**Criterios de aceptación**

- [ ] **Dado** “Continuar con Google” en web o dashboard, **Cuando** completo OAuth, **Entonces** el flujo no llama a `request`/`confirm` de registro por email.

---

## Contratos

### API

| Método | Ruta                           | Auth    |
| ------ | ------------------------------ | ------- |
| `POST` | `/auth/register/user/request`  | público |
| `POST` | `/auth/register/user/confirm`  | público |
| `POST` | `/auth/register/owner/request` | público |
| `POST` | `/auth/register/owner/confirm` | público |

**Request / Response**

| Endpoint       | Schema                          | Body                                  | Response                                |
| -------------- | ------------------------------- | ------------------------------------- | --------------------------------------- |
| User request   | `registerUserSchema`            | `{ name, lastName, email, password }` | `204`                                   |
| User confirm   | `confirmUserRegistrationSchema` | `{ token }`                           | Misma forma que login                   |
| Owner request  | `registerOwnerSchema`           | `{ name, lastName, email, password }` | `204`                                   |
| Owner confirm  | `confirmUserRegistrationSchema` (o alias) | `{ token }`                   | Misma forma que login                   |

- Link user: `{WEB_URL}/register/confirm?token=…`
- Link owner: `{DASHBOARD_URL}/register/confirm?token=…`

**Errores (mensaje al usuario en español)**

| HTTP | Cuándo                                        | Mensaje                                              |
| ---- | --------------------------------------------- | ---------------------------------------------------- |
| 400  | Validación Zod                                | Mensajes de validators / i18n                        |
| 400  | Token inválido o expirado (sin cuenta)        | `El enlace no es válido o ya expiró.`                |
| 409  | Email ya registrado en `request`              | `Este email ya está registrado.`                     |
| 429  | ≥10 `request` el mismo día UTC para ese email | `Demasiados intentos. Probá de nuevo más tarde.`     |

### Datos

| Tabla / campo                       | Cambio                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `user_registration_tokens`          | (existente) user pending                                                                        |
| `owner_registration_tokens` (nueva) | Misma forma: `token`, `expiresAt`, `usedAt`, `name`, `lastName`, `email`, `passwordHash`, base |

- Password **hasheada** en el pending.
- Nuevo `request` para el mismo email invalida tokens pendientes previos (por rol/tabla).

### UI

| App         | Ruta                        | Pantalla                                                              |
| ----------- | --------------------------- | --------------------------------------------------------------------- |
| `web`       | `/register`                 | Tras `request` OK → “revisá tu correo”                                |
| `web`       | `/register/confirm?token=…` | Confirm → sesión + home, o error expirado/inválido                    |
| `dashboard` | `/register`                 | Tras `request` OK → “revisá tu correo”                                |
| `dashboard` | `/register/confirm?token=…` | Confirm → sesión + `/dashboard`, o error claro                        |

---

## Reglas de negocio

1. Registro manual **`user`** solo en `web`; **`owner`** solo en `dashboard`. Google no pasa por este flujo.
2. Hasta un `confirm` exitoso **no** existe account/perfil en DB.
3. TTL del token: **60 minutos**; uso **único** (`usedAt`). Reuso con cuenta ya creada → login (o CTA login).
4. Un nuevo `request` para el mismo email **invalida** tokens pendientes anteriores (en la tabla del rol).
5. Email ya registrado en `request` → **`409`**, sin mail ni token nuevo.
6. Race en `confirm` (email registrado entre medias) → error claro o login si la cuenta ya es del mismo rol.
7. Password del pending: **hash**.
8. Máximo **10** `request` por email y día UTC → `429` (por flujo/tabla).
9. Cron diario elimina tokens con `expiresAt` pasado (user + owner).
10. `web` no llama a `POST /auth/register/user`; `dashboard` no llama a `POST /auth/register/owner`.
11. Reenviar mail desde UI dedicada: **fuera de alcance**.
12. UI de error por token vencido **no** debe decir “ya verificado” si la cuenta no existe.

## Preguntas abiertas

- (cerradas — ampliación dashboard confirmada 2026-07-28)
