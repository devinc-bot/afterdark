# Plan de implementación — Registro e inicio de sesión con Google

> Cómo se implementa esta feature. Complementa `spec.md`; no repetir criterios de aceptación.  
> Borrador en **fase 6** — el usuario confirma o corrige.

## Orden de capas

```text
1. @afterdark/validators / env     — query role+app; GOOGLE_* en API env
2. @afterdark/common               — API_ROUTES.auth.path.google / googleCallback
3. @afterdark/types                — RegisterAccountInput password opcional; tipos oauth
4. @afterdark/i18n                 — auth.google.* (+ errors si aplica)
5. packages/db                     — accounts.provider + provider_account_id + password nullable → migration → repos
6. apps/api auth                   — GoogleOAuth service + start/callback use cases
7. apps/web + apps/dashboard       — botón + bridge callback → saveAuthSession → home
```

## Archivos a crear / modificar

### Validators / env

| Archivo                                              | Cambio                                                                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `packages/validators/src/auth.ts` (o `oauth.ts`)     | Schema query start: `role` (`user`\|`owner`), `app` (`web`\|`dashboard`) + refine coherencia `user↔web`, `owner↔dashboard` |
| `packages/validators/src/env/api.ts` (o equivalente) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` required en runtime OAuth                                                       |
| `packages/validators/src/index.ts`                   | Re-export                                                                                                                  |

### Common

| Archivo                                               | Cambio                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/common/src/config/api-routes.ts`            | `google: () => '/google'`, `googleCallback: () => '/google/callback'` |
| `packages/common/src/constants/routes.ts` (si aplica) | Ruta cliente bridge p. ej. `authCallback: () => '/auth/callback'`     |

### Types

| Archivo                                 | Cambio                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| `packages/types/src/repository/auth.ts` | `hashedPassword` opcional en `RegisterAccountInput`; tipo fila oauth si hace falta |

### i18n

| Archivo                                  | Cambio                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `packages/i18n/src/locales/auth/es.json` | `google.continue`, `google.or`, `google.errors.emailExists`, `google.errors.generic` |
| `packages/i18n/src/locales/auth/en.json` | Paridad                                                                              |
| `packages/i18n` errors (opcional)        | Códigos API si se usan `translateError` en redirects mapeados en UI                  |

### Database

| Archivo                                                 | Cambio                                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `packages/db/src/schema/account.ts`                     | `password` nullable; `provider` (`local` \| `google`, default `local`); `providerAccountId` nullable + unique |
| Constante / enum                                        | p. ej. `AUTH_PROVIDER.LOCAL` / `AUTH_PROVIDER.GOOGLE` en types o db                                           |
| `packages/db/src/schema/index.ts`                       | Export si aplica                                                                                              |
| Migration drizzle-kit                                   | Alter `accounts`: nullable password, add provider + provider_account_id; backfill `provider='local'`          |
| `packages/db/DATABASE.md`                               | Documentar columnas                                                                                           |
| `packages/db/src/repositories/auth/register-account.ts` | Set `provider` + opcional `providerAccountId` / password null                                                 |
| `packages/db/src/repositories/auth/`                    | `findAuthAccountByProviderAccount(provider, providerAccountId)`                                               |
| Exports                                                 | `repositories/*/index.ts`, `packages/db/src/index.ts`                                                         |

### API (`auth`)

| Archivo                                         | Cambio                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `application/services/google-oauth.service.ts`  | Build auth URL; exchange code; fetch profile (email, sub, given/family name)                                                    |
| `application/google-oauth-start.use-case.ts`    | Validar query → encode `state` (role, app, nonce) → redirect Google                                                             |
| `application/google-oauth-callback.use-case.ts` | Validar state → profile → alta/login → JWT → redirect app                                                                       |
| `application/login.use-case.ts`                 | Si `password == null` → credenciales inválidas (no crash)                                                                       |
| `application/forgot-password.use-case.ts`       | Si `password == null` → mismo 204 genérico **sin** enviar mail (o no elegible)                                                  |
| `presentation/auth.controller.ts`               | `@Get` start + callback (redirects, no JSON body)                                                                               |
| `auth.module.ts`                                | Providers                                                                                                                       |
| `auth.constants.ts`                             | Provider `google`, error query keys, scopes                                                                                     |
| `apps/api` env                                  | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`; callback = `{API}/api/auth/google/callback`; reutilizar `WEB_URL` / `DASHBOARD_URL` |

### Client (`web` · `dashboard`) — duplicado (paridad actual)

| Archivo                                                        | Cambio                                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `modules/auth/components/google-continue-button.tsx`           | Botón + icono Google; `window.location` → `API_URL/auth/google?role=&app=`                 |
| `modules/auth/components/auth-method-separator.tsx` (o inline) | Separador «o»                                                                              |
| `modules/auth/components/login-form.tsx`                       | Insertar botón + separador arriba del form                                                 |
| `modules/auth/components/register-form.tsx`                    | Igual                                                                                      |
| `routes/auth.callback.tsx` (o path acordado)                   | Lee `token` o `error` de search; `saveAuthSession` / toast error; navigate home o `/login` |
| `modules/auth/utils/…`                                         | Mapear `error=` → claves i18n                                                              |

## Diseño técnico

```text
[Login/Register UI]
  → click Continuar con Google
  → GET {API}/api/auth/google?role=user|owner&app=web|dashboard
  → GoogleOAuthStartUseCase → redirect Google

