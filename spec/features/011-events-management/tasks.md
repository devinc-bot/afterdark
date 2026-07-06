# Tasks — Gestión de eventos

> Checklist ejecutable. Marcar `[x]` al completar.

## Spec & plan

- [x] Requisitos documentados en `spec.md`
- [x] `spec.md` en status `approved`
- [x] `plan.md` revisado
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [ ] `createEventSchema` + `listEventsQuerySchema` en `@afterdark/validators`
- [ ] Claves `VALIDATION_EVENT_*` en i18n/errors
- [ ] `EventResponse` en `@afterdark/types`
- [ ] `API_ROUTES.events` en `@afterdark/types`
- [ ] `createEvent`, `findEventsByOwnerDocumentId`, `countEventsByOwnerDocumentId` en repository
- [ ] Export repository en `packages/db`

## API

- [ ] `EventsModule`, `EventsService`, `EventsController`
- [ ] `GET /api/events/my-events` (paginado, solo clubes del dueño)
- [ ] `POST /api/events` (validar club ownership)
- [ ] Mapper `EventResponse`
- [ ] Registrar módulo en `app.module.ts`

## Dashboard

- [ ] `events.service.ts` + query/mutation hooks
- [ ] `event-form.tsx` (club, nombre, descripción, fechas, estado default published)
- [ ] `dialog-create-event.tsx`
- [ ] `event-record.tsx` (tabla + paginación estilo tickets)
- [ ] `events-management-view.tsx` + `PageLayout`
- [ ] Ruta `/_app/events`
- [ ] `DASHBOARD_ROUTES.events()` + sidebar _Eventos_
- [ ] i18n `events/es.json` y `events/en.json`

## Cierre

- [ ] `pnpm type-check` y `pnpm lint` sin errores
- [ ] Probar crear evento y listado paginado manualmente
- [ ] Criterios de aceptación de `spec.md` verificados
- [ ] Status feature → `done` en roadmap
