# Tasks — Landing web

> Checklist de tareas. Marcar `[x]` al completar. Orden sugerido de arriba a abajo.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [x] Keys i18n landing ES/EN (`nav.events`, `nav.tickets`, `nav.accountAria`)

## Client — web

- [x] `LandingPage` usa `useSession` + flags guest/auth/loading-con-token
- [x] Header: nav y acciones según sesión (Eventos/Tickets no navegables + avatar)
- [x] Hero y closing: ocultar CTAs Login/Register si autenticado / loading con token
- [x] Avatar con imagen o iniciales; aria con nombre

## Verificación

- [ ] QA manual guest / autenticado / sin avatar / token inválido
