# Progreso de entrevista — `011-events-management`

> Requisitos entregados en un solo mensaje (sin entrevista fase a fase).

| Fase | Nombre                   | Estado |
| ---- | ------------------------ | ------ |
| 1    | Identidad                | `done` |
| 2    | Comportamiento y alcance | `done` |
| 3    | User stories             | `done` |
| 4    | Contratos                | `done` |
| 5    | Reglas y cierre          | `done` |
| 6    | Plan técnico             | `done` |

---

## Log de respuestas

### Fase 1 — Identidad

- Feature: gestión de eventos en dashboard para dueños de clubes.
- ID: `011-events-management`.
- Apps: `api` + `dashboard`.

### Fase 2 — Comportamiento y alcance

- Crear evento en diálogo modal.
- Listar eventos con paginación; tabla igual que tickets.
- Campos: club, nombre, descripción, inicio, fin, estado (enum `EVENT_STATUS`).
- Default estado: `published`.
- Sin edición/eliminación en v1.

### Fase 3 — User stories

- US-1 a US-4 documentadas en `spec.md`.

### Fase 4 — Contratos

- `GET /api/events/my-events`, `POST /api/events`.
- Validación Zod con fechas y campos requeridos.
- UI `/events` con componentes listados en spec.

### Fase 5 — Reglas y cierre

- Ownership vía club → owner.
- `startsAt` < `endsAt`.
- Status desde enum en `packages/db/src/schema/event.ts`.

### Fase 6 — Plan técnico

- `plan.md` con orden de capas y archivos.

---

## Supuestos del asistente

- Ruta dashboard `/events` y namespace i18n `events`.
- Tamaño de página 10 (mismo que tickets).
- Campo `location` no se muestra en v1.
- Acciones de fila (editar/eliminar) fuera de alcance inicial.
