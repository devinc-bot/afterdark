# Progreso de entrevista — `email-service`

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

- **Scope:** feature nueva `019-email-service` (infra de envío de emails; no fila previa en roadmap).
- **Título:** Servicio de envío de emails · **Slug:** `email-service`.
- **Apps:** solo `api` (servicio interno; package compartido a decidir en fase 6).
- **Dependencias:** ninguna (infra transversal, patrón `015-files-module`).
- **Consumidores futuros (fuera de esta spec salvo acuerdo):** `003-staff-invitations`, reset de password, welcome.
- **Estado inicial:** `draft`.
- **Confirmación:** usuario (“hazlo”) sobre la propuesta de fase 1.

### Fase 2 — Comportamiento y alcance

- **Qué:** servicio interno de envío vía puerto + adaptador; templates con React Email.
- **Por qué:** desacoplar vendor (Resend → otro) y centralizar maquetación/i18n.
- **Incluye:** puerto, adaptador Resend + env, React Email para `staffInvitation` / `passwordReset` / `welcome`, errores tipados, humo en dev.
- **No incluye:** UI/HTTP público, cola/outbox, marketing, cablear dominio, otros adaptadores.
- **Primer consumidor:** supuesto A — solo infra + templates (sin cablear `003`/auth). Usuario dijo “continua” + React Email; documentado en Preguntas abiertas.
- **Confirmación:** “continua” + mandato React Email (corrige la propuesta “sin React Email”).

### Fase 3 — User stories

- US-1: envío vía puerto (sin acoplar Resend); error tipado si falla el provider.
- US-2: render React Email de `staffInvitation` / `passwordReset` / `welcome` con i18n `emails`.
- US-3: humo en dev con `RESEND_API_KEY`; fallo explícito si falta config.
- Sin adjuntos ni multi-idioma especial en el mismo envío (no pedido).
- **Confirmación:** “continúa”.

### Fase 4 — Contratos

- Sin HTTP; puerto `send({ to, subject, html, text? })`; render React Email aparte.
- Sin `replyTo` / `tags` / adjuntos en v1.
- Env: `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_SMOKE_TO` (opcional).
- Errores: `mail.NOT_CONFIGURED` | `SEND_FAILED` | `RENDER_FAILED`.
- Sin DB / UI.
- **Confirmación:** “sigue” (defaults: A + propuestas).

### Fase 5 — Reglas y cierre

- Reglas: solo adaptador conoce Resend; no leak de secrets; locale por caller (default `es`); humo solo no-prod + `MAIL_SMOKE_TO`; un `MAIL_FROM`; sin reintentos/cola; HTML vía React Email.
- Cableado de dominio: **fuera** de `019`.
- Status → **`approved`**.
- **Confirmación:** “sigue”.

### Fase 6 — Plan técnico

- Módulo Nest `mail/` en api: puerto `MailSender` + `ResendMailSender` + templates React Email + `MailService`.
- Env Zod opcional al boot; `NOT_CONFIGURED` al enviar.
- Sin package `@afterdark/emails` en v1 (todo en api, como `files`).
- Humo vía script dev.
- **Confirmación:** “sigue” (borrador escrito; usuario puede corregir).

---

## Supuestos del asistente

- Primer cableado de dominio **fuera** de `019` (infra + templates listos para consumir).
- Puerto = `send` puro; facade `render+send` opcional encima.
- Templates y Nest viven en `apps/api/src/modules/mail/` (no package nuevo en v1).
-
