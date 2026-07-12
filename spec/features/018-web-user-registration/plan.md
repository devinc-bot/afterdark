# Plan de implementación — Registro de cliente (web)

> Cómo se implementa esta feature. Complementa `spec.md`.

## Orden de capas

```text
1. packages/i18n          — clave auth.register.success + meta titles web-neutral
2. apps/web               — session infra → auth services → UI → routes
```

No hay cambios en `@afterdark/validators`, `@afterdark/types`, `packages/db` ni `apps/api`.

## Sesión en `web` (decisión técnica)

Hoy `web` solo guarda `LoginResponse` en `localStorage`; no hay `GET /session/me` ni `RequireGuest`.

**Opción elegida:** patrón mínimo **solo en `apps/web`**, calco del dashboard adaptado a `localStorage`:

| Pieza | Dashboard                    | Web (nuevo)                                                          |
| ----- | ---------------------------- | -------------------------------------------------------------------- |
| Token | Cookie `accessToken`         | `localStorage` (`getAuthSession`)                                    |
| Store | `session.store.ts` (zustand) | Mismo patrón, lee token de storage                                   |
| Fetch | `fetchSession` server fn     | `fetchSessionFn` → `GET /api/session/me` con `Authorization: Bearer` |
| Hook  | `useSession`                 | Igual                                                                |
| Guard | `RequireGuest`               | Igual; redirige a `WEB_ROUTES.home()`                                |

**Fuera de alcance:** extraer store/hook a paquete compartido (duplicación aceptada hasta un refactor transversal de auth en `web`).

**Comportamiento token inválido:** si `session/me` responde 401, `clearAuthSession()` + `status: UNAUTHENTICATED` (invitado puede ver login/register).

## Archivos a crear / modificar

### i18n

| Archivo                                  | Cambio                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `packages/i18n/src/locales/auth/es.json` | `register.success`; meta titles sin "Admin" para web o claves `*.metaTitleWeb` |
| `packages/i18n/src/locales/auth/en.json` | Idem                                                                           |

### Web — infra

| Archivo                                             | Cambio                                                         |
| --------------------------------------------------- | -------------------------------------------------------------- |
| `app/config/constants/api.ts`                       | Rutas `registerUser`, `session/me` (estructura como dashboard) |
| `app/modules/common/constants/session-status.ts`    | **Nuevo** — copiar enum del dashboard                          |
| `app/modules/common/services/session.service.ts`    | **Nuevo** — `fetchSessionFn` con Bearer desde storage          |
| `app/modules/common/stores/session.store.ts`        | **Nuevo** — zustand; token desde `getAuthSession()`            |
| `app/modules/common/hooks/use-session.ts`           | **Nuevo**                                                      |
| `app/modules/common/components/require-guest.tsx`   | **Nuevo**                                                      |
| `app/modules/common/components/session-loading.tsx` | **Nuevo** (o skeleton mínimo)                                  |
| `app/routes/__root.tsx`                             | `Toaster` de `@afterdark/ui`                                   |

### Web — auth

| Archivo                                            | Cambio                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `app/modules/auth/services/auth.service.ts`        | `registerUserFn`; alinear `loginFn` con helper `postAuth` si conviene                |
| `app/modules/auth/mutations/use-auth-mutations.ts` | `useRegister`; toast en `onSuccess` + navigate login; `useLogin` llama `loadSession` |
| `app/modules/auth/components/register-form.tsx`    | **Nuevo** — patrón dashboard, estilos login web actual                               |
| `app/modules/auth/components/login-form.tsx`       | Migrar a `useTranslation('auth')`                                                    |
| `app/routes/register.tsx`                          | `RegisterForm` + `RequireGuest` + `head` i18n                                        |
| `app/routes/login.tsx`                             | `RequireGuest` + `head` i18n                                                         |

## Flujo de datos

```text
RegisterForm submit
  → useRegister.mutate(registerUserSchema fields)
  → registerUserFn (server)
  → POST /api/auth/register/user
  → onSuccess: navigate(/login) + toast(auth.register.success)

RequireGuest mount
  → useSession → loadSession if IDLE
  → token in localStorage? → GET /api/session/me
  → AUTHENTICATED → redirect home
```

## Riesgos / edge cases

| Caso                                    | Comportamiento                                               |
| --------------------------------------- | ------------------------------------------------------------ |
| Email duplicado (409)                   | Error inline en formulario                                   |
| Token en storage pero JWT expirado      | `session/me` 401 → clear storage → guest OK                  |
| Usuario registra y vuelve atrás al form | `RequireGuest` no aplica; si ya tiene cuenta debe usar login |
| Doble submit                            | Botón disabled mientras `isPending`                          |

## Verificación manual

| Paso                      | Resultado esperado                          |
| ------------------------- | ------------------------------------------- |
| 1. `/register` sin sesión | Formulario completo, link a login           |
| 2. Registro válido        | Toast éxito → `/login`                      |
| 3. Login con cuenta nueva | Sesión OK → home; `/register` redirige home |
| 4. Email duplicado        | Mensaje emailTaken, sin redirect            |
| 5. Contraseñas distintas  | Error confirmación, sin API call            |
| 6. Login i18n             | Sin strings hardcodeados en formulario      |
