# Servicio de envío de emails

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo          | Valor                 |
| -------------- | --------------------- |
| **ID**         | `019-email-service`   |
| **Status**     | `approved`            |
| **Apps**       | `api`                 |
| **Depende de** | — (infra transversal) |

---

## Qué hace

Expone un servicio interno en `api` para enviar emails transaccionales. El dominio habla con un **puerto** (interfaz); el **adaptador** inicial es Resend. Los cuerpos se maquetan con **React Email** y se renderizan a HTML antes del envío. Cambiar de proveedor implica un nuevo adaptador + config, sin tocar callers ni templates.

## Por qué

Hoy hay copy de emails en `@repo/i18n` (`staffInvitation`, `passwordReset`, `welcome`) pero no hay capa de envío. Sin un puerto único, cada feature (invitaciones, reset, welcome) acoplaría Resend o HTML a mano. Centralizar envío + templates permite reutilizar i18n, rotar vendor y mantener maquetación moderna (React Email) en un solo lugar. Alinea con [mission.md](../../constitution/mission.md) (onboarding de staff, cuentas confiables) y el patrón de infra de `015-files-module`.

## Alcance

### Incluye

- Puerto de envío (p. ej. `MailSender` / `EmailService`) con contrato estable: destinatario(s), subject, html/text, metadata mínima.
- Adaptador **Resend** + variables de entorno (`RESEND_API_KEY`, dirección `from`, etc.).
- Maquetación con **React Email** + `render` → HTML string; templates alineados a las claves existentes en namespace `emails`:
  - `staffInvitation`
  - `passwordReset`
  - `welcome`
- Errores tipados / mensajes vía i18n (español al usuario o log operativo según capa).
- Forma de verificación manual / humo (envío de prueba en dev) sin endpoint público de producto.

### No incluye

- UI en `web` / `dashboard` ni endpoints HTTP públicos tipo `POST /emails/send`.
- Cola, outbox persistente, reintentos con backoff, dead-letter.
- Marketing, newsletters, tracking de opens/clicks, unsubscribe real.
- Cablear flujos de dominio (crear invitación → enviar mail, registro → welcome, forgot-password → reset). Queda para las specs de esas features o una entrega posterior.
- Adaptadores de otros providers (Nodemailer, SES, …) — solo el puerto listo para agregarlos después.
- Dominio/DNS de producción en Resend (configuración de cuenta fuera del código; documentar requisitos).

---

## User stories

### US-1: Enviar email transaccional vía puerto

**Como** módulo de dominio (p. ej. invitaciones)  
**Quiero** pedir un envío al puerto de mail sin conocer Resend  
**Para** notificar al destinatario y poder cambiar de provider después

**Criterios de aceptación**

- [ ] **Dado** un adaptador Resend configurado, **Cuando** llamo `send` con destinatario, subject y html, **Entonces** el mensaje se entrega a Resend y el caller no importa el SDK de Resend.
- [ ] **Dado** que Resend falla (API key inválida o error de red), **Cuando** envío, **Entonces** recibo un error tipado sin filtrar secretos y el caller puede decidir log/reintento.

### US-2: Renderizar templates React Email

**Como** módulo de dominio  
**Quiero** obtener HTML de `staffInvitation`, `passwordReset` y `welcome` con copy i18n  
**Para** no maquetar tablas HTML a mano

**Criterios de aceptación**

- [ ] **Dado** props y locale, **Cuando** renderizo un template React Email, **Entonces** obtengo HTML (y texto plano si se define) listo para el puerto de envío.
- [ ] **Dado** locale `es`, **Cuando** renderizo, **Entonces** subject/body usan las claves del namespace `emails` en `@repo/i18n`.

### US-3: Verificación de humo en desarrollo

**Como** desarrollador  
**Quiero** un envío de prueba en dev  
**Para** validar Resend + template sin UI de producto

**Criterios de aceptación**

