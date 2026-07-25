# Tasks — Servicio de envío de emails

> Checklist de tareas. Marcar `[x]` al completar. Orden sugerido de arriba a abajo.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [x] `mailEnvSchema` en `@repo/validators` + export
- [x] `MAIL_ERROR_CODE` + mensajes `mail.*` en `@repo/i18n` (es/en)
- [x] Tipos `SendMailInput` / `RenderedMail` (locales al módulo api)

## API — mail module

- [x] Puerto `MailSender` + token DI `MAIL_SENDER`
- [x] Adaptador `ResendMailSender`
- [x] `MailService` (check config + `send` + facades de template)
- [x] `MailModule` + registro en `app.module.ts`
- [x] Extender `ENV` con `mailEnvSchema`
- [x] Deps: `resend`, `react-email`, `react`, `react-dom`
- [x] Layout + templates React Email: `staffInvitation`, `passwordReset`, `welcome`
- [x] Helpers via `MailTemplatesService.render*`
- [x] Script `mail:smoke` (dev + `MAIL_SMOKE_TO`)
- [x] Documentar vars en `ARCHITECTURE.md` / `tech-stack.md`

## Calidad

- [x] `pnpm type-check` (api)
- [x] `pnpm lint` / `pnpm format`
- [x] `pnpm check:i18n`
- [ ] Humo manual según `plan.md` (requiere `RESEND_API_KEY` + `MAIL_FROM` + `MAIL_SMOKE_TO`)
- [x] Criterios US-1…US-3 de `spec.md` (código listo; humo pendiente de credenciales)
- [x] Ningún import de `resend` fuera del adaptador

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md` (tras humo verificado)
