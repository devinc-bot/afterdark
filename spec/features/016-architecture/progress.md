# Progreso de entrevista — `architecture`

> Estado de la entrevista guiada ([INTERVIEW.md](../../INTERVIEW.md)). Actualizar al cerrar cada fase.

| Fase | Nombre                   | Estado    |
| ---- | ------------------------ | --------- |
| 1    | Identidad                | `done`    |
| 2    | Comportamiento y alcance | `done`    |
| 3    | User stories             | `done`    |
| 4    | Contratos                | `done`    |
| 5    | Reglas y cierre          | `done`    |
| 6    | Plan técnico             | `done`    |

Estados: `pending` · `in_progress` · `done`

---

## Log de respuestas

### Fase 1 — Identidad

- **ID / slug:** `016-architecture`
- **Apps (entrega 1):** solo `packages/types`
- **Organización `dto/`:** por dominio
- **Consumidores:** sin cambios de import
- **domain vs dto:** enums en domain; todas las interfaces en dto

### Fase 2 — Comportamiento y alcance

- **Archivos dto:** auth, club, event, ticket, staff, user, common + index
- **`CurrentUserResponse`:** eliminar
- **Alcance spec:** solo `@afterdark/types`
- **`Property`:** legacy en dto; marcar para eliminación futura

### Fase 3 — User stories

- US-1 ubicación por dominio, US-2 sin breaking change, US-3 limpieza legacy

### Fase 4 — Contratos

- Estructura y mapeo en `spec.md`; `UploadedAssetResponse` → `dto/club.ts`

### Fase 5 — Reglas y cierre

- Spec **approved** 2026-07-06

### Fase 6 — Plan técnico

- Implementado en `packages/types`; `pnpm type-check` OK (types, api, dashboard); `pnpm lint` OK

---

## Supuestos del asistente

- `UploadedAssetResponse` en `dto/club.ts` (assets de club).
