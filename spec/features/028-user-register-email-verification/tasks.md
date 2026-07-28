# Tasks — Verificación de email en registro (cliente + dueño)

> Checklist. Orden sugerido de arriba a abajo.

## Spec & plan

- [x] Entrevista completa (fases 1–6 `done`)
- [x] `spec.md` `approved` (+ ampliación dashboard confirmada)
- [x] `plan.md` revisado
- [x] Entrada en `roadmap.md`

## Shared packages — user (hecho)

- [x] `confirmUserRegistrationSchema` en validators
- [x] Rutas `registerUserRequest` / `registerUserConfirm` en common
- [x] Copy i18n auth (+ en) y template mail
- [x] Schema Drizzle `user_registration_tokens`
- [x] Repository + export + cleanup cron
- [x] Actualizar `DATABASE.md`

## API — user (hecho)

- [x] `RequestUserRegistrationUseCase` / `ConfirmUserRegistrationUseCase`
- [x] Controller + mail template
- [x] Constantes TTL 60 / límite 10

## Client (`web`) — hecho

- [x] Service / mutations / register-form check-email
- [x] Ruta `/register/confirm`
- [x] Dejar de usar `POST /auth/register/user`

## Shared packages — owner (hecho)

- [x] Rutas `registerOwnerRequest` / `registerOwnerConfirm` en common
- [x] Schema `owner_registration_tokens` + repos (+ cleanup)
- [x] Actualizar `DATABASE.md`
- [x] i18n copy dashboard si hace falta (checkEmail / confirm expired)

## API — owner (hecho)

- [x] `RequestOwnerRegistrationUseCase`
- [x] `ConfirmOwnerRegistrationUseCase` (login si token ya usado + cuenta existe)
- [x] Controller endpoints + wire mail con `DASHBOARD_URL`
- [x] Cron cleanup tokens owner expirados

## Client (`dashboard`) — hecho

- [x] Service / server fns request + confirm
- [x] Mutations
- [x] `register-form` → estado “revisá tu correo”
- [x] Ruta `/register/confirm`
- [x] Dejar de usar `POST /auth/register/owner`

## Calidad

- [x] `pnpm type-check` (api) — user
- [x] `pnpm type-check` (api + dashboard) — owner
- [ ] `pnpm lint`
- [ ] Verificación manual según `plan.md` (web + dashboard)
- [ ] Criterios de aceptación cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`
