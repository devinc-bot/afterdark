# Tasks — Ventas de tickets (historial del dueño)

> Checklist de tareas. Marcar `[x]` al completar. Orden sugerido de arriba a abajo.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md` (`approved`)

## Shared packages

- [x] `listOwnerSalesQuerySchema` (+ refine `from` ≤ `to`)
- [x] `OwnerSaleResponse` + tipos repository
- [x] `findOwnerSalesPaginated` (+ export)
- [x] `API_ROUTES.dashboard.path.sales()`

## API

- [x] `GET /api/dashboard/sales` (owner JWT)
- [x] Map repo → `PaginatedResponse<OwnerSaleResponse>`
- [x] Errores `400` / `403` / falla interna i18n

## Dashboard

- [x] `DASHBOARD_ROUTES.sales()` + `OWNER_ALLOWED_PATH_PREFIXES`
- [x] Sidebar **Ventas** (solo owner)
- [x] Módulo `sales`: service + query + filtros + tabla + paginación
- [x] Ruta `/_app/sales`
- [x] i18n (empty, error, columnas, filtros)

## QA

- [x] Type-check / lint (api + dashboard)
- [ ] Verificación manual (owner + staff + filtros) con seed
