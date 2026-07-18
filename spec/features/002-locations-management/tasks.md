# Tasks — Gestión de ubicaciones

> Checklist. Marcar `[x]` al completar.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [x] Types: `LOCATION_TYPE`, DTOs/repos `Location*`; eliminar `CLUB_STATUS`
- [x] Validators: schemas `location`; sin `status`
- [x] Schema Drizzle: `locations` + links renombrados; FKs `location_id`; col `type`
- [x] Migración generada/aplicada (backfill `permanent`, drop `status`)
- [x] Repositories `locations/**` + assets/auth/events renames; export en `index.ts`
- [x] `API_ROUTES.locations` (`my-locations`, create, patch, delete)
- [x] i18n namespace `locations` + error/validation keys

## API

- [x] Módulo `locations` (ex `clubs`): controller, use-cases, mappers, services
- [x] Create fuerza `type = permanent`; update no cambia `type`
- [x] Registrar módulo; actualizar consumidores (events, staff, invitations, …)

## Dashboard

- [x] Rutas `/locations` (+ new/edit); regenerar route tree vía dev
- [x] Módulo UI `locations` (ex `club-management`): listado, form, KPIs, delete
- [x] Quitar campo status del form; sin selector type
- [x] Sidebar/nav/query-keys/copy “Ubicaciones”
- [x] Actualizar events/staff/sales que referencian clubs

## Verificación

- [x] `pnpm type-check` / lint OK
- [ ] QA manual: listar/crear/editar/eliminar ubicación permanente
- [ ] QA: eventos/staff no rompen por rename FK