[Google] → GET {API}/api/auth/google/callback?code&state
  → GoogleOAuthCallbackUseCase
      → decode/validate state
      → exchange code → profile (email, providerAccountId, name)
      → si accounts.provider=google + provider_account_id → login (JWT) si rol coincide
      → si email existe con provider=local / otro rol → redirect /login?error=email_exists
      → si nuevo → registerAccount(provider=google, providerAccountId, password=null) + profile role → JWT
      → redirect {WEB_URL|DASHBOARD_URL}/auth/callback?token={accessToken}
      → errores cancel/fail → /login?error=google_cancelled|google_failed

[App bridge /auth/callback]
  → saveAuthSession({ accessToken })  // web: localStorage; dashboard: cookie
  → loadSession → navigate home
```

### State OAuth

- `state` firmado o cifrado (JWT corto con `JwtService` o HMAC): `{ role, app, nonce, exp }`.
- Validar `app`/`role` coherentes y origen de redirect allowlist (`WEB_URL` / `DASHBOARD_URL`).

### Handoff de sesión (cierra pregunta abierta)

- Hoy: web = `localStorage`; dashboard = cookie. El callback de la API **no** puede escribir localStorage.
- **Decisión:** redirect al bridge de la app con `?token=` (mismo shape que `LoginResponse.accessToken`). El bridge reutiliza `saveAuthSession`.
- Riesgo: token en query (logs/Referer). Mitigación v1: redirect inmediato + `replace: true` al home limpiando query; mejora futura: one-time code + `POST /auth/google/exchange`.

### Alta Google

- Nombre/apellido desde perfil Google (fallback email local-part si faltan).
- `registerAccount` con `provider: google`, `providerAccountId`, `hashedPassword: null` + rol según `state.role`.
- Registro email/password existente: `provider: local`, `providerAccountId: null`.
- No auto-login en registro email; **sí** en OAuth (spec).

## Riesgos / edge cases

| Caso                                       | Comportamiento esperado                               |
| ------------------------------------------ | ----------------------------------------------------- |
| Email con `provider=local`                 | `error=email_exists`, sin sesión                      |
| Ya es `user`, intenta `owner` (o al revés) | `error=email_exists`                                  |
| `provider=google` + login email            | Credenciales inválidas                                |
| `provider=google` + forgot                 | 204 genérico, sin email                               |
| Usuario cancela en Google                  | `error=google_cancelled`                              |
| State inválido / code fail                 | `error=google_failed`                                 |
| Token en URL del bridge                    | Limpiar query al navegar; no loguear token en cliente |

## Verificación manual

| Paso                                                    | Resultado esperado                         |
| ------------------------------------------------------- | ------------------------------------------ |
| 1. Configurar Google Cloud OAuth + env                  | Callback API acepta redirect               |
| 2. `web` `/login` → Continuar con Google (cuenta nueva) | Alta `user`, sesión, home                  |
| 3. Misma cuenta otra vez                                | Login, home                                |
| 4. Email ya registrado con password                     | Vuelve a `/login` con mensaje email exists |
| 5. Cancelar en Google                                   | Mensaje genérico, sin sesión               |
| 6. Repetir 2–5 en `dashboard` con rol `owner`           | Paridad dueño                              |
| 7. Login email en cuenta solo-Google                    | Falla credenciales                         |
| 8. `pnpm type-check` + lint                             | OK                                         |

## Notas

- UI del botón: estilo referencia (botón full-width o destacado arriba + «o»); **sin** GitHub ni badge «Last used».
- No migrar a Better Auth en esta feature: OAuth sobre el auth Nest actual.
