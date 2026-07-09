# Tasks — Panel del staff (rol staff)

> Checklist de tareas. Marcar `[x]` al completar.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [ ] Agregar `role: UserRole` a `SessionResponse` en `@afterdark/types`
- [ ] Copy i18n: `pages.panel.staff.*`, tabla, estados, descripción staff (`es.json` + `en.json`)

## API

- [ ] `SessionService.getCurrentSession` — retornar `role` desde `JwtPayload`

## Dashboard — sesión y navegación

- [ ] Actualizar formatter/store de sesión si hace falta propagar `role` post-login
- [ ] Filtrar `buildPrimaryNav` en `app-shell.tsx` según `user.role`
- [ ] Crear `role-routes.ts` con rutas permitidas / bloqueadas por rol
- [ ] `beforeLoad` en rutas del dueño (o layout `_app`) → `notFound()` para staff

## Dashboard — panel staff

- [ ] Módulo `staff-panel`: mock de asistentes + constantes de estado
- [ ] `StaffPanelView` con botón **Escanear** (noop)
- [ ] `AttendeeRecords` — tabla compact + estado vacío
- [ ] `EntryStatusBadge` — Válida / Usada / Expirada
- [ ] `dashboard.tsx` — branch por rol (`owner` vista actual, `staff` → `StaffPanelView`)

## Calidad

- [ ] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] `pnpm format`
- [ ] Verificación manual según `plan.md`
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`
