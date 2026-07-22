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
- [x] Schema `event_assets_lnk` + migración Drizzle
- [x] Repository: find event by documentId (owner) + CRUD links de imágenes
- [x] `API_ROUTES.events` get por `documentId` en `@afterdark/common`
- [x] i18n: wizard step 2 imágenes evento (copy restante)

## API

- [x] `EventImagesService` (upload/save/remove; espejo locations)
- [x] `GET /api/events/:documentId` (owner)
- [x] `POST /api/events` multipart (`images` 0–2)
- [x] `PATCH /api/events/:documentId` multipart + keep ids
- [x] Mensajes de error en español / i18n server
- [x] Validar tope location 4 en create/update locations (vía constante)

## Dashboard

- [x] `DASHBOARD_ROUTES.eventsNew` / `eventsEdit`
- [x] Rutas TanStack: `events.new`, `events.$documentId.edit`
- [x] Shell página + unsaved dialog (patrón locations)
- [x] Step 1: select ubicaciones + “agregar diferente” (form simplificado)
- [x] Step 2: campos evento sin location select + `ImagesEventForm` (máx. 2)
- [x] Orquestación submit: location nueva → event create/update
- [x] Listado: CTA/edit navegan a pantallas; quitar diálogos create/edit
- [x] Edit 404 / loading states

## Calidad

- [ ] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] Verificación manual según `plan.md`
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`
