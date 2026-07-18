# Plan de implementación — Gestión de ubicaciones

> Cómo se implementa esta feature. Complementa `spec.md` (`approved`).  
> Borrador fase 6 — [INTERVIEW.md](../../INTERVIEW.md).

## Orden de capas

```text
1. @afterdark/types (LOCATION_TYPE; DTOs Location*)
2. @afterdark/validators (location schemas; sin status)
3. packages/db (schema rename → migration → repositories)
4. @afterdark/common (API_ROUTES.locations)
5. @afterdark/i18n (namespace locations + copy)
6. apps/api (módulo locations; set type=permanent en create)
7. apps/dashboard (módulo/routes /locations; sin status/type UI)
8. Consumidores cruzados (events, staff, tickets, sales) — clubId → locationId
```

## Archivos a crear / modificar

### Types

| Archivo                                                   | Cambio                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| `packages/types/src/enums/club.ts` → `location.ts`        | `LOCATION_TYPE` (`permanent` \| `temporary`); quitar `CLUB_STATUS` |
| `packages/types/src/dto/club.ts` → `location.ts`          | `LocationResponse`, etc.; `status` → `type`                        |
| `packages/types/src/repository/clubs.ts` → `locations.ts` | Tipos repo renombrados                                             |
| barrels `enums` / `dto` / `repository`                    | Re-exports                                                         |

### Validators

| Archivo                                           | Cambio                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `packages/validators/src/club.ts` → `location.ts` | Schemas create/update; sin `status`; `type` no requerido en body Ubicaciones |
| `packages/validators/src/index.ts`                | Export                                                                       |

### DB

| Archivo                                                  | Cambio                                                         |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| `schema/club.ts` → `location.ts`                         | Tabla `locations`, col `type`, sin `status`                    |
| `club-address-lnk` / `club-asset-lnk` / `staff-club-lnk` | Rename tablas + `locationId`                                   |
| `event.ts`, `staff-invitation.ts`                        | `clubId` → `locationId`                                        |
| `repositories/clubs/**` → `locations/**`                 | Rename funciones/archivos                                      |
| `repositories/assets/*club*`                             | Rename a location                                              |
| Nueva migración drizzle (prefijo timestamp)              | Rename tables/cols + backfill `type=permanent` + drop `status` |

### Common + i18n

| Archivo                                         | Cambio                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `packages/common/.../api-routes.ts`             | `API_LOCATIONS_PREFIX`, `API_ROUTES.locations`, path `my-locations` |
| `packages/i18n/.../locales/clubs` → `locations` | Copy ES/EN “Ubicaciones” / “Locations”                              |
| namespaces / error-codes / validation-keys      | `club` → `location`                                                 |

### API

| Archivo                                          | Cambio                                       |
| ------------------------------------------------ | -------------------------------------------- |
| `apps/api/src/modules/clubs/**` → `locations/**` | Controller, use-cases, mappers, services     |
| `create-*.use-case`                              | Forzar `type: permanent` al crear            |
| `update-*.use-case`                              | No aceptar cambio de `type` desde este flujo |
| `app.module.ts` / `modules/index.ts`             | Registrar `LocationsModule`                  |
| Eventos/staff/tickets que importan clubs         | Actualizar imports y `locationId`            |

### Dashboard

| Archivo                                           | Cambio                                          |
| ------------------------------------------------- | ----------------------------------------------- |
| `routes/_app/club-management/**` → `locations/**` | Rutas `/locations`, `/new`, `/$documentId/edit` |
| `modules/club-management/**` → `locations/**`     | Form sin status; formatter sin status           |
| `DASHBOARD_ROUTES` / query-keys / app-shell       | `locations`                                     |
| Events/staff/sales que usan clubs                 | Selectores/copy/`locationId`                    |

## Notas técnicas

- Breaking rename: sin alias `/api/clubs` ni tabla `clubs`.
- `routeTree.gen.ts` se regenera con `pnpm dev` — no editar a mano.
- Migración: preferir SQL explícito (rename table/columns) + default `permanent` para filas existentes.
- Enum en DB alineado a strings `permanent` / `temporary`.
- QA: CRUD en `/locations`; verificar events/staff siguen resolviendo la FK renombrada.
