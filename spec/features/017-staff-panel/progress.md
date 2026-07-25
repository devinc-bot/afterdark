# Progreso de entrevista — `staff-panel`

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

Confirmado por el usuario:

- Feature nueva, no existía en el roadmap.
- Título: **Panel del staff (rol staff)**; slug `staff-panel`; ID `017`.
- Apps: foco en `dashboard` (datos de la tabla mockeados, sin API de usuarios por ahora).
- Fuente del rol: el usuario prefiere que `role` viaje en `SessionResponse` (`GET /session/me`) y usar `useSession()` en el front, **en vez** de leerlo desde `GET /settings`. Esto implica un cambio menor transversal en `api` + `@repo/types` para exponer `role` en la sesión.
- Dependencias: `001-auth-sessions` (agregar `role` a la sesión/JWT).

### Fase 2 — Comportamiento y alcance

- Ruta: reutilizar `/dashboard` con render por rol.
- Sidebar staff: solo **Panel** + perfil (`/settings`) + cerrar sesión; ocultar Clubes, Entradas, Eventos, Usuarios.
- Sidebar owner: sin cambios.
- Tabla: asistentes/clientes con entrada al evento (mock).
- Botón **Escanear**: placeholder; intención futura = escanear QR de entradas en la puerta.

### Fase 3 — User stories

- Columnas tabla: **Nombre**, **Evento**, **Estado de entrada**.
- Owner en `/dashboard`: sin cambios respecto a hoy.
- Estado vacío: mensaje cuando no hay asistentes.

### Fase 4 — Contratos

- Estados mock: **Válida**, **Usada**, **Expirada**.
- Tabla estática sin búsqueda ni paginación.
- Deep link: **404** si un rol accede a rutas del otro (`beforeLoad` + `notFound()`); reutilizar o extraer componente 404 existente (`RootNotFound` en `__root.tsx`).

### Fase 5 — Reglas y cierre

- Descripción panel staff: «Consultá asistentes y escaneá entradas en la puerta.»
- Estados con badge de color.
- Spec **approved**.

### Fase 6 — Plan técnico

- `plan.md` y `tasks.md` escritos.

---

## Supuestos del asistente

<!-- Solo si el usuario pidió inferir. Revisar antes de implementar. -->

-
