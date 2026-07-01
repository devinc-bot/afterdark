# Entrevista para crear specs

> Protocolo obligatorio cuando el usuario pide **crear**, **empezar** o **completar** una spec de feature.

## Reglas para el asistente

1. **No completar la spec de una sola vez.** Hacer preguntas por fases; esperar respuestas antes de avanzar.
2. **Una fase por turno** (como máximo 5 preguntas relacionadas). Al final del turno: actualizar archivos y resumir qué quedó escrito.
3. **Usar `AskQuestion`** cuando haya opciones acotadas (apps, status, sí/no, elegir del roadmap).
4. **Pre-rellenar con contexto del repo** (`constitution/`, código existente, `roadmap.md`) y **pedir confirmación** — no asumir en silencio.
5. **No implementar código** durante la entrevista salvo que el usuario lo pida explícitamente.
6. **Escribir en español** el contenido de `spec.md` (copy de UI, criterios, mensajes de error). Identificadores y rutas en inglés.
7. Al terminar la fase 5, preguntar si pasa a `approved` o quedan dudas en **Preguntas abiertas**.

## Archivos por feature

Al iniciar la fase 1, crear `spec/features/00N-<slug>/` copiando `_template/` y renombrar títulos. Mantener siempre:

| Archivo       | Cuándo se actualiza                           |
| ------------- | --------------------------------------------- |
| `progress.md` | Cada fase (estado + log de respuestas)        |
| `spec.md`     | Fases 1–5                                     |
| `plan.md`     | Fase 6 (borrador técnico; el usuario revisa)  |
| `tasks.md`    | Fase 6 (checklist inicial; sin marcar hechas) |

Actualizar `spec/constitution/roadmap.md` al cerrar la fase 1 (fila nueva o status) y al marcar `approved` / `done`.

## Fases

### Fase 1 — Identidad

**Objetivo:** carpeta, ID, slug, título, apps, status inicial.

**Preguntar:**

- ¿Feature nueva o fila existente del roadmap? Si existe, ¿cuál?
- Si es nueva: título corto y slug (`kebab-case`).
- ¿Qué apps toca? (`api`, `web`, `dashboard`)
- ¿Depende de otra feature? (ver `roadmap.md` → Dependencias)

**Escribir:** cabecera de `spec.md`, `progress.md`, fila en `roadmap.md` con status `draft`.

---

### Fase 2 — Comportamiento y alcance

**Objetivo:** qué hace, por qué, límites claros.

**Preguntar:**

- En 1–2 frases: ¿qué puede hacer el usuario al terminar esta feature?
- ¿Qué problema de negocio resuelve? (enlazar `mission.md` si aplica)
- **Incluye:** lista concreta de capacidades.
- **No incluye:** qué queda explícitamente fuera (evitar scope creep).

**Escribir:** secciones _Qué hace_, _Por qué_, _Alcance_ en `spec.md`.

---

### Fase 3 — User stories

**Objetivo:** criterios de aceptación verificables.

**Preguntar:**

- ¿Qué roles participan? (cliente, dueño, staff, admin, …)
- Por cada rol relevante: una historia **Como / Quiero / Para**.
- Por historia: al menos 2 criterios **Dado / Cuando / Entonces**.

**Escribir:** sección _User stories_ en `spec.md`. Si falta detalle, dejar ítems en _Preguntas abiertas_.

---

### Fase 4 — Contratos

**Objetivo:** API, datos y UI acordados antes del plan técnico.

**Preguntar (solo lo que aplique):**

**API**

- ¿Endpoints nuevos o cambios a existentes? Método, ruta, auth (JWT, rol).
- Request/response: ¿schemas Zod nuevos o reutilizados?
- Errores HTTP y **mensaje en español** al usuario.

**Datos**

- ¿Tablas/columnas nuevas o cambios en esquema existente? (consultar `DATABASE.md`)
- ¿Solo repository sobre tablas ya definidas?

**UI**

- Rutas por app (`/staff`, `/tickets`, …).
- Copy visible: títulos, botones, vacíos, errores.

**Escribir:** sección _Contratos_ en `spec.md`.

---

### Fase 5 — Reglas y cierre de spec

**Objetivo:** negocio, edge cases, preguntas pendientes.

**Preguntar:**

- Reglas de negocio no obvias (permisos, estados, límites, validaciones).
- Edge cases conocidos (concurrencia, datos vacíos, expiración, …).
- ¿Queda algo sin decidir? → _Preguntas abiertas_.
- ¿La spec está lista para implementar? Si sí → status `approved`; si no → seguir en `draft`.

**Escribir:** _Reglas de negocio_, _Preguntas abiertas_, actualizar status en `spec.md` y `roadmap.md`.

---

### Fase 6 — Plan técnico (opcional en el mismo hilo)

**Objetivo:** `plan.md` y `tasks.md` alineados con la spec aprobada.

El asistente puede **proponer** el borrador leyendo `ARCHITECTURE.md` y el código existente. El usuario confirma o corrige en un turno.

**Escribir:** `plan.md` (capas, archivos), `tasks.md` (checklist sin `[x]`). Marcar fase 6 `done` en `progress.md`.

## Formato de cada turno (respuesta al usuario)

```markdown
## Fase N — [nombre]

[Preguntas numeradas o formulario AskQuestion]

---

**Ya escrito** (si aplica): `spec/features/00N-slug/…`
**Siguiente:** cuando respondas, actualizo … y paso a la fase N+1.
```

No pasar a la siguiente fase sin respuesta del usuario, salvo que diga _“seguí con lo que tengas”_ o _“inferí vos”_ — en ese caso documentar supuestos en _Preguntas abiertas_.

## Retomar una entrevista

1. Leer `spec/features/00N-<slug>/progress.md`.
2. Continuar desde la primera fase no marcada como `done`.
3. Resumir en 2–3 líneas lo ya acordado antes de preguntar.

## Disparadores (cuándo aplicar este protocolo)

- “creá / crea una spec”, “nueva feature”, “empezar spec de …”
- “completá la spec de …”, “seguimos con la spec”
- “actualizá la spec” → solo las secciones afectadas, confirmando cambios
