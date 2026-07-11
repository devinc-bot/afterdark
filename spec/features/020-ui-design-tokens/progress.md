# Progreso de entrevista — `ui-design-tokens`

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

- Feature: `020-ui-design-tokens` — Tokens de design system (UI).
- Apps: `ui`, `web`, `dashboard`. Sin dependencias.

### Fase 2 — Comportamiento y alcance

- Tokens/clases CSS centralizados; 1ª entrega = border-radius (`rounded-control` = `rounded-xl`).

### Fase 3 — User stories

- US-1 radius global; US-2 patrón extensible.

### Fase 4 — Contratos

- `--radius-control` + `.rounded-control`; solo paquete UI; futuros `*-control`.

### Fase 5 — Reglas y cierre

- Reglas de fuente de verdad, excepciones, extensión, verificación visual.
- Usuario: «hazlo» → status `approved` + implementar.

### Fase 6 — Plan técnico

- Plan e implementación en el mismo turno (pedido explícito).

---

## Supuestos del asistente

- Migración de `rounded-xl` en apps = follow-up.
