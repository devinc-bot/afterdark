# Plan de implementación — Arquitectura de tipos compartidos (DTOs)

> Complementa `spec.md` ([016-architecture](./spec.md)).

## Orden de capas

```text
1. packages/types/src/dto/*.ts  (nuevos archivos)
2. packages/types/src/domain.ts (quitar interfaces)
3. packages/types/src/index.ts  (re-exports)
4. Eliminar api.ts, pagination.ts
5. pnpm type-check (monorepo)
```

## Archivos a crear / modificar

### Types

| Archivo | Acción |
| ------- | ------ |
| `dto/common.ts` | Crear — `ApiResponse`, `ApiError`, `PaginationParams`, `PaginatedResponse` |
| `dto/auth.ts` | Crear — `LoginResponse`, `RegisterResponse`, `JwtPayload` |
| `dto/user.ts` | Crear — sesión, perfiles, `SettingsResponse`, `User`, `Property` (legacy) |
| `dto/club.ts` | Crear — `ClubResponse`, `ClubImageResponse`, `UploadedAssetResponse` |
| `dto/event.ts` | Crear — `EventResponse` |
| `dto/ticket.ts` | Crear — `TicketResponse` |
| `dto/staff.ts` | Crear — invitaciones + `StaffPersonnelItem` |
| `dto/index.ts` | Crear — barrel interno |
| `domain.ts` | Modificar — solo enums/const; quitar `User`, `Property` |
| `index.ts` | Modificar — `export * from './dto/index.ts'` |
| `api.ts` | Eliminar |
| `pagination.ts` | Eliminar |

### Consumidores

Sin cambios previstos. Verificar con `pnpm type-check`.

### Documentación

`ARCHITECTURE.md` — actualización opcional post-merge (fuera de alcance entrega 1).

## Diseño técnico

- Los DTOs importan enums desde `../domain.ts` (dependencia unidireccional: dto → domain).
- `dto/user.ts` usa `USER_ROLE` y tipos de status desde domain para discriminated unions (`CurrentOwnerResponse`, `CurrentStaffResponse`).
- `Property` lleva JSDoc `@deprecated` — placeholder del catálogo `web` legacy.
- Se elimina `CurrentUserResponse` (sin referencias en el repo).

## Riesgos / edge cases

| Caso | Comportamiento esperado |
| ---- | ----------------------- |
| Import directo `./api.ts` | No hay consumidores internos; solo barrel público |
| `Property` usado en web | Sigue disponible vía `@afterdark/types` hasta retiro del módulo |

## Verificación manual

| Paso | Resultado esperado |
| ---- | ------------------ |
| 1. `pnpm type-check` | 0 errores |
| 2. `pnpm lint` | 0 errores |
| 3. Grep `CurrentUserResponse` | 0 hits en código (solo spec/historial) |
