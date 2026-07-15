# Plan de implementación — Servicio de envío de emails

> Cómo se implementa esta feature. Complementa `spec.md`; no repetir criterios de aceptación.  
> Borrador **fase 6** — revisar y corregir antes de implementar.

## Orden de capas

```text
1. @afterdark/validators  → mailEnvSchema
2. @afterdark/i18n        → MAIL_ERROR_CODE + claves errors (es/en)
3. @afterdark/types       → tipos del puerto / SendMailInput (opcional; puede vivir en api si no se exporta)
4. apps/api mail module   → puerto + ResendAdapter + templates React Email + MailService
5. app.module.ts          → import MailModule
6. Humo                   → script/comando dev (sin HTTP de producto)
```

Sin DB. Sin client `web`/`dashboard`.

## Archivos a crear / modificar

### Validators

| Archivo                            | Cambio                                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/validators/src/mail.ts`  | `mailEnvSchema`: `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_SMOKE_TO` (opcionales / vacíos permitidos al boot; el servicio valida al enviar) |
| `packages/validators/src/index.ts` | Re-export                                                                                                                              |

### i18n

| Archivo                                      | Cambio                                                              |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `packages/i18n/src/constants/error-codes.ts` | `MAIL_ERROR_CODE`: `NOT_CONFIGURED`, `SEND_FAILED`, `RENDER_FAILED` |
| `packages/i18n/src/locales/errors/es.json`   | Mensajes `mail.*` (copy de la spec)                                 |
| `packages/i18n/src/locales/errors/en.json`   | Paridad                                                             |

Namespace `emails` (templates) **ya existe** — reutilizar; no duplicar subjects/bodies.

### Types (opcional)

| Archivo                                      | Cambio                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `packages/types/src/dto/mail.ts` (o similar) | `SendMailInput`, `RenderedMail` si se quiere contrato compartido; si no, tipos locales en el módulo api |

### API — módulo `mail`

| Archivo                                                          | Cambio                                                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `apps/api/src/modules/mail/mail.tokens.ts`                       | Token DI `MAIL_SENDER`                                                                       |
| `apps/api/src/modules/mail/mail-sender.port.ts`                  | Interfaz `MailSender` (`send`)                                                               |
| `apps/api/src/modules/mail/adapters/resend.mail-sender.ts`       | Adaptador Resend                                                                             |
| `apps/api/src/modules/mail/mail.service.ts`                      | Facade: config check + `send`; opcional `sendRendered`                                       |
| `apps/api/src/modules/mail/mail.module.ts`                       | Provider: bind `MAIL_SENDER` → `ResendMailSender`; export `MailService`                      |
| `apps/api/src/modules/mail/templates/*.tsx`                      | React Email: `staff-invitation`, `password-reset`, `welcome` + layout común                  |
| `apps/api/src/modules/mail/render/*.ts`                          | `renderStaffInvitation`, `renderPasswordReset`, `renderWelcome` → `{ subject, html, text? }` |
| `apps/api/src/modules/mail/constants/mail-error.ts`              | Mapeo a `MAIL_ERROR_CODE` / throw tipado                                                     |
| `apps/api/src/modules/mail/scripts/smoke-mail.ts` (o npm script) | Humo: render welcome + send a `MAIL_SMOKE_TO`                                                |
| `apps/api/src/modules/common/config/env.ts`                      | `.extend(mailEnvSchema.shape)`                                                               |
| `apps/api/src/app.module.ts`                                     | `MailModule`                                                                                 |
| `apps/api/package.json`                                          | deps: `resend`, `react-email`, `react`, `react-dom`; script `mail:smoke`                     |
| Root `.env.example` (si existe)                                  | Documentar `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_SMOKE_TO`                                    |

### Client

No aplica.

## Diseño técnico

### Puerto / adaptador

```text
Caller (futuro: InvitationsService, AuthService, …)
    → MailService.send / render* + send
        → MailSender (token MAIL_SENDER)
            → ResendMailSender  ← único lugar que importa `resend`
```

Cambiar de vendor: nuevo `*MailSender` + rebind en `MailModule`. Templates y callers intactos.

### React Email

- Componentes en `templates/` con props tipadas.
- Copy vía `translateSync` / i18n server del namespace `emails` (mismo patrón que el resto de la API).
- `render` de `@react-email/render` → HTML; `text` opcional (plain derivado o template paralelo mínimo).

### Env

- Al **boot**: keys opcionales (API arranca sin Resend).
- Al **send**: si falta `RESEND_API_KEY` o `MAIL_FROM` → `mail.NOT_CONFIGURED`.
- Humo: solo si `ENV.isDevelopment` (o `NODE_ENV !== production`) **y** `MAIL_SMOKE_TO` definido.

### Errores

- Adaptador captura fallos de Resend → `mail.SEND_FAILED` (sin loguear API key).
- Fallo de `render` → `mail.RENDER_FAILED`.

### Package compartido

**v1:** todo en `apps/api/src/modules/mail/` (como `files`).  
Un `@afterdark/emails` solo si más adelante hace falta preview CLI / consumo fuera de Nest — fuera de esta entrega.

## Riesgos / edge cases

| Caso                            | Comportamiento esperado                                                   |
| ------------------------------- | ------------------------------------------------------------------------- |
| API key ausente                 | `NOT_CONFIGURED`; API sigue viva                                          |
| Resend 4xx/5xx                  | `SEND_FAILED`; sin reintento                                              |
| Template props incompletas      | Fallo de render tipado / TypeScript en compile; runtime → `RENDER_FAILED` |
| `MAIL_SMOKE_TO` en prod         | Script de humo no corre (guard de entorno)                                |
| Dominio no verificado en Resend | Falla en send → `SEND_FAILED` (ops: verificar dominio fuera del código)   |

## Verificación manual

| Paso                                                                   | Resultado esperado                                      |
| ---------------------------------------------------------------------- | ------------------------------------------------------- |
| 1. Configurar `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_SMOKE_TO` en `.env` | Boot OK                                                 |
| 2. Ejecutar script de humo                                             | Mail de prueba (p. ej. welcome) llega a `MAIL_SMOKE_TO` |
| 3. Quitar `RESEND_API_KEY` y llamar send / humo                        | Error `mail.NOT_CONFIGURED` claro                       |
| 4. `pnpm type-check` + `pnpm check:i18n`                               | Verde                                                   |
| 5. Grep: ningún módulo de dominio importa `resend`                     | Solo el adaptador                                       |
