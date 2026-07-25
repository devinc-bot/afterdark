# Registro e inicio de sesión con Google

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo          | Valor                     |
| -------------- | ------------------------- |
| **ID**         | `022-google-auth`         |
| **Status**     | `approved`                |
| **Apps**       | `api`, `web`, `dashboard` |
| **Depende de** | `001-auth-sessions`       |

---

## Qué hace

En login y registro de `web` (cliente) y `dashboard` (dueño), el usuario puede pulsar **Continuar con Google**, autenticarse con su cuenta Google y quedar con sesión activa del rol correspondiente.

## Por qué

Bajar la fricción de alta e inicio de sesión: el usuario no necesita inventar ni recordar una contraseña para entrar a Repo (`mission.md`: clientes en `web`, dueños en `dashboard`).

## Alcance

### Incluye

- Botón «Continuar con Google» en **login y registro** de `web` y `dashboard` (debajo del CTA principal email/password, separador «o»; estilo referencia visual; solo Google).
- Flujo OAuth Google en API: alta si no existe cuenta; login si ya existe cuenta Google vinculada.
- Sesión activa tras el callback (auto-login).
- Copy i18n en español (namespace `auth`).

### No incluye

- Otros providers (GitHub, Apple, etc.).
- Rol staff.
- Account linking: vincular Google a una cuenta email/password ya existente.
- Badge «Last used», textos Terms/Privacy del mock de referencia.
- Cambios al flujo de registro/login por email/password más allá de añadir el botón y el separador.

---

## User stories

### US-1: Cliente con Google

**Como** visitante en `web`  
**Quiero** continuar con Google desde login o registro  
**Para** entrar como cliente sin inventar contraseña

**Criterios de aceptación**

- [ ] **Dado** que no tengo sesión, **Cuando** abro `/login` o `/register` en `web`, **Entonces** veo el botón «Continuar con Google» debajo del CTA principal y el separador «o».
- [ ] **Dado** una cuenta Google sin usuario previo, **Cuando** completo OAuth desde `web`, **Entonces** se crea cuenta con rol `user`, queda sesión activa y redirijo al home de `web`.
- [ ] **Dado** que ya tengo cuenta Google de cliente, **Cuando** completo OAuth, **Entonces** inicio sesión y redirijo al home de `web`.
- [ ] **Dado** que el email de Google ya existe con email/password, **Cuando** completo OAuth, **Entonces** veo un error en español, no se crea sesión y no se vincula la cuenta.

### US-2: Dueño con Google

**Como** visitante en `dashboard`  
**Quiero** continuar con Google desde login o registro  
**Para** entrar como dueño sin inventar contraseña

**Criterios de aceptación**

- [ ] **Dado** que no tengo sesión, **Cuando** abro `/login` o `/register` en `dashboard`, **Entonces** veo el botón «Continuar con Google» debajo del CTA principal y el separador «o».
- [ ] **Dado** una cuenta Google sin dueño previo, **Cuando** completo OAuth desde `dashboard`, **Entonces** se crea cuenta con rol `owner`, queda sesión activa y redirijo al home del panel.
- [ ] **Dado** que ya tengo cuenta Google de dueño, **Cuando** completo OAuth, **Entonces** inicio sesión y redirijo al home del panel.
- [ ] **Dado** que el email de Google ya existe con email/password, **Cuando** completo OAuth, **Entonces** veo un error en español, no se crea sesión y no se vincula la cuenta.

### US-3: Cancelación o fallo OAuth

**Como** visitante  
**Quiero** un mensaje claro si cancelo o falla Google  
**Para** reintentar o usar email/password

**Criterios de aceptación**

- [ ] **Dado** que cancelo el consentimiento en Google, **Cuando** vuelvo a la app, **Entonces** estoy en login/registro sin sesión y veo un mensaje en español.
- [ ] **Dado** un error de proveedor o configuración, **Cuando** falla el flujo, **Entonces** veo un mensaje genérico en español sin detalles internos.

