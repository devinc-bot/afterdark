# Plan de implementación — Reset de contraseña (dashboard)

> Cómo se implementa esta feature. Complementa `spec.md`; no repetir criterios de aceptación.  
> Borrador en **fase 6** — el usuario confirma o corrige.

## Orden de capas

```text
1. @repo/validators     — forgotPasswordSchema, resetPasswordSchema
2. @repo/common         — API_ROUTES.auth.path.forgotPassword / resetPassword
3. @repo/i18n           — auth.forgotPassword.* / auth.resetPassword.* (+ error token)
4. packages/db               — schema password_reset_tokens → migration → repositories
5. apps/api auth             — use cases + controller; cablear SendPasswordResetUseCase
6. apps/dashboard            — server fns → mutations → forms → routes
```

## Archivos a crear / modificar

### Validators

| Archivo                            | Cambio                                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `packages/validators/src/auth.ts`  | `forgotPasswordSchema` (`email`); `resetPasswordSchema` (`token`, `password` min 8, `confirmPassword` + refine match) |
| `packages/validators/src/index.ts` | Re-export si hace falta                                                                                               |

### Common

| Archivo                                    | Cambio                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `packages/common/src/config/api-routes.ts` | `forgotPassword: () => '/forgot-password'`, `resetPassword: () => '/reset-password'` |

### i18n

| Archivo                                  | Cambio                                                                            |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| `packages/i18n/src/locales/auth/es.json` | Copy forgot + reset (títulos, CTAs, éxito, error token)                           |
| `packages/i18n/src/locales/auth/en.json` | Paridad                                                                           |
| `packages/i18n` errors (si aplica)       | Clave `auth.PASSWORD_RESET_TOKEN_INVALID` → “El enlace no es válido o ya expiró.” |

### Database

| Archivo                                          | Cambio                                                                                                                                                                |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/db/src/schema/password-reset-token.ts` | Tabla `password_reset_tokens`: FK `account_id`, `token` unique, `expires_at`, `used_at` nullable + base columns                                                       |
| `packages/db/src/schema/index.ts`                | Export                                                                                                                                                                |
| `packages/db` migration                          | Generar con drizzle-kit                                                                                                                                               |
| `packages/db/DATABASE.md`                        | Documentar tabla                                                                                                                                                      |
| `packages/db/src/repositories/auth/`             | `createPasswordResetToken`, `invalidatePendingTokensForAccount`, `findValidPasswordResetToken`, `markPasswordResetTokenUsed`, `updateAccountPassword` (o equivalente) |
| `packages/db/src/repositories/index.ts`          | Export                                                                                                                                                                |

### API (`auth`)

| Archivo                                                             | Cambio                                                                                                                            |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/modules/auth/application/forgot-password.use-case.ts` | Buscar account owner/staff → invalidar tokens → crear token → `SendPasswordResetUseCase` (URL dashboard + minutes=60); siempre OK |
| `apps/api/src/modules/auth/application/reset-password.use-case.ts`  | Validar token → hash password → update account → mark used                                                                        |
| `apps/api/src/modules/auth/presentation/auth.controller.ts`         | `POST` forgot + reset, `204`                                                                                                      |
| `apps/api/src/modules/auth/auth.module.ts`                          | Providers + import `MailModule`                                                                                                   |
| `apps/api/src/modules/auth/auth.constants.ts`                       | TTL minutes, mensaje token inválido si no va solo por i18n                                                                        |
| Env / config                                                        | Base URL del dashboard para armar el link (`DASHBOARD_APP_URL` o existente)                                                       |

### Client (`dashboard`)

| Archivo                                                       | Cambio                                   |
| ------------------------------------------------------------- | ---------------------------------------- |
| `app/modules/common/constants/routes.ts`                      | `resetPassword: () => '/reset-password'` |
| `app/modules/auth/services/auth.service.ts`                   | `forgotPasswordFn`, `resetPasswordFn`    |
| `app/modules/auth/mutations/use-auth-mutations.ts`            | Hooks forgot / reset                     |
| `app/modules/auth/components/forgot-password-form.tsx`        | Form email + estado éxito                |
| `app/modules/auth/components/reset-password-form.tsx`         | Form password + confirm                  |
| `app/modules/auth/components/forgot-password-unavailable.tsx` | Eliminar o dejar de usar                 |
| `app/routes/forgot-password.tsx`                              | Form real + `RequireGuest`               |
| `app/routes/reset-password.tsx`                               | Nueva ruta; lee `token` de search params |

## Diseño técnico

```text
ForgotPasswordForm
  → forgotPasswordFn → POST /api/auth/forgot-password
  → ForgotPasswordUseCase
      → find account + role owner|staff?
      → si sí: invalidate tokens → insert token → SendPasswordResetUseCase({ url, minutes: 60 })
      → siempre 204

ResetPasswordForm (?token=)
  → resetPasswordFn → POST /api/auth/reset-password
  → ResetPasswordUseCase
      → find valid token (not used, not expired)
      → hash + update accounts.password
      → mark usedAt
      → 204 → UI éxito + link login
```

- Hash de password: mismo helper `hashValue` que registro/login.
- Token: JWT firmado (`JwtService`, mismo secret que auth) con payload `{ purpose, accountId, email }` y `expiresIn` = TTL; se guarda el JWT en `password_reset_tokens` (paridad con invitaciones). Verificación en reset: `verifyAsync` + fila válida en DB.
- Link: `{DASHBOARD_APP_URL}/reset-password?token={rawToken}`.

## Riesgos / edge cases

| Caso                                | Comportamiento esperado                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Email desconocido / solo `user`     | `204`, sin mail                                                                                                                      |
| Fallo de Resend tras crear token    | Log/error interno; idealmente no dejar token huérfano usable sin mail (transacción o compensar); mínimo: log + no filtrar al cliente |
| Token ausente en query              | UI error “enlace no válido” sin llamar API                                                                                           |
| Doble submit reset                  | Segundo request → 400 token usado                                                                                                    |
| Usuario ya logueado en forgot/reset | `RequireGuest` redirige al home del panel                                                                                            |

## Verificación manual

| Paso                              | Resultado esperado                   |
| --------------------------------- | ------------------------------------ |
| 1. Login → “Olvidé mi contraseña” | `/forgot-password` con form          |
| 2. Email owner/staff válido       | Éxito genérico + mail con link       |
| 3. Email inexistente              | Misma UI de éxito, sin mail          |
| 4. Abrir link → nueva password    | `204` → mensaje éxito → login OK     |
| 5. Reusar mismo link              | Error “enlace no válido o ya expiró” |
| 6. Token inventado / expirado     | Mismo error                          |
| 7. Volver al login                | Navega a `/login`                    |
