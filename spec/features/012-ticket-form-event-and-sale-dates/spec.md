# Formulario de ticket — evento requerido y ventana de venta

> Requisitos provistos por el dueño del producto. Estado por fase en `progress.md`.

| Campo          | Valor                                                         |
| -------------- | ------------------------------------------------------------- |
| **ID**         | `012-ticket-form-event-and-sale-dates`                        |
| **Status**     | `approved`                                                    |
| **Apps**       | `api`, `dashboard`                                            |
| **Depende de** | `026-event-create-edit-page` (eventos del dueño en API; reemplaza `011`) |

---

## Qué hace

Actualiza el **diálogo de crear/editar ticket** en `/tickets` para alinear el formulario con el modelo `tickets → events`:

1. **Campo Evento** (`SelectField`): lista todos los eventos del dueño; **obligatorio** al crear y editar.
2. **Fechas de venta** (opcionales): renombrar y clarificar los campos existentes `saleStartsAt` / `saleEndsAt` como ventana de venta del ticket, no fechas del evento.
3. **Validación**: si el usuario completa ambas fechas de venta, `inicio de venta` debe ser **estrictamente anterior** a `fin de venta`.

El club del ticket se **deriva del evento** elegido (ya resuelto en API vía `eventId` → `events.clubId`); no se agrega selector de club en el formulario.

## Por qué

Tras la gestión de eventos (`026`, ex-`011`), cada ticket debe pertenecer a un evento concreto. Las fechas en el formulario hoy se etiquetan como “inicio/fin del evento” pero en DB son `sale_starts_at` / `sale_ends_at` — ventana opcional de venta de entradas, no la duración del evento.

## Alcance

### Incluye

- Campo **Evento** en `TicketForm` (create y edit), cargado desde `GET /api/events/my-events`.
- Validadores: `eventId` **requerido** en `createTicketSchema`, `updateTicketSchema` y `ticketFormSchema`.
- Fechas de venta **opcionales**; refine existente solo cuando ambas tienen valor.
- Copy i18n en español: labels, placeholders, errores de validación y descripción del diálogo.
- API: rechazar create/update sin `eventId` (400); mantener verificación de ownership (`ticket.EVENT_NOT_FOUND` / `event.NOT_FOUND`).
- Hook `useOwnerEvents` (o reutilizar query de eventos) para el select; patrón `useClubs` en `staff-user-form.tsx`.
- Edición: precargar `eventId` desde `TicketResponse`.

### No incluye

- Migración DB para `event_id NOT NULL` (columna sigue nullable por tickets legacy; la regla es de producto en API/formulario).
- Filtrar eventos por estado en el select (v1: **todos** los eventos del dueño).
- Endpoint nuevo solo para opciones del select (reutilizar `my-events`).
- Cambios en tabla de listado de tickets (columnas, KPIs).
- Validar que la ventana de venta caiga dentro de `startsAt`/`endsAt` del evento (futuro).
- Catálogo público ni checkout.

---

## User stories

### US-1: Elegir evento al crear ticket

**Como** dueño  
**Quiero** seleccionar el evento al que pertenece el ticket  
**Para** vender entradas en el contexto correcto (club + fechas del evento)

**Criterios de aceptación**

- [ ] **Dado** el diálogo _Crear ticket_, **Cuando** lo abro, **Entonces** veo un select **Evento** antes o junto a los datos principales.
- [ ] **Dado** que tengo eventos registrados, **Cuando** abro el select, **Entonces** veo todos mis eventos (nombre + club recomendado en la etiqueta, p. ej. `Noche electrónica — Neon Vault`).
- [ ] **Dado** el formulario sin evento, **Cuando** envío, **Entonces** veo error _Seleccioná un evento._ y no se llama a la API.
- [ ] **Dado** un evento válido y el resto de campos OK, **Cuando** creo, **Entonces** `POST /api/tickets/create` envía `eventId` (UUID) y el ticket queda asociado al evento.

### US-2: Fechas de venta opcionales

