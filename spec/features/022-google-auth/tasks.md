# Tasks — Registro e inicio de sesión con Google

> Checklist de tareas. Marcar `[x]` al completar. Orden sugerido de arriba a abajo.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [x] Schemas Zod start OAuth (`role` + `app`) en `@repo/validators`
- [x] Env API: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `API_PUBLIC_URL`
- [x] `API_ROUTES.auth.path.google` / `googleCallback` en `@repo/common`
- [x] Ruta cliente bridge (`authCallback`) en constants de rutas
- [x] Tipos: password opcional en registro / `AUTH_PROVIDER` en `@repo/types`
- [x] i18n `auth.google.*` (es + en)
- [x] Schema `accounts.provider` (`local` \| `google`, default `local`)
- [x] Schema `accounts.provider_account_id` nullable + unique
- [x] Schema `accounts.password` nullable
- [x] Migración generada y aplicada (backfill `provider='local'`)
- [x] `DATABASE.md` actualizado
- [x] `registerAccount` setea `provider` / `providerAccountId` / password null
- [x] Repository `findAuthAccountByProviderAccount`
- [x] Exports en `packages/db`

## API

- [x] `GoogleOauthService` (auth URL, exchange, profile)
- [x] `GoogleOauthStartUseCase`
- [x] `GoogleOauthCallbackUseCase` (alta/login, reglas email/rol, redirects)
- [x] Guard login: password null → inválido
- [x] Guard forgot-password: password null → sin mail
- [x] `@Get` start + callback en controller
- [x] Wire module + constants (provider, error keys, scopes)
- [ ] Documentar/vars en `.env` local (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `API_PUBLIC_URL`)

## Client — `web`

- [x] `GoogleContinueButton` + separador «o»
- [x] Integrar en `login-form` y `register-form`
- [x] Ruta bridge `/auth/callback` (token → `saveAuthSession` → home; error → login + toast)
- [x] Mapear query `error` → i18n

## Client — `dashboard`

- [x] Mismos componentes/forms que `web` (rol `owner`, app `dashboard`)
- [x] Bridge callback con cookie `saveAuthSession`
- [x] Mapear errores i18n

## Calidad

- [x] `pnpm type-check`
- [x] `pnpm lint`
- [ ] `pnpm format` (o pre-commit)
- [ ] Verificación manual según `plan.md` (requiere credenciales Google)
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`
- [x] Cerrar pregunta abierta de handoff JWT en `spec.md` (bridge `?token=`)
