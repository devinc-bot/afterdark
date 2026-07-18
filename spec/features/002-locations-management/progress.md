# Progreso de entrevista — `002-locations-management`

> [INTERVIEW.md](../../INTERVIEW.md)

| Fase | Nombre                   | Estado |
| ---- | ------------------------ | ------ |
| 1    | Identidad                | `done` |
| 2    | Comportamiento y alcance | `done` |
| 3    | User stories             | `done` |
| 4    | Contratos                | `done` |
| 5    | Reglas y cierre          | `done` |
| 6    | Plan técnico             | `done` |

> Feature renombrada desde `002-club-management`. El CRUD existente sigue vigente; esta entrevista documenta el rename completo + cambio de esquema (`status` → `type`).

---

## Log de respuestas

### Fase 1 — Identidad (2026-07-17)

- **Relación:** C — renombrar features de clubs → locations y hacer las modificaciones ahí (no feature `026` nueva).
- **Título / slug:** `Gestión de ubicaciones` / `locations-management` (ex `club-management`).
- **También renombradas en roadmap:** `005-location-assets` (ex `club-assets`), `010-location-create-edit-page` (ex `club-create-edit-page`).
- **Apps:** `api`, `dashboard`, `db`, `types`, `validators`, `i18n`. `web` fuera salvo que se decida en fase 2.
- **Profundidad rename:** B — completo: copy UI (“Ubicaciones”) + módulos/rutas/API (`/clubs` → `/locations`) + tabla DB `clubs` → `locations`.
- **Dependencias:** `001-auth-sessions`; pantallas de `010-location-create-edit-page` se actualizan con este cambio.
- **Schema pedido:** quitar `status`; agregar `type` (`permanente` \| `temporal`).

### Fase 2 — Comportamiento y alcance (2026-07-17)

- **Qué hace:** CRUD de ubicaciones desde sección Ubicaciones; las creadas ahí son **permanentes**. Temporales = desde eventos (después).
- **Por qué:** concepto más general; en eventos (futuro) se podrá elegir permanente o completar campos para temporal.
- **Incluye:** rename completo (UI+API+DB), drop `status`, add `type`, FKs/links, formulario `010`, ruta dashboard `/locations`.
- **No incluye:** `web`; flujo temporal desde eventos; lógica por tipo; `005` completo; activo/inactivo.
- **Ruta:** `/locations` (no `/locations-management`).

### Fase 3 — User stories (2026-07-17)

- **Rol:** solo `owner`.
- **US-1…US-4:** listar / crear permanente / editar-eliminar / rename UI+API — confirmadas.
- **Tipo en formulario:** A — no se muestra; backend fija `permanente`.
- **Migración datos:** filas existentes → `type = permanente`.
- **Criterios mínimos:** confirmados.

### Fase 4 — Contratos (2026-07-17)

- Usuario: “sigue” → se adoptan los pre-rellenos recomendados.
- **API:** `/api/locations/*` (list `my-locations`, create, patch, delete); JWT owner.
- **`type`:** inglés `permanent` \| `temporary`; create desde Ubicaciones no envía `type` (server = `permanent`).
- **Datos:** rename tablas/FKs clubs→locations; drop `status`; migrate existentes a `permanent`.
- **UI:** `/locations` (+ new/edit); copy “Ubicaciones”; sin status ni selector type.

### Fase 5 — Reglas y cierre (2026-07-17)

- Reglas / edge cases confirmados (“ok”).
- Preguntas abiertas: ninguna.
- Spec → `approved`; roadmap `002` → `approved`.

### Fase 6 — Plan técnico

- Borrador en `plan.md` / `tasks.md` confirmado; implementación iniciada (2026-07-17).

---

## Supuestos del asistente

- Identificadores en inglés (`locations`, `/locations`); copy UI en español (“Ubicaciones”).
- `type` en DB/API: `permanent` \| `temporary` (fase 4, “sigue”).
- Formulario Ubicaciones: sin control de `type`; server fija `permanent`.
- PATCH desde Ubicaciones no cambia `type`.
-