---

## Contratos

### API

| Método | Ruta                    | Auth    |
| ------ | ----------------------- | ------- |
| `GET`  | `/auth/google`          | público |
| `GET`  | `/auth/google/callback` | público |

**Query / flujo**

| Endpoint | Parámetros                               | Comportamiento                                                                                                |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Start    | `role=user\|owner`, `app=web\|dashboard` | Redirect a Google OAuth                                                                                       |
| Callback | code/state de Google                     | Alta o login; setea sesión; redirect a home de la app. En error: redirect a `/login?error=…` de la app origen |

- Rutas en `API_ROUTES.auth` (`packages/common`).
- Credenciales Google vía env (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, callback URL de la API).

**Errores (mensaje al usuario en español)**

| HTTP / caso                       | Cuándo                                 | Mensaje                                              |
| --------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| Redirect `error=email_exists`     | Email ya registrado con email/password | `Ya existe una cuenta con este correo.`              |
| Redirect `error=google_cancelled` | Usuario cancela en Google              | `No se pudo continuar con Google. Intentá de nuevo.` |
| Redirect `error=google_failed`    | Fallo proveedor/config/state           | `No se pudo continuar con Google. Intentá de nuevo.` |

### Datos

| Tabla / campo                  | Cambio                                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `accounts.provider`            | Nueva columna NOT NULL: `local` \| `google`. Default `local` (auth email/password original). Cuentas Google → `google`. |
| `accounts.provider_account_id` | Nueva columna nullable: ID del proveedor (p. ej. Google `sub`). UNIQUE cuando no es null. Null en cuentas `local`.      |
| `accounts.password`            | Pasa a **nullable** — cuentas `provider=google` sin hash de contraseña                                                  |

- No se crea tabla `oauth_accounts` separada: el proveedor vive en `accounts`.
- Cuentas existentes (migración): `provider = 'local'`, `provider_account_id = null`.

### UI (`web` · `dashboard`)

| Ruta        | Cambio                                                                |
| ----------- | --------------------------------------------------------------------- |
| `/login`    | Botón «Continuar con Google» + separador «o» debajo del CTA principal |
| `/register` | Igual                                                                 |

**Copy (español, i18n `auth`)**

| Clave (propuesta)                | Texto                                                |
| -------------------------------- | ---------------------------------------------------- |
| `auth.google.continue`           | `Continuar con Google`                               |
| `auth.google.or`                 | `o`                                                  |
| `auth.google.errors.emailExists` | `Ya existe una cuenta con este correo.`              |
| `auth.google.errors.generic`     | `No se pudo continuar con Google. Intentá de nuevo.` |

---

## Reglas de negocio

- Si el email de Google ya pertenece a una cuenta con `provider = local` (email/password), **no** se vincula automáticamente: se muestra error («ya existe una cuenta con este correo») y no se crea sesión.
- Si el email/Google ya tiene perfil del **otro** rol (cliente vs dueño), mismo tratamiento: error «ya existe una cuenta con este correo», sin segundo perfil ni linking.
- Tras OAuth exitoso: auto-login y redirect al **home** de la app de origen (`web` o `dashboard`).
- El botón aparece en **login y registro** de ambas apps.
- El `role` del start OAuth define el perfil creado (`user` ↔ `web`, `owner` ↔ `dashboard`); no se puede usar el flujo de `web` para crear dueño ni viceversa.
- Login Google: buscar por `provider = google` + `provider_account_id` (o alta nueva con esos campos); no hay linking a cuentas `local`.
- Cuentas `provider = google` (sin password) no pueden usar login email/password ni forgot-password hasta que tengan contraseña (fuera de alcance definir “set password” aquí).
- Registro/login email/password existente siempre persiste/usa `provider = local`.

## Preguntas abiertas

- ~~Handoff de sesión post-callback~~ → resuelto en `plan.md`: bridge `{app}/auth/callback?token=` + `saveAuthSession` (mejora futura: one-time exchange).
-
