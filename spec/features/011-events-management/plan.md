# Plan de implementación — Gestión de eventos

> Complementa `spec.md`. Orden de capas estándar del monorepo.

## Orden de capas

```text
1. @afterdark/validators   → event.ts (create + list query)
2. @afterdark/types        → EventResponse, API_ROUTES.events
3. packages/db             → events.repository (create + list paginado)
4. apps/api                → EventsModule (controller + service + mapper)
5. apps/dashboard          → service, hooks, componentes, ruta /events
```

## Archivos a crear / modificar

### Validators

| Archivo                            | Cambio                                                                |
| ---------------------------------- | --------------------------------------------------------------------- |
| `packages/validators/src/event.ts` | `createEventSchema`, `listEventsQuerySchema`, `parseCreateEventInput` |
| `packages/validators/src/index.ts` | Re-export                                                             |

Claves i18n de validación en `packages/i18n` (o patrón actual de `VALIDATION_*` en errors).

### Types

| Archivo                            | Cambio                             |
| ---------------------------------- | ---------------------------------- |
| `packages/types/src/api.ts`        | `EventResponse`                    |
| `packages/types/src/api-routes.ts` | `API_ROUTES.events` prefix + paths |

### Database

| Archivo                                             | Cambio                                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `packages/db/src/repositories/events.repository.ts` | `createEvent`, `countEventsByOwnerDocumentId`, `findEventsByOwnerDocumentId` |
| `packages/db/src/repositories/index.ts`             | Export                                                                       |

`findEventsByOwnerDocumentId`: join `events` → `clubs` → `owners`, filtro `owners.documentId`, `limit`/`offset`, incluir `club.name` para la tabla.

### API

| Archivo                                              | Cambio                                  |
| ---------------------------------------------------- | --------------------------------------- |
| `apps/api/src/modules/events/events.module.ts`       | Nuevo módulo                            |
| `apps/api/src/modules/events/events.controller.ts`   | `GET my-events`, `POST /`               |
| `apps/api/src/modules/events/events.service.ts`      | Ownership club + persistencia           |
| `apps/api/src/modules/events/utils/events.mapper.ts` | `EventSelect` → `EventResponse`         |
| `apps/api/src/app.module.ts`                         | Import `EventsModule`                   |
| Códigos error                                        | `CLUB_NOT_FOUND` (reutilizar si existe) |

### Dashboard

| Archivo                                                                   | Cambio                 |
| ------------------------------------------------------------------------- | ---------------------- |
| `apps/dashboard/app/routes/_app/events.tsx`                               | Ruta + loader opcional |
| `apps/dashboard/app/modules/events/components/events-management-view.tsx` | Vista principal        |
| `apps/dashboard/app/modules/events/components/dialog-create-event.tsx`    | Diálogo                |
| `apps/dashboard/app/modules/events/components/event-form.tsx`             | Formulario             |
| `apps/dashboard/app/modules/events/components/event-record.tsx`           | Tabla + paginación     |
| `apps/dashboard/app/modules/events/service/events.service.ts`             | HTTP client            |
| `apps/dashboard/app/modules/events/queries/use-event-queries.ts`          | TanStack Query         |
| `apps/dashboard/app/modules/events/mutation/use-event-mutations.ts`       | create                 |
| `apps/dashboard/app/modules/events/utils/event-form.mapper.ts`            | DTO ↔ form values      |
| `apps/dashboard/app/modules/common/constants/routes.ts`                   | `events()`             |
| `apps/dashboard/app/modules/common/constants/query-keys.ts`               | `events` key           |
| `apps/dashboard/app/modules/common/constants/app-shell.copy.ts`           | Nav _Eventos_          |
| i18n `events/es.json`, `events/en.json`                                   | Copy spec              |

## Patrones a copiar

| Referencia                                     | Uso en eventos                                           |
| ---------------------------------------------- | -------------------------------------------------------- |
| `TicketCreateDialog`                           | Estructura del diálogo crear (`dialog-create-event.tsx`) |
| `TicketForm` + `@tanstack/react-form`          | `EventForm` con Zod adapter                              |
| `TicketRecords` + `TicketRecordsPaginationBar` | `EventRecords` + misma paginación UI                     |
| `TicketsManagementView`                        | Estado `page`, `useEffect` reset al cambiar filtros      |
| `tickets.controller.ts`                        | Query pipe con `listEventsQuerySchema`                   |
| `clubs` select en otros formularios            | `useClubs` / `clubsQueryOptions` para `clubId`           |

## Contratos HTTP (sketch)

```ts
// GET /api/events/my-events?page=1&limit=10
PaginatedResponse<EventResponse>

// POST /api/events
createEventSchema → EventResponse
```

## Verificación

```bash
pnpm type-check
pnpm lint
# Manual: crear evento con fechas válidas, ver fila en tabla, paginar si >10
```
