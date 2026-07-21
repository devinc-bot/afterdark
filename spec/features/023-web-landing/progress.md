# Progreso de entrevista — `web-landing`

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

- Feature **nueva** (no fila existente del roadmap).
- Título: Landing web · slug: `web-landing` · ID: `023-web-landing`
- Apps: solo `web`
- Dependencias: `001-auth-sessions` por ahora

### Fase 2 — Comportamiento y alcance

- Resultado: solo header + secciones de landing donde aparecen Login/Register (no páginas de eventos/tickets).
- Por qué: OK (atajos de producto + identidad en lugar de CTAs de auth).
- Incluye: guest vs autenticado en nav; avatar; i18n; sesión existente — OK.
- No incluye listado/compra real ni menú perfil completo; además **quitar Login/Register en todos los lugares de la landing** con sesión.
- Click Eventos/Tickets/avatar: respuesta “correcto” sin elegir letra a–d → supuestos en Contratos.

### Fase 3 — User stories

- Roles: guest + cliente. Owner/staff sin UX especial.
- US-1 guest, US-2 header auth, US-3 sin CTAs auth en secciones — OK con criterios propuestos.

### Fase 4 — Contratos

- Copy `nav.events` / `nav.tickets` + aria avatar ES/EN — OK.
- Sin API/datos nuevos; solo `/`.
- Destino links / avatar / loading: usuario dijo “ok” → supuestos (links no navegables, avatar visual, loading con token → skeleton).

### Fase 5 — Reglas y cierre

- Usuario “ok”: 401 → guest sin toast; error red → guest; copy hero/closing sin cambiar (solo ocultar CTAs); supuestos fase 4 se mantienen; status **`approved`**.

### Fase 6 — Plan técnico

- Borrador escrito en `plan.md` / `tasks.md` (asistente). Pendiente confirmación del usuario para implementar.

---

## Supuestos del asistente

- Eventos/Tickets no navegan (aún sin catálogo).
- Avatar sin menú/logout.
- Loading: con cookie de token → ocultar auth CTAs + skeleton avatar; sin token → guest.
- 401 / error de carga → UI guest sin toast.
- Copy marketing de hero/closing no se reescribe.