- [ ] **Dado** entorno de desarrollo con `RESEND_API_KEY` válida, **Cuando** ejecuto el humo, **Entonces** llega un mail de prueba al destinatario configurado.
- [ ] **Dado** que falta la API key (o está inválida), **Cuando** intento enviar, **Entonces** el fallo es explícito (mensaje claro, sin crash opaco ni leak de secretos).

---

## Contratos

### API

Sin controller HTTP. Uso interno desde otros servicios Nest (inyección del puerto / `MailModule`).

**Puerto de envío** (`MailSender` o equivalente)

```ts
send(input: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}): Promise<void> // o { id: string } del provider si se expone sin acoplar
```

- El adaptador Resend implementa el puerto.
- Los callers **no** importan el SDK de Resend.
- `replyTo`, `tags` y adjuntos: **fuera de v1**.

**Render (React Email)** — aparte del puerto

| Helper / template | Props mínimas (sketch)                                                      | i18n                       |
| ----------------- | --------------------------------------------------------------------------- | -------------------------- |
| `staffInvitation` | `inviterName`, `clubName`, `url`, `hours?`, nota de security word si aplica | `emails:staffInvitation.*` |
| `passwordReset`   | `url`, `minutes?`                                                           | `emails:passwordReset.*`   |
| `welcome`         | `name`, `ctaUrl`                                                            | `emails:welcome.*`         |

Cada helper: `render*(props, locale) → { subject, html, text? }` usando `@react-email/render` + namespace `emails`.

**Facade opcional:** un `MailService` de aplicación puede componer `render* + send` para callers; el **contrato estable para cambiar de vendor** es solo el puerto `send`.

**Errores (mensaje en español)**

| Código                | Cuándo                               | Mensaje                                                         |
| --------------------- | ------------------------------------ | --------------------------------------------------------------- |
| `mail.NOT_CONFIGURED` | Falta `RESEND_API_KEY` o `MAIL_FROM` | El servicio de correo no está configurado.                      |
| `mail.SEND_FAILED`    | Fallo de Resend / red                | No pudimos enviar el correo. Intentá de nuevo en unos minutos.  |
| `mail.RENDER_FAILED`  | Fallo al renderizar template         | No pudimos generar el correo. Intentá de nuevo en unos minutos. |

### Config / env (Zod)

| Variable         | Uso                                           |
| ---------------- | --------------------------------------------- |
| `RESEND_API_KEY` | Auth Resend                                   |
| `MAIL_FROM`      | Remitente (ej. `EventFlow <noreply@dominio>`) |
| `MAIL_SMOKE_TO`  | Destinatario del humo en dev (opcional)       |

Validación al estilo `uploadEnvSchema` / `ENV` en `apps/api`.

### Datos

Sin tablas ni migraciones. Sin outbox.

### UI

No aplica (`api` only). Sin rutas en `web` / `dashboard`.

---

## Reglas de negocio

- Solo el **adaptador** conoce Resend; dominio y templates no importan el SDK `resend`.
- `RESEND_API_KEY` (y secretos) **nunca** van a logs ni a mensajes de error expuestos al usuario.
- El locale del template lo pasa el caller (default `es`); no hay detección vía HTTP (no hay endpoint público).
- El envío de humo solo corre fuera de producción (o con flag explícito de dev) y requiere `MAIL_SMOKE_TO`.
- Un único `MAIL_FROM` global en v1 (sin remitente por template).
- Ante fallo de envío: error tipado (`mail.SEND_FAILED` / `NOT_CONFIGURED`); **sin** reintentos automáticos ni cola en esta feature.
- El HTML de producto sale de React Email vía helpers de render; `send` acepta html ya listo (p. ej. tests).

## Preguntas abiertas

- (cerrada) Cableado de dominio (invitación / welcome / reset): **fuera de `019`** — queda para `003` / auth u otra entrega.
-
