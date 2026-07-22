# Progreso de entrevista — `026-event-create-edit-page`

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

- Feature **nueva** (opción A), no ampliación de `011`.
- Alcance de identidad: **crear y editar** eventos en pantalla dedicada (wizard), no solo crear.
- Título: _Crear/editar evento en pantalla (wizard)_.
- Slug / ID: `026-event-create-edit-page` (espejo de `010-location-create-edit-page`).
- Apps: `dashboard` + `api` (y paquetes compartidos que toquen imágenes/validación: `validators`, `types`, `i18n`, posiblemente `db`).
- Dependencias: `011` se **elimina**; depende de `002-locations-management` / `010-location-create-edit-page`.
- Nota (ajustada en fase 2): imágenes del evento **opcionales, máx. 2**; ubicación **máx. 4** imágenes.

### Fase 2 — Comportamiento y alcance

- Qué puede hacer: create/edit en pantallas dedicadas, wizard 2 steps (ubicación → datos evento + imágenes).
- Incluye: rutas, wizard, form ubicación simplificado, quitar modales, API imágenes.
- No incluye: listado salvo CTA/edit, web, tickets, delete.
- Edit step 1: ubicación preseleccionada.

### Fase 3 — User stories

- Rol: solo **owner**.
- US-1…US-5 (incl. cancelar como locations). Criterios redactados por el asistente.

### Fase 4 — Contratos

Usuario: _“continua”_ → inferencias documentadas:

- Ubicación nueva en **submit final** (opción B).
- Multipart + `event_assets_lnk` + `EVENT_IMAGE_MAX_COUNT = 2`.
- `LOCATION_IMAGE_MAX_COUNT` **5 → 4** global.
- Rutas `/events/new`, `/events/$documentId/edit`.
- `GET /api/events/:documentId` + `EventResponse.images`.

### Fase 5 — Reglas y cierre

Usuario: _“sigue”_ → propuestas aceptadas:

- Solo owner; edge cases OK; listado **sin** thumbs de evento; status → **`approved`**.

### Fase 6 — Plan técnico

- `plan.md` y `tasks.md` redactados por el asistente tras approval.

---

## Supuestos del asistente

- `012` no se elimina; dependencia → `026`.
- Orquestación B; si `POST location` OK y `POST event` falla, la ubicación queda creada (aceptable v1).
- Reusar UI/mapa de locations por composición en el step 1.
