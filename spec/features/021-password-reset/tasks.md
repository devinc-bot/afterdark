# Tasks — Reset de contraseña (dashboard)

> Checklist de tareas. Marcar `[x]` al completar. Orden sugerido de arriba a abajo.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [x] `forgotPasswordSchema` + `resetPasswordSchema` en `@repo/validators`
- [x] Rutas en `API_ROUTES.auth` (`@repo/common`)
- [x] Copy i18n `auth` (es/en) + error token inválido
- [x] Schema Drizzle `password_reset_tokens`
- [x] Migración generada y aplicada
- [x] Actualizar `DATABASE.md`
- [x] Repositories auth (create / invalidate / find valid / mark used / update password)

## API

- [x] `ForgotPasswordUseCase` (owner/staff + `SendPasswordResetUseCase`)
- [x] `ResetPasswordUseCase`
- [x] Endpoints en `AuthController` (`204`)
- [x] Registrar providers + `MailModule` en `AuthModule`
- [x] Config URL base del dashboard para el link
- [x] Constantes TTL (60 min) / mensajes

## Client (`dashboard`)

- [x] `DASHBOARD_ROUTES.resetPassword`
- [x] `forgotPasswordFn` / `resetPasswordFn` en `auth.service.ts`
- [x] Mutations hooks
- [x] `ForgotPasswordForm` (reemplaza placeholder)
- [x] `ResetPasswordForm` + ruta `/reset-password`
- [x] `RequireGuest` en ambas rutas
- [x] Quitar / dejar de usar `ForgotPasswordUnavailable`

## Calidad

- [x] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] `pnpm format` (o pre-commit)
- [ ] Verificación manual según `plan.md`
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`
