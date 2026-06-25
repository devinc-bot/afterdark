# Plan de implementación — Staff e invitaciones (listado de personal)

> Complementa [spec.md](./spec.md). Status spec: `approved`.

## Orden de capas

```text
1. apps/dashboard — constants (API_ROUTES, QUERY_KEYS, copy)
2. apps/dashboard — service fetchStaffPersonnel
3. apps/dashboard — mapper StaffPersonnelItem → StaffUserRecord
4. apps/dashboard — queryOptions + useStaffPersonnel (Suspense-friendly)
5. apps/dashboard — route loader prefetch en _app/staff.tsx
6. apps/dashboard — StaffManagementView + StaffUserRecords (deshabilitar toggle)
```

Sin cambios en `@afterdark/validators`, `@afterdark/types`, `packages/db` ni `apps/api`.

## Archivos a crear / modificar

### Dashboard — config / constants

| Archivo | Cambio |
| ------- | ------ |
| `app/config/constants/api.ts` | `API_STAFF_PREFIX`, `API_ROUTES.staff.path.listMyPersonnel()` → `/my-personnel` |
| `app/modules/common/constants/query-keys.ts` | `staffPersonnel: () => ['staff-personnel']` |
| `app/modules/staff/constants/staff.copy.ts` | `table.loadError`, `table.retry` (banner + reintentar) |

### Dashboard — staff module

| Archivo | Cambio |
| ------- | ------ |
| `app/modules/staff/services/staff-personnel.service.ts` | **Nuevo** — `fetchStaffPersonnel()` → `GET /api/staff/my-personnel` |
| `app/modules/staff/utils/staff-personnel.mapper.ts` | **Nuevo** — map a `StaffUserRecord`, formato `lastActiveAt` es-AR, avatar URL vs iniciales |
| `app/modules/staff/queries/use-staff-personnel.ts` | **Nuevo** — `staffPersonnelQueryOptions`, `useStaffPersonnel` |
| `app/modules/staff/components/staff-management-view.tsx` | Quitar mock/state local de records; Suspense boundary + query; empty dedicado |
| `app/modules/staff/components/staff-user-records.tsx` | `readOnlyStatus` o prop `statusControlsDisabled`; soporte `AvatarImage` si hay URL |
| `app/modules/staff/types/staff-user-record.ts` | Opcional: campo `avatarUrl?: string \| null`; eliminar o aislar `STAFF_USER_RECORDS_MOCK` |
| `app/routes/_app/staff.tsx` | `loader`: `ensureQueryData`; wrapper `Suspense` + fallback skeleton |

## Diseño técnico

- **Patrón:** igual que `useClubs` + `fetchClubs`, con prefetch en loader (primera ruta del dashboard que lo use).
- **Errores:** `useQuery` con `throwOnError: false` en el componente del tab, o error boundary local; banner + `refetch()` en el tab *Personal* (no bloquear tab *Invitaciones*).
- **Empty:** si `data.length === 0`, renderizar bloque empty (sin `StaffUserRecords` tabla).
- **Toggle:** pasar `onStatusChange` no-op o `statusControlsDisabled={true}`; switch `disabled`.

```text
loader (/staff)
  └─ ensureQueryData(staffPersonnelQueryOptions)
       └─ StaffManagementView (Suspense)
            └─ useStaffPersonnel()
                 └─ map → StaffUserRecords | StaffEmptyState
```

## Riesgos / edge cases

| Caso | Comportamiento esperado |
| ---- | ----------------------- |
| API `[]` | Empty state, sin tabla |
| API 500 | Banner + Reintentar en tab Staff |
| `avatar` null | Iniciales + `avatarClassName` por hash |
| `avatar` URL inválida | Fallback a iniciales (onError en imagen) |
| Búsqueda sin resultados | `STAFF_COPY.table.noResultsTitle` (comportamiento actual) |
| Usuario no owner | 403 → banner o redirect según manejo global de API |

## Verificación manual

| Paso | Resultado esperado |
| ---- | ------------------ |
| 1. Dueño con personal aceptado en DB | `/staff` muestra filas reales (nombre, club, rol) |
| 2. Dueño sin personal | Empty `Todavía no hay usuarios`, sin tabla; invitar sigue visible |
| 3. API caída o 500 | Banner + Reintentar; al recuperar API, lista carga |
| 4. Switch de estado | Deshabilitado en todas las filas |
| 5. `pnpm type-check` + `lint` | Sin errores |
