# Plan de implementación — Ventas de tickets (historial del dueño)

> Cómo se implementa esta feature. Complementa `spec.md`; no repetir criterios de aceptación.

## Orden de capas

```text
1. @repo/validators (+ types DTO)
2. @repo/types
3. packages/db (repository nuevos; schema orders ya existe)
4. apps/api dashboard (controller + service method o use case)
5. @repo/common API_ROUTES
6. apps/dashboard (module sales → route → sidebar + role-routes + i18n)
```

## Archivos a crear / modificar

### Validators

| Archivo                                               | Cambio                                                                                                    |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `packages/validators/src/dashboard.ts` (o `sales.ts`) | `listOwnerSalesQuerySchema`: page, limit, eventId?, clubId?, ticketType?, from?, to? (+ refine from ≤ to) |

### Types

| Archivo                           | Cambio                          |
| --------------------------------- | ------------------------------- |
| `packages/types/src/dto/…`        | `OwnerSaleResponse`             |
| `packages/types/src/repository/…` | params/row del listado paginado |

### Database

| Archivo                                                                | Cambio                                    |
| ---------------------------------------------------------------------- | ----------------------------------------- |
| `packages/db/src/repositories/dashboard/find-owner-sales-paginated.ts` | Query COMPLETED + joins + filtros + count |
| `packages/db/src/repositories/dashboard/index.ts`                      | export                                    |

### Common

| Archivo                                    | Cambio                              |
| ------------------------------------------ | ----------------------------------- |
| `packages/common/src/config/api-routes.ts` | `dashboard.path.sales()` → `/sales` |

### API

| Archivo                                                             | Cambio                  |
| ------------------------------------------------------------------- | ----------------------- |
| `apps/api/src/modules/dashboard/dashboard.controller.ts`            | `GET sales` owner-only  |
| `apps/api/src/modules/dashboard/dashboard.service.ts`               | `listSales` / map a DTO |
| (opcional) mapper / use-case si se alinea vertical-slice del módulo |

### Dashboard

| Archivo                                       | Cambio                                                    |
| --------------------------------------------- | --------------------------------------------------------- |
| `app/modules/common/constants/routes.ts`      | `sales()`                                                 |
| `app/modules/common/constants/role-routes.ts` | `/sales` en owner allowed                                 |
| `app/modules/common/components/app-shell.tsx` | nav **Ventas**                                            |
| `app/modules/sales/`                          | service, query, components (filters + table + pagination) |
| `app/routes/_app/sales.tsx`                   | ruta                                                      |
| `packages/i18n` locales dashboard/sales       | copy ES/EN                                                |

## Diseño técnico

- Reutilizar patrón de listados owner (`tickets` / `events`): `PageLayout` + tabla + barra de paginación + filtros en search params.
- Auth: mismos guards que KPI (`JwtAuthGuard` + `Roles([OWNER])`).
- Ownership en SQL: join `owners.documentId = :ownerDocumentId` (como series/KPI).
- Selectores Club/Evento: hooks/servicios ya existentes de clubs/events del dueño; tipo ticket = enum estático.

## Riesgos / edge cases

| Caso                           | Comportamiento                       |
| ------------------------------ | ------------------------------------ |
| Sin ventas / filtros sin match | Empty: _No hay ventas para mostrar._ |
| `from` > `to`                  | 400 i18n                             |
| IDs ajenos                     | página vacía                         |
| Staff URL directa              | redirect + 403 API                   |

## Verificación manual

| Paso                                       | Resultado esperado              |
| ------------------------------------------ | ------------------------------- |
| 1. Login owner → sidebar Ventas → `/sales` | Tabla con ventas seed COMPLETED |
| 2. Filtrar club / evento / tipo / fechas   | Listado acotado; page reset a 1 |
| 3. Login staff → `/sales`                  | Sin nav; ruta bloqueada         |
| 4. `GET /api/dashboard/sales` sin owner    | 403                             |
