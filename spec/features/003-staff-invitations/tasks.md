# Tasks — Staff e invitaciones (listado de personal)

> Checklist de tareas. Marcar `[x]` al completar.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [ ] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md` (fila `003`)

## Shared packages

- [x] Sin cambios en validators / types / db (N/A)

## API

- [x] Sin cambios — `GET /staff/my-personnel` existente

## Client (`dashboard`)

- [ ] `API_ROUTES.staff` en `app/config/constants/api.ts`
- [ ] `QUERY_KEYS.staffPersonnel`
- [ ] `staff-personnel.service.ts` — fetch listado
- [ ] `staff-personnel.mapper.ts` — `StaffPersonnelItem` → `StaffUserRecord`
- [ ] `use-staff-personnel.ts` — queryOptions + hook
- [ ] Copy `table.loadError` / `table.retry` en `staff.copy.ts`
- [ ] Loader + Suspense en `routes/_app/staff.tsx`
- [ ] `StaffManagementView` — quitar mock; empty dedicado; error banner
- [ ] `StaffUserRecords` — deshabilitar controles de estado; avatar con URL
- [ ] Eliminar o dejar de exportar `STAFF_USER_RECORDS_MOCK` en producción

## Calidad

- [ ] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] `pnpm format` (o pre-commit)
- [ ] Verificación manual según `plan.md`
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`
