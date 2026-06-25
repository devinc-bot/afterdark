# Progreso de entrevista — `staff-invitations`

> Estado de la entrevista guiada ([INTERVIEW.md](../../INTERVIEW.md)). Actualizar al cerrar cada fase.

| Fase | Nombre | Estado |
| ---- | ------ | ------ |
| 1 | Identidad | `done` |
| 2 | Comportamiento y alcance | `done` |
| 3 | User stories | `done` |
| 4 | Contratos | `done` |
| 5 | Reglas y cierre | `done` |
| 6 | Plan técnico | `done` |

Estados: `pending` · `in_progress` · `done`

---

## Log de respuestas

### Fase 1 — Identidad

- **Encaje:** ampliar `003-staff-invitations` del roadmap (no nueva fila).
- **Foco de esta spec:** conectar `StaffUserRecords` en `staff-management-view.tsx` (tab Staff) — reemplazar `STAFF_USER_RECORDS_MOCK` por datos reales.
- **Alcance acordado:** solo listado (`GET /staff/my-personnel` ya existente en API). El toggle activar/desactivar (`onStatusChange`) **permanece local** hasta una spec futura.
- **Apps:** `dashboard` únicamente (sin cambios en `api` en esta entrega).
- **Dependencias:** `001-auth-sessions`, `002-club-management` (personal asociado a clubes del dueño).

### Fase 2 — Comportamiento y alcance

- **Carga:** prefetch en route loader de `/staff` + `Suspense` en el componente (patrón alineado con `club-management`).
- **Vacío:** sin filas → no mostrar tabla; empty state dedicado en el tab Staff.
- **Toggle estado:** deshabilitado en UI hasta spec/entrega de `PATCH` staff (no optimistic local).

### Fase 3 — User stories

- **Empty copy:** reutilizar `STAFF_COPY.table.emptyTitle` / `emptyDescription`.
- **Error:** banner en el tab + botón Reintentar.
- **KPI:** no incluir en esta entrega.

### Fase 4 — Contratos

- **Última actividad:** fecha/hora absoluta locale `es-AR` desde `lastActiveAt`.
- **Avatar:** URL si `avatar` viene informado; si no, iniciales con tono determinístico por `documentId`.

### Fase 5 — Reglas y cierre

- Status spec → `approved` (listo para implementar).

### Fase 6 — Plan técnico

- `plan.md` y `tasks.md` generados; pendiente revisión del usuario.

### Fase 6 — Plan técnico

---

## Supuestos del asistente

-
