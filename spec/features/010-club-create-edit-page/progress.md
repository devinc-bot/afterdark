# Progreso de entrevista — `010-club-create-edit-page`

> [INTERVIEW.md](../../INTERVIEW.md)

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

- **Relación:** mejora UX de `002-club-management`.
- **Apps:** solo `dashboard`; sin API nueva.
- **Rutas:** `/club-management/new` y `/club-management/$documentId/edit`.
- **Cancelar con cambios:** diálogo de confirmación.

### Fase 2 — Comportamiento y alcance

- Mantener `ClubRemoveDialog`.
- Layout desktop: dos columnas (datos/ubicación | imágenes).
- Footer sticky mobile y desktop.
- Usuario pidió _seguí_ → fases 3–6 inferidas y documentadas.

### Fase 3 — User stories

- US-1 a US-6: crear, editar, unsaved changes, not found, listado sin modal, footer sticky.

### Fase 4 — Contratos

- API sin cambios; rutas UI; copy completo incl. diálogo unsaved; `DASHBOARD_ROUTES`.

### Fase 5 — Reglas y cierre

- Misma validación/imágenes; `isDirty` amplio; spec → `approved`.

### Fase 6 — Plan técnico

- `plan.md` y `tasks.md` creados; solo capa dashboard.

---

## Supuestos del asistente

- Patrón de rutas igual a `newProperty` / `editProperty` en `DASHBOARD_ROUTES`.
- `useBlocker` de TanStack Router para navegación con cambios sin guardar.
- Breakpoint dos columnas: `lg+` (alineado con resto del dashboard).
