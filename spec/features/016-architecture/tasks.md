# Tasks — Arquitectura de tipos compartidos (DTOs)

> Checklist de tareas. Marcar `[x]` al completar.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages — `@afterdark/types`

- [x] Crear `packages/types/src/dto/common.ts`
- [x] Crear `packages/types/src/dto/auth.ts`
- [x] Crear `packages/types/src/dto/user.ts`
- [x] Crear `packages/types/src/dto/club.ts`
- [x] Crear `packages/types/src/dto/event.ts`
- [x] Crear `packages/types/src/dto/ticket.ts`
- [x] Crear `packages/types/src/dto/staff.ts`
- [x] Crear `packages/types/src/dto/index.ts`
- [x] Actualizar `domain.ts` (quitar interfaces)
- [x] Actualizar `index.ts`
- [x] Eliminar `api.ts` y `pagination.ts`

## Calidad

- [x] `pnpm type-check` (types, api, dashboard)
- [x] `pnpm lint`

## Cierre

- [x] Status → `done` en `spec.md` y `roadmap.md`
