# Tasks — Registro de cliente (web)

> Checklist de tareas. Marcar `[x]` al completar.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [ ] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## i18n

- [ ] `auth.register.success` (es + en)
- [ ] Meta titles web en `auth.login` / `auth.register` (sin "Admin" o claves `*Web`)

## Web — sesión y guards

- [ ] `session-status.ts`, `session.service.ts`, `session.store.ts`, `use-session.ts`
- [ ] `require-guest.tsx` + loading mínimo
- [ ] `API_ROUTES` ampliado (`registerUser`, `session/me`)
- [ ] `Toaster` en `__root.tsx`

## Web — auth

- [ ] `registerUserFn` en `auth.service.ts`
- [ ] `useRegister` + toast + redirect login
- [ ] `useLogin` actualizado (`loadSession` post-login)
- [ ] `register-form.tsx`
- [ ] `login-form.tsx` migrado a i18n
- [ ] `routes/register.tsx` y `routes/login.tsx` (`RequireGuest`, head i18n)

## Calidad

- [ ] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] `pnpm format` (o pre-commit)
- [ ] Verificación manual según `plan.md`
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`