**Como** dueño  
**Quiero** definir opcionalmente cuándo empieza y termina la venta del ticket  
**Para** programar la disponibilidad sin obligarme a poner fechas siempre

**Criterios de aceptación**

- [ ] **Dado** el formulario, **Cuando** lo veo, **Entonces** los campos se llaman _Fecha de inicio de venta_ y _Fecha de fin de venta_ (no “inicio/fin del evento”).
- [ ] **Dado** que dejo ambas fechas vacías, **Cuando** envío con evento y demás campos válidos, **Entonces** el ticket se crea/actualiza con `saleStartsAt` y `saleEndsAt` en `null`.
- [ ] **Dado** solo una de las dos fechas completada, **Cuando** envío, **Entonces** se persiste solo la fecha informada (la otra `null`) — sin exigir la pareja.
- [ ] **Dado** ambas fechas con valor y inicio ≥ fin, **Cuando** envío, **Entonces** veo error _La fecha de fin de venta debe ser posterior al inicio de venta._

### US-3: Editar ticket con evento

**Como** dueño  
**Quiero** cambiar el evento y las fechas de venta al editar  
**Para** corregir datos sin recrear el ticket

**Criterios de aceptación**

- [ ] **Dado** un ticket existente con `eventId`, **Cuando** abro editar, **Entonces** el select Evento muestra el evento actual preseleccionado.
- [ ] **Dado** cambios válidos, **Cuando** guardo, **Entonces** `PATCH /api/tickets/:documentId` actualiza `eventId` y fechas de venta.
- [ ] **Dado** que quito el evento en UI, **Cuando** envío, **Entonces** validación impide guardar (evento requerido).

### US-4: Sin eventos disponibles

**Como** dueño sin eventos  
**Quiero** un mensaje claro en el formulario  
**Para** saber que debo crear un evento primero

**Criterios de aceptación**

- [ ] **Dado** cero eventos en `my-events`, **Cuando** abro crear ticket, **Entonces** el select está deshabilitado con placeholder _No tenés eventos registrados_ (o equivalente i18n).
- [ ] **Dado** cero eventos, **Cuando** intento enviar, **Entonces** no puedo completar el flujo sin evento (validación + CTA deshabilitado opcional).

---

## Contratos

### API

Sin rutas nuevas. Ajuste de contrato en body existente:

| Método  | Ruta                       | Cambio                         |
| ------- | -------------------------- | ------------------------------ |
| `POST`  | `/api/tickets/create`      | `eventId` **requerido** (UUID) |
| `PATCH` | `/api/tickets/:documentId` | `eventId` **requerido** (UUID) |

**Body** (`createTicketSchema` / `updateTicketSchema`):

| Campo          | Tipo     | Requerido | Notas                                                         |
| -------------- | -------- | --------- | ------------------------------------------------------------- |
| `eventId`      | UUID     | **Sí**    | Debe pertenecer al dueño (`findEventOwnedByOwnerDocumentId`)  |
| `saleStartsAt` | datetime | No        | ISO / coerce date; omitir o `null` si vacío                   |
| `saleEndsAt`   | datetime | No        | Idem                                                          |
| …              | …        | …         | Sin cambios: name, type, price, quantity, description, status |

**Refine fechas de venta** (solo si **ambas** presentes):

```ts
saleEndsAt > saleStartsAt
// mensaje: validation:field.ticket.saleEndAfterStart
```

**Errores**

| HTTP | Cuándo                        | Mensaje (español)                                                 |
| ---- | ----------------------------- | ----------------------------------------------------------------- |
| 400  | Sin `eventId` o UUID inválido | Validación Zod / _Seleccioná un evento._                          |
| 400  | Rango de venta inválido       | _La fecha de fin de venta debe ser posterior al inicio de venta._ |
| 404  | `eventId` no del dueño        | _Evento no encontrado._ (`ticket.EVENT_NOT_FOUND`)                |

### Datos

