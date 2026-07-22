# Plan de implementación — Crear/editar evento en pantalla (wizard)

> Complementa [spec.md](./spec.md). Spec status: `approved`.

## Orden de capas

```text
1. @afterdark/validators     — EVENT_IMAGE_MAX_COUNT=2; LOCATION_IMAGE_MAX_COUNT 5→4
2. @afterdark/types          — EventImageResponse; EventResponse.images
3. packages/db               — event_assets_lnk + migración + repos
4. apps/api events           — multipart create/update; GET :documentId; EventImagesService
5. packages/common           — API_ROUTES.events.get(documentId) si falta
6. packages/i18n             — copy wizard / errores imágenes evento
7. apps/dashboard            — rutas /events/new|edit; wizard 2 steps; quitar modales create/edit
8. Verificar type-check / lint / QA manual
```

## Archivos a crear / modificar

### Validators / upload

| Archivo                               | Cambio                                                             |
| ------------------------------------- | ------------------------------------------------------------------ |
| `packages/validators/src/upload.ts`   | `LOCATION_IMAGE_MAX_COUNT = 4`; `EVENT_IMAGE_MAX_COUNT = 2`        |
| `packages/validators/src/event.ts`    | Soporte parse multipart / keepImageIds si aplica (espejo location) |
| `packages/validators/src/location.ts` | Reexport del nuevo tope (sin lógica extra)                         |

### Types

| Archivo                           | Cambio                                                   |
| --------------------------------- | -------------------------------------------------------- |
| `packages/types/src/dto/event.ts` | `images: EventImageResponse[]` (o tipo asset compartido) |

### Database

| Archivo                                     | Cambio                                           |
| ------------------------------------------- | ------------------------------------------------ |
| `packages/db/src/schema/event-asset-lnk.ts` | Tabla `event_assets_lnk`                         |
| `packages/db/src/schema/index.ts`           | Export                                           |
| `packages/db/drizzle/`                      | Migración generada                               |
| `packages/db/src/repositories/events/`      | Queries imágenes / find by documentId con assets |

### API

| Archivo                                                            | Cambio                                                         |
| ------------------------------------------------------------------ | -------------------------------------------------------------- |
| `apps/api/.../events/presentation/events.controller.ts`            | `FilesInterceptor`; `GET :documentId`; create/update multipart |
| `apps/api/.../events/application/*`                                | Create/Update con imágenes; GetEventByDocumentId               |
| `apps/api/.../events/application/services/event-images.service.ts` | Espejo `LocationImagesService`                                 |
| `packages/common/.../api-routes.ts`                                | `path.get(':documentId')` si no existe                         |

### Dashboard

| Archivo                                                        | Cambio                                    |
| -------------------------------------------------------------- | ----------------------------------------- |
| `app/modules/common/constants/routes.ts`                       | `eventsNew`, `eventsEdit`                 |
| `app/routes/_app/events.new.tsx`                               | Ruta create                               |
| `app/routes/_app/events.$documentId.edit.tsx`                  | Ruta edit                                 |
| `app/modules/events/components/event-form-page.tsx`            | Shell + unsaved dialog (patrón locations) |
| `app/modules/events/components/event-wizard.tsx`               | Estado steps + orquestación submit        |
| `app/modules/events/components/event-wizard-step-location.tsx` | Select + form ubicación simplificado      |
| `app/modules/events/components/event-wizard-step-details.tsx`  | Campos evento sin location + imgs evento  |
| `app/modules/events/components/images-event-form.tsx`          | Galería máx. 2                            |
| `app/modules/events/components/events-management-view.tsx`     | Links en lugar de diálogos                |
| `dialog-create-event.tsx` / `dialog-edit-event.tsx`            | Eliminar o dejar de usar                  |
| `event-form.tsx`                                               | Extraer/reusar campos para step 2         |
| i18n `events`                                                  | Copy wizard, unsaved, 404, imágenes       |

### Locations (colateral)

| Archivo                                    | Cambio                                       |
| ------------------------------------------ | -------------------------------------------- |
| UI/API que lean `LOCATION_IMAGE_MAX_COUNT` | Pasan a tope 4 automáticamente vía constante |

## Diseño técnico

```text
Wizard state (client)
├── step: 1 | 2
├── locationMode: 'existing' | 'new'
├── locationId?: string
├── newLocationValues?: simplified location form (+ files)
├── eventValues (+ existing/new event images)
└── isDirty → unsaved dialog

Submit create
├── if new → createLocation(FormData) → locationId
└── createEvent(FormData with locationId + event images)

Submit edit
├── if new location → createLocation → locationId
└── updateEvent(FormData + keepImageIds)
```

Reutilizar componentes de locations para el form simplificado (capacity, address, map, `ImagesLocationForm`) vía composición, no duplicar mapa.

## Riesgos / edge cases

| Caso                                   | Comportamiento esperado                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| Create location OK, create event falla | Toast error; location ya creada (aceptable v1; documentado). Opcional: no compensar delete. |
| Sin ubicaciones                        | Solo flujo “nueva”; Siguiente exige form válido                                             |
| Edit 404                               | Mensaje + link a `/events`                                                                  |
| >2 imgs evento / >4 location           | Rechazo cliente + 400 API                                                                   |
| Dirty cancel                           | Sin POST                                                                                    |

## Verificación manual

| Paso                                                  | Resultado esperado                    |
| ----------------------------------------------------- | ------------------------------------- |
| 1. CTA crear en `/events`                             | Navega a `/events/new` (sin modal)    |
| 2. Step 1 sin selección                               | Siguiente disabled                    |
| 3. Select location → Siguiente → guardar sin imgs     | Evento creado; vuelve a listado       |
| 4. Ubicación nueva + 4 imgs + evento + 2 imgs         | Ambos persistidos; edit muestra datos |
| 5. Intentar 3 imgs evento / 5 location                | Bloqueo UI                            |
| 6. Edit: ubicación preseleccionada; cambiar y guardar | Update OK                             |
| 7. Dirty + Cancelar                                   | Dialog unsaved; salir no persiste     |
| 8. `/locations` create con 5 imgs                     | Rechazado (tope 4)                    |
| 9. `pnpm type-check` + lint                           | Verde                                 |
