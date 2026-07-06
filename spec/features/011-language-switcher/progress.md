# Progreso de entrevista — `language-switcher`

> Estado de la entrevista guiada ([INTERVIEW.md](../../INTERVIEW.md)). Actualizar al cerrar cada fase.

| Fase | Nombre                   | Estado        |
| ---- | ------------------------ | ------------- |
| 1    | Identidad                | `done`        |
| 2    | Comportamiento y alcance | `done`        |
| 3    | User stories             | `done`        |
| 4    | Contratos                | `done`        |
| 5    | Reglas y cierre          | `in_progress` |
| 6    | Plan técnico             | `done`        |

Estados: `pending` · `in_progress` · `done`

---

## Log de respuestas

### Fase 1 — Identidad

- Feature nueva, no estaba en el roadmap.
- Apps: `web` + `dashboard`.
- Título/slug: Selector de idioma / `language-switcher`.
- Sin dependencias de otra feature (usa `@afterdark/i18n`, ya existente como package de infra, no como feature del roadmap).

### Fase 2 — Comportamiento y alcance

- Hallazgo clave: `dashboard` ya tiene un select "Idioma del panel" en Preferencias, pero mock/local (no pega al i18n real). `web` no tiene header/nav en ninguna pantalla.
- Decisión: conectar el select existente al `setLanguage()` real (no crear UI nueva). `web` queda fuera de esta feature — apps pasa a ser solo `dashboard`.
- Incluye/No incluye documentado en `spec.md`.

### Fase 3 — User stories

- US-1 confirmada tal cual propuesta: un solo rol (usuario del dashboard), 2 criterios (cambio inmediato + persistencia entre sesiones). Sin criterio de error de red (fuera de alcance por ahora).

### Fase 4 — Contratos

- Sacar "Deutsch" del mock (solo es/en, alineado a `SUPPORTED_LANGUAGES`).
- El idioma se aplica recién al "Guardar cambios" (igual que el resto del form); "Descartar" revierte la selección sin haber cambiado nunca el idioma real. Se ajustó US-1 con un 3er criterio para cubrir el caso "Descartar".
- Sin API ni tabla nueva — todo cliente, reusa `setLanguage()` de `@afterdark/i18n/client`.

### Fase 5 — Reglas y cierre

- Sin respuesta del usuario (AFK) a las preguntas de fase 5. Se infirió: save falla → no cambia idioma real (consistente con resto de campos del form).
- Status se mantiene `draft` — falta confirmación explícita del usuario para pasar a `approved`.

### Fase 6 — Plan técnico

- Usuario pidió "hacé la implementación" (pedido explícito) sin cerrar fase 5 formalmente → excepción del protocolo, se procedió a implementar.
- Implementado: `packages/validators/src/settings.ts`, `apps/dashboard/.../settings.mock.ts`, `.../settings-storage.utils.ts`, `.../settings-form-context.tsx`.
- Verificado: type-check (validators + dashboard), lint (0 errores, 1 warning esperado de `exhaustive-deps` con comentario explicativo en código), smoke request a `/settings` (200, sin errores en HTML).
- No verificado: flujo completo en browser con sesión de dueño (requiere login) — queda como QA manual pendiente en `tasks.md`.

---

## Supuestos del asistente

<!-- Solo si el usuario pidió inferir. Revisar antes de implementar. -->

-
