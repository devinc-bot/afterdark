# Registro de cliente (web)

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo          | Valor        |
| -------------- | ------------ |
| **ID**         | `018-web-user-registration` |
| **Status**     | `approved`   |
| **Apps**       | `web`        |
| **Depende de** | `001-auth-sessions` |

---

## Qué hace

Permite que un **cliente** cree una cuenta en `apps/web` desde `/register`, con validación de formulario y alta vía API. Tras el registro exitoso, redirige a `/login` y muestra un **toast** de confirmación. Las rutas `/login` y `/register` quedan reservadas para invitados (sin sesión activa).

## Por qué

Los clientes necesitan una cuenta propia para comprar entradas y gestionar su perfil (`mission.md`: audiencia `web` = descubrir y comprar). Hoy `/register` es un placeholder y el único registro implementado en frontend es el de **dueños** en `dashboard`. Esta feature cierra el flujo de alta del público sin duplicar lógica de API.

## Alcance

### Incluye

- Formulario de registro de **cliente** (`USER`) en `apps/web` ruta `/register`.
- Campos: nombre, apellido, correo, contraseña y confirmación de contraseña.
- Integración con `POST /auth/register/user` (API existente).
- Tras éxito: redirigir a `/login` y mostrar **toast** con mensaje de éxito (texto del API o clave i18n acordada).
- Copy vía namespace i18n `auth` — reutilizar claves `auth.register.*` existentes.
- Migrar **login** de `web` a i18n `auth` en el mismo alcance (paridad con registro).
- `RequireGuest` en `/register` y `/login`: si hay sesión activa, redirigir al home de `web`.
- Componente `RegisterForm` + `registerUserFn` (server fn) siguiendo patrón de login en `web` y registro en `dashboard`.
- Enlace login ↔ registro (ya existe en `LoginForm`; agregar inverso en registro).
- `Toaster` en root de `web` si aún no existe.

### No incluye

- Registro de dueño (`POST /auth/register/owner`) — vive en `dashboard`.
- Registro de staff por invitación (`003-staff-invitations`).
- Verificación de email, captcha, login social.
- Auto-login post-registro (el usuario inicia sesión manualmente).
- Cambios de esquema DB ni nuevos endpoints API.
- Recuperación de contraseña (`/forgot-password` en dashboard; no existe en `web`).

## User stories

### US-1: Crear cuenta de cliente

**Como** visitante sin cuenta  
**Quiero** completar un formulario de registro en `/register`  
**Para** obtener una cuenta de cliente y poder iniciar sesión

**Criterios de aceptación**

- [ ] **Dado** que no tengo sesión activa, **Cuando** ingreso a `/register`, **Entonces** veo el formulario con nombre, apellido, correo, contraseña y confirmación.
- [ ] **Dado** que el formulario es válido, **Cuando** envío, **Entonces** se llama a `POST /auth/register/user`, se redirige a `/login` y aparece un toast con el mensaje i18n de éxito.
- [ ] **Dado** que las contraseñas no coinciden, **Cuando** envío, **Entonces** veo el error en confirmación sin llamar a la API.
- [ ] **Dado** que un campo no cumple el schema, **Cuando** envío, **Entonces** veo el error en el campo correspondiente.

### US-2: Correo ya registrado

**Como** visitante  
**Quiero** ver un mensaje claro si mi correo ya existe  
**Para** saber que debo iniciar sesión en su lugar

**Criterios de aceptación**

- [ ] **Dado** que el correo ya está registrado, **Cuando** envío el formulario, **Entonces** veo el error `auth.register.error.emailTaken` (o mensaje del API si coincide) y permanezco en `/register`.
- [ ] **Dado** un error de red o 5xx, **Cuando** falla el registro, **Entonces** veo `auth.register.error.generic` y puedo reintentar.

### US-3: Rutas solo para invitados

**Como** cliente ya logueado  
**Quiero** no ver pantallas de login/registro  
**Para** no confundirme con flujos de auth innecesarios

**Criterios de aceptación**

- [ ] **Dado** que tengo sesión válida (`GET /session/me` OK), **Cuando** visito `/login` o `/register`, **Entonces** soy redirigido al home de `web`.
- [ ] **Dado** que no tengo sesión, **Cuando** visito `/login` o `/register`, **Entonces** veo la pantalla correspondiente.

