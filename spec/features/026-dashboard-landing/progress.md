# Progreso de entrevista — `dashboard-landing`

> Estado de la entrevista guiada ([INTERVIEW.md](../../INTERVIEW.md)). Actualizar al cerrar cada fase.

| Fase | Nombre                   | Estado        |
| ---- | ------------------------ | ------------- |
| 1    | Identidad                | `done`        |
| 2    | Comportamiento y alcance | `done`        |
| 3    | User stories             | `done`        |
| 4    | Contratos                | `done`        |
| 5    | Reglas y cierre          | `done`        |
| 6    | Plan técnico             | `done`        |

Estados: `pending` · `in_progress` · `done`

---

## Log de respuestas

### Fase 1 — Identidad

- **Tipo:** landing pública de marketing para dueños de clubes (pre-login). Explica el producto e invita a crear cuenta / iniciar sesión. Vive en la ruta pública `/` del dashboard, estilo `023-web-landing` pero orientada al negocio.
- **Título / slug:** "Landing del dashboard" / `dashboard-landing` (fila 026 del roadmap).
- **Apps:** solo `dashboard` (+ copy en `@afterdark/i18n`).
- **Depende de:** `001-auth-sessions` (CTAs login/registro + estado de sesión). Referencia de estilo: `023-web-landing`.

### Fase 2 — Comportamiento y alcance

- **Dueño autenticado en `/`:** redirige a `/dashboard`; la landing es solo para visitantes sin sesión.
- **Secciones:** hero, beneficios/features, cómo funciona, métricas/prueba social, FAQ, cierre con CTA final, footer.
- **Estilo:** diseño propio sobrio con `@afterdark/ui`; sin video/animaciones pesadas.
- **i18n:** ES + EN vía `@afterdark/i18n`.
- **Fuera de alcance:** datos reales, video pesado, blog/precios reales, rutas nuevas más allá de `/`, cambios en el panel autenticado.

### Fase 3 — User stories

- US-1 conocer producto, US-2 registro/login, US-3 redirect al panel. Confirmadas sin cambios.

### Fase 4 — Contratos

- Sin API ni cambios de datos. Solo UI en `/` + copy i18n (`dashboardLanding`).
- Estructura de 8 secciones (header, hero, beneficios, cómo funciona, métricas, FAQ, cierre, footer).
- **Respuestas (llegaron con retraso):** tono profesional y directo; el asistente redacta todo el copy ES+EN; **prueba social sin números** (frases de valor / testimonios cualitativos); footer con links placeholder.

### Fase 5 — Reglas y cierre

- Reglas: landing pública fuera de `_app`; cualquier sesión válida redirige a `/dashboard`; loading evita flash; error de red = guest; CTAs solo a `/register` y `/login`; copy vía i18n; no tocar panel.
- Status → `approved`.
- Siguiente: fase 6 (plan) + implementación.

### Fase 6 — Plan técnico

- Plan y tasks escritos. Feature 100% UI + copy: nuevo namespace i18n `dashboardLanding` + módulo `landing` en dashboard + ruta pública `/` (reutiliza `RequireGuest`); se elimina `_app/index.tsx`.
- Aprobado: escribir plan + implementar.

---

## Supuestos del asistente

<!-- Solo si el usuario pidió inferir. Revisar antes de implementar. -->

-
