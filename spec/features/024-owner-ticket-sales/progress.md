# Progreso de entrevista — `owner-ticket-sales`

> Estado de la entrevista guiada ([INTERVIEW.md](../../INTERVIEW.md)). Actualizar al cerrar cada fase.

| Fase | Nombre                   | Estado |
| ---- | ------------------------ | ------ |
| 1    | Identidad                | `done` |
| 2    | Comportamiento y alcance | `done` |
| 3    | User stories             | `done` |
| 4    | Contratos                | `done` |
| 5    | Reglas y cierre          | `done` |
| 6    | Plan técnico             | `done` |

Estados: `pending` · `in_progress` · `done`

---

## Log de respuestas

### Fase 1 — Identidad

Confirmado: `024-owner-ticket-sales`, apps `api`+`dashboard`, ruta `/sales`, sidebar Ventas.

### Fase 2 — Comportamiento y alcance

Confirmado: historial COMPLETED, una fila por orden; fuera web/export/reembolsos/QR/no-completadas/fila por ticket_sold.

### Fase 3 — User stories

Confirmado: 3 stories + US-4 acceso; empty/loading/error ok; staff oculta sidebar y bloquea ruta.

### Fase 4 — Contratos

Confirmado + supuestos: Evento/Club/Tipo + Desde/Hasta; `GET /api/dashboard/sales`; buyer name+email; tipo = `TICKET_TYPE`.

### Fase 5 — Reglas y cierre

Confirmado: reglas OK. Spec **`approved`**.

### Fase 6 — Plan técnico

Plan/tasks confirmados implícitamente con “implementá”. Implementación completa.

---

## Supuestos del asistente

- Endpoint bajo `dashboard` (junto a analytics/KPI).
- Orden default: `paidAt` desc.
- `clubId`/`eventId` ajenos → lista vacía (no leak).