| Tabla / campo            | Cambio en esta feature                          |
| ------------------------ | ----------------------------------------------- |
| `tickets.event_id`       | Sin migración; validación obligatoria en API/UI |
| `tickets.sale_starts_at` | Sin cambio de esquema; ya opcional              |
| `tickets.sale_ends_at`   | Sin cambio de esquema; ya opcional              |

### UI (`dashboard`)

**Archivos principales**

| Archivo                         | Cambio                                     |
| ------------------------------- | ------------------------------------------ |
| `ticket-form.tsx`               | Select evento; labels fechas de venta      |
| `ticket-form.mapper.ts`         | `eventId` requerido en valores por defecto |
| `use-ticket-queries.ts` o nuevo | Query eventos para select                  |
| `packages/validators/ticket.ts` | `eventId` required; mensajes venta         |

**Orden sugerido de campos en el diálogo**

```text
┌─────────────────────────────────────────────┐
│ Crear ticket                                │
├─────────────────────────────────────────────┤
│ Evento *              [ Select eventos    ] │
│ Nombre *              [ _________________ ] │
│ Tipo / Estado         [ General ▼ ] [ Activo ▼ ] │
│ Precio / Cantidad     [ _____ ] [ _____ ]   │
│ Inicio venta          [ DateTimeInput     ] │  ← opcional
│ Fin venta             [ DateTimeInput     ] │  ← opcional
│ Descripción *         [ _________________ ] │
├─────────────────────────────────────────────┤
│                    Cancelar  |  Crear ticket │
└─────────────────────────────────────────────┘
```

**Select de eventos**

- Fuente: `GET /api/events/my-events?page=1&limit=100` (si `total > 100`, cargar páginas adicionales en el hook o subir `limit` acordado en implementación).
- `SelectItem` value = `event.documentId`.
- Label sugerido: `{event.name} — {event.clubName}`.
- Estados de carga/error/vacío: mismo patrón que club en `StaffUserForm` / `EventForm`.

**Copy (español)**

| Contexto               | Texto                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| Campo evento           | `Evento`                                                          |
| Placeholder evento     | `Seleccioná un evento`                                            |
| Cargando eventos       | `Cargando eventos…`                                               |
| Sin eventos            | `No tenés eventos registrados`                                    |
| Error carga eventos    | `No pudimos cargar tus eventos.`                                  |
| Inicio venta           | `Fecha de inicio de venta`                                        |
| Fin venta              | `Fecha de fin de venta`                                           |
| Descripción crear      | `Definí el tipo de entrada, precio y stock para un evento.`       |
| Error evento requerido | `Seleccioná un evento.`                                           |
| Error rango venta      | `La fecha de fin de venta debe ser posterior al inicio de venta.` |

**Validación (`packages/validators/src/ticket.ts`)**

```ts
// Reemplazar optionalEventIdSchema por:
eventId: uuidSchema // API
eventId: z.string().min(1, 'validation:field.ticket.event') // form

// Mantener saleStartsAt / saleEndsAt opcionales
// Actualizar mensaje refine a validation:field.ticket.saleEndAfterStart
```

**i18n validation (`validation/es.json`)**

```json
"ticket": {
  "event": "Seleccioná un evento.",
  "saleEndAfterStart": "La fecha de fin de venta debe ser posterior al inicio de venta."
}
```

Eliminar o dejar de usar en ticket los mensajes `startDate` / `endDate` como “requeridos” (las fechas de venta ya no son obligatorias).

---

## Reglas de negocio

- Todo ticket nuevo o editado debe tener `eventId` de un evento del dueño autenticado.
- El club mostrado en listado de tickets sigue derivándose del evento (`tickets → events → clubs`).
- `saleStartsAt` y `saleEndsAt` son independientes de `events.startsAt` / `events.endsAt` en v1.
- Si solo una fecha de venta está presente, se guarda sin exigir la otra.
- Si ambas fechas de venta están presentes, `saleStartsAt < saleEndsAt` (comparación en timestamps).
- Tickets legacy sin `eventId` en DB pueden seguir existiendo; al editarlos, el dueño debe elegir un evento antes de guardar.

## Preguntas abiertas

- Ninguna bloqueante para implementar.
