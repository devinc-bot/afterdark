# Plan de implementación — Formulario ticket (evento + venta)

> Complementa `spec.md`.

## Orden de capas

```text
1. @afterdark/validators   → eventId required; mensajes saleEndAfterStart
2. packages/i18n           → validation + tickets/es|en.json
3. apps/api                → sin cambio de rutas; Zod ya rechaza body inválido
4. apps/dashboard          → query eventos, TicketForm, mapper
```

## Archivos a modificar

### Validators

| Archivo                             | Cambio                                                         |
| ----------------------------------- | -------------------------------------------------------------- |
| `packages/validators/src/ticket.ts` | `eventId` required; renombrar clave refine `saleEndAfterStart` |

### i18n

| Archivo                                        | Cambio                                     |
| ---------------------------------------------- | ------------------------------------------ |
| `packages/i18n/src/locales/validation/es.json` | `ticket.event`, `ticket.saleEndAfterStart` |
| `packages/i18n/src/locales/validation/en.json` | Idem EN                                    |
| `packages/i18n/src/locales/tickets/es.json`    | Labels evento, venta, descripción diálogo  |
| `packages/i18n/src/locales/tickets/en.json`    | Idem EN                                    |

### Dashboard

| Archivo                                                                     | Cambio                                           |
| --------------------------------------------------------------------------- | ------------------------------------------------ |
| `app/modules/tickets/queries/use-ticket-queries.ts` o `use-owner-events.ts` | `useOwnerEvents()` → `GET /api/events/my-events` |
| `app/modules/tickets/components/ticket-form.tsx`                            | Select evento; copy fechas venta                 |
| `app/modules/tickets/utils/ticket-form.mapper.ts`                           | Sin cambio funcional mayor                       |
| `app/modules/common/constants/query-keys.ts`                                | Opcional: key `ownerEvents` si query dedicada    |

### API

| Archivo | Cambio                                                                        |
| ------- | ----------------------------------------------------------------------------- |
| —       | Ninguno obligatorio si validators ya exigen `eventId`; verificar mensajes 400 |

## Patrones a copiar

| Referencia                                | Uso                                      |
| ----------------------------------------- | ---------------------------------------- |
| `EventForm` / `StaffUserForm` club select | Select eventos con loading/error/empty   |
| `026-event-create-edit-page` (ex-`011`)   | `fetchEvents`, `EventResponse`           |
| Refine fechas en `ticket.ts` actual       | Mantener lógica; solo actualizar mensaje |

## Verificación

```bash
pnpm type-check
pnpm lint
# Manual: crear ticket con evento, sin fechas venta
# Manual: crear con rango venta válido e inválido
# Manual: editar ticket y cambiar evento
```
