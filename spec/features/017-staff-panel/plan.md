# Plan de implementación — Panel del staff (rol staff)

> Cómo se implementa esta feature. Complementa `spec.md`.

## Orden de capas

```text
1. @afterdark/types          → SessionResponse + role
2. apps/api                  → SessionService retorna role
3. apps/dashboard            → session store, nav por rol, panel staff, guards 404
4. packages/i18n             → copy nuevo (tabla, estados, descripción staff)
```

## Archivos a crear / modificar

### Types

| Archivo                          | Cambio                                       |
| -------------------------------- | -------------------------------------------- |
| `packages/types/src/dto/user.ts` | Agregar `role: UserRole` a `SessionResponse` |

### API

| Archivo                                           | Cambio                                                           |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| `apps/api/src/modules/session/session.service.ts` | Incluir `role: payload.role` en el return de `getCurrentSession` |

### Dashboard — common

| Archivo                                                   | Cambio                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `app/modules/common/formatters/session-user.formatter.ts` | Pasar `role` en `toSessionUser` (si se usa post-login)                          |
| `app/modules/common/constants/routes.ts`                  | Opcional: `OWNER_ONLY_ROUTE_PREFIXES` o helper `isOwnerRoute(pathname)`         |
| `app/modules/common/constants/role-routes.ts`             | **Nuevo** — mapa de rutas permitidas por rol                                    |
| `app/modules/common/components/app-shell.tsx`             | `buildPrimaryNav(t, role)` — filtrar ítems según `user.role`                    |
| `app/modules/common/components/not-found-view.tsx`        | **Nuevo** (opcional) — extraer UI de `RootNotFound` para reuso dentro del shell |

### Dashboard — staff panel module

| Archivo                                                      | Cambio                                             |
| ------------------------------------------------------------ | -------------------------------------------------- |
| `app/modules/staff-panel/constants/attendee-entry-status.ts` | **Nuevo** — const `ATTENDEE_ENTRY_STATUS` + labels |
| `app/modules/staff-panel/constants/attendees.mock.ts`        | **Nuevo** — filas mock                             |
| `app/modules/staff-panel/components/staff-panel-view.tsx`    | **Nuevo** — botón Escanear + tabla                 |
| `app/modules/staff-panel/components/attendee-records.tsx`    | **Nuevo** — tabla ShadCN compact + badges          |
| `app/modules/staff-panel/components/entry-status-badge.tsx`  | **Nuevo** — badge por estado                       |
| `app/modules/staff-panel/index.ts`                           | **Nuevo** — barrel                                 |

### Dashboard — routes

| Archivo                                 | Cambio                                                     |
| --------------------------------------- | ---------------------------------------------------------- |
| `app/routes/_app/dashboard.tsx`         | Branch: `owner` → vista actual; `staff` → `StaffPanelView` |
| `app/routes/_app/club-management/*.tsx` | `beforeLoad`: staff → `notFound()`                         |
| `app/routes/_app/tickets.tsx`           | `beforeLoad`: staff → `notFound()`                         |
| `app/routes/_app/events.tsx`            | `beforeLoad`: staff → `notFound()`                         |
| `app/routes/_app/staff.tsx`             | `beforeLoad`: staff → `notFound()`                         |

Alternativa DRY: layout `beforeLoad` en `_app.tsx` que valide pathname contra `role-routes.ts`.

### i18n

| Archivo                                       | Cambio                                    |
| --------------------------------------------- | ----------------------------------------- |
| `packages/i18n/src/locales/dashboard/es.json` | `pages.panel.staff.*`, `table.*`, estados |
| `packages/i18n/src/locales/dashboard/en.json` | Mismas claves en inglés                   |

## Diseño técnico

### Rol en sesión

`JwtPayload` ya incluye `role`. `SessionService` hoy omite el campo al mapear el perfil. Agregar `role: payload.role` es el cambio mínimo; no requiere query extra a DB.

### Navegación

`AppShell` ya usa `useSession()`. Pasar `user?.role` a `buildPrimaryNav`:

- `staff` → solo ítem Panel.
- `owner` → ítems actuales sin cambios.

Footer (perfil + cerrar sesión) sin cambios.

### Panel staff

`StaffPanelView` dentro de `PageLayout`:

```
[ Escanear ]                    ← Button, top-left, onClick noop

┌─────────────────────────────────────────┐
│ Nombre │ Evento │ Estado de entrada     │
│ ...    │ ...    │ [Badge Válida]        │
└─────────────────────────────────────────┘
```

Patrón de tabla: igual que `staff-user-records.tsx` / `ticket-record.tsx` (`Table variant="compact"` dentro de `Card`).

### Guard 404 por rol

Helper `assertRouteAllowedForRole(role, pathname)`:

| Rol     | Rutas bloqueadas                                    |
| ------- | --------------------------------------------------- |
| `staff` | `/club-management`, `/tickets`, `/events`, `/staff` |
| `owner` | ninguna en v1 (extensible)                          |

En `beforeLoad` de rutas del dueño (o en `_app` layout): si no permitido → `throw notFound()`. TanStack Router renderiza `RootNotFound`.

`/settings` permitido para ambos roles.

### Badges de estado

| Estado UI | Variante sugerida               |
| --------- | ------------------------------- |
| Válida    | `default` o verde (success)     |
| Usada     | `secondary`                     |
| Expirada  | `destructive` o `outline` muted |

Usar `Badge` de `@afterdark/ui`.

## Riesgos / edge cases

| Caso                            | Comportamiento esperado                                         |
| ------------------------------- | --------------------------------------------------------------- |
| Sesión sin `role` (cache viejo) | Refetch session tras deploy; invalidar store en login           |
| Staff en `/settings`            | Permitido                                                       |
| Admin / user roles en dashboard | Fuera de alcance v1; si entran, definir nav mínima o 404 global |
| Mock vacío                      | Mensaje «No hay asistentes para mostrar.»                       |

## Verificación manual

| Paso                                 | Resultado esperado                          |
| ------------------------------------ | ------------------------------------------- |
| 1. Login como **owner**              | Sidebar completo; `/dashboard` sin cambios  |
| 2. Login como **staff**              | Sidebar solo Panel + perfil + cerrar sesión |
| 3. Staff en `/dashboard`             | Botón Escanear + tabla mock con badges      |
| 4. Staff navega a `/club-management` | 404                                         |
| 5. Click **Escanear**                | Sin efecto                                  |
| 6. `GET /session/me`                 | Respuesta incluye `role`                    |