### US-4: Navegación entre login y registro

**Como** visitante  
**Quiero** pasar fácilmente entre login y registro  
**Para** elegir el flujo que necesito

**Criterios de aceptación**

- [ ] **Dado** que estoy en `/login`, **Cuando** hago clic en el enlace de registro, **Entonces** navego a `/register`.
- [ ] **Dado** que estoy en `/register`, **Cuando** hago clic en "¿Ya tenés cuenta?", **Entonces** navego a `/login`.

### US-5: Login con i18n (mismo alcance)

**Como** visitante  
**Quiero** que el login use las mismas claves i18n que el dashboard  
**Para** consistencia y soporte multi-idioma futuro

**Criterios de aceptación**

- [ ] **Dado** que estoy en `/login`, **Cuando** veo la pantalla, **Entonces** labels, placeholders y errores salen del namespace `auth` (no strings hardcodeados).

---

## Contratos

### API

| Método | Ruta | Auth |
| ------ | ---- | ---- |
| `POST` | `/api/auth/register/user` | Pública |
| `GET`  | `/api/session/me`         | JWT (para `RequireGuest` / sesión en web) |

**Request** — `registerUserSchema` (`@afterdark/validators`): `name`, `lastName`, `email`, `password`.

**Response** — `RegisterResponse`: `{ message: string }` (el cliente **no** usa este mensaje para el toast; usa i18n local).

**Errores (mensaje al usuario en español)**

| HTTP | Cuándo | Mensaje en UI |
| ---- | ------ | ------------- |
| 409  | Email duplicado | `auth.register.error.emailTaken` |
| 400  | Validación API | Mensaje del API o fallback `auth.register.error.generic` |
| 5xx / red | Fallo servidor | `auth.register.error.generic` |

### Datos

Sin cambios de esquema. Reutiliza `registerAccount` con rol `user`.

### UI

| Ruta | Pantalla |
| ---- | -------- |
| `/register` | `RegisterPage` + `RegisterForm` + `RequireGuest` |
| `/login` | `LoginPage` + `LoginForm` (i18n) + `RequireGuest` |

**Copy (español)** — namespace `auth` (claves existentes + nuevas):

| Contexto | Clave | Notas |
| -------- | ----- | ----- |
| Toast éxito post-registro | `auth.register.success` | **Nueva** — p. ej. "Cuenta creada. Ya podés iniciar sesión." |
| Login | `auth.login.*` | Migrar `LoginForm` de hardcode a i18n |
| Registro | `auth.register.*` | Reutilizar claves actuales del dashboard |

**Infra UI nueva en `web`**

- `Toaster` en `__root.tsx` (patrón dashboard).
- `useSession` + store o hook que llame `GET /session/me` cuando hay token en `localStorage`.
- `RequireGuest` análogo al dashboard.
- `registerUserFn` server fn + `useRegister` mutation.

---

## Decisiones de entrevista

| Tema | Decisión |
| ---- | -------- |
| Documentación | Feature nueva `018-web-user-registration` |
| Post-registro | Redirigir a `/login` + **toast** i18n (`auth.register.success`) |
| Confirmación contraseña | Sí, validación client-side (patrón dashboard) |
| Copy registro | Reutilizar claves `auth.register.*` existentes |
| i18n login | Migrar login de `web` a i18n `auth` en este alcance |
| Rutas invitado | `RequireGuest` en `/login` y `/register` vía `GET /session/me` |
| Sesión en web | Patrón mínimo en `apps/web` (store + hook; sin paquete compartido aún) |
| Meta title | i18n `auth.*.metaTitle` en `head()` de rutas (copy web-neutral) |

## Reglas de negocio

- Solo rol `user` (cliente); el endpoint `register/owner` no se expone en `web`.
- `confirmPassword` es validación de UI únicamente; no se envía al API.
- Tras registro exitoso no se emite JWT automáticamente; el usuario debe hacer login.
- Token inválido o expirado en `localStorage` se trata como no autenticado (`RequireGuest` muestra auth; `session/me` falla → limpiar storage si aplica).

## Preguntas abiertas

- (ninguna bloqueante para implementar)
