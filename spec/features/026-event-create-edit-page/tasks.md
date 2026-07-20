# Tasks — Crear/editar evento en pantalla (wizard)

> Checklist. Marcar `[x]` al completar. Orden sugerido de arriba a abajo.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [x] `EVENT_IMAGE_MAX_COUNT = 2` y `LOCATION_IMAGE_MAX_COUNT = 4` en `@afterdark/validators`
- [x] `EventResponse.images` (+ tipo imagen) en `@afterdark/types`
- [ ] Schema `event_assets_lnk` + migración Drizzle
- [ ] Repository: find event by documentId (owner) + CRUD links de imágenes
- [ ] `API_ROUTES.events` get por `documentId` en `@afterdark/common`
- [ ] i18n: wizard, unsaved, imágenes evento, 404 edit

## API

- [ ] `EventImagesService` (upload/save/remove; espejo locations)
- [ ] `GET /api/events/:documentId` (owner)
- [ ] `POST /api/events` multipart (`images` 0–2)
- [ ] `PATCH /api/events/:documentId` multipart + keep ids
- [ ] Mensajes de error en español / i18n server
- [ ] Validar tope location 4 en create/update locations (vía constante)

## Dashboard

- [ ] `DASHBOARD_ROUTES.eventsNew` / `eventsEdit`
- [ ] Rutas TanStack: `events.new`, `events.$documentId.edit`
- [ ] Shell página + unsaved dialog (patrón locations)
- [ ] Step 1: select ubicaciones + “agregar diferente” (form simplificado)
- [ ] Step 2: campos evento sin location select + `ImagesEventForm` (máx. 2)
- [ ] Orquestación submit: location nueva → event create/update
- [ ] Listado: CTA/edit navegan a pantallas; quitar diálogos create/edit
- [ ] Edit 404 / loading states

## Calidad

- [ ] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] Verificación manual según `plan.md`
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`
