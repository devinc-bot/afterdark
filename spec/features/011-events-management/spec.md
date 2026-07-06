# Gestión de eventos (dashboard)

> Requisitos provistos por el dueño del producto. Estado por fase en `progress.md`.

| Campo          | Valor                                                |
| -------------- | ---------------------------------------------------- |
| **ID**         | `011-events-management`                              |
| **Status**     | `approved`                                           |
| **Apps**       | `api`, `dashboard`                                   |
| **Depende de** | `002-club-management` (selector de club y ownership) |

---

## Qué hace

El dueño de clubes gestiona **eventos** desde el dashboard en `/events`:

1. **Listado paginado** de eventos de sus clubes, en tabla con el mismo estilo visual que entradas (`TicketRecords`: `Card` + `Table` + `Pagination` de `@afterdark/ui`).
2. **Creación** mediante un **diálogo modal** con los campos obligatorios del evento, validados en cliente y servidor.

Cada evento pertenece a un club (`events.clubId`). El esquema Drizzle ya existe en `packages/db/src/schema/event.ts`; esta feature conecta API, validadores y UI.

## Por qué

Los tickets ahora referencian `eventId` en lugar de fechas propias del club. Sin eventos no hay contexto temporal ni agrupación para vender entradas. El dueño necesita crear y ver sus eventos antes de asociar tickets.

## Alcance

### Incluye

- Endpoint `GET /api/events/my-events` con paginación (`page`, `limit`) y respuesta `PaginatedResponse<EventResponse>`.
- Endpoint `POST /api/events` para crear evento del dueño autenticado.
- Schemas Zod en `@afterdark/validators` (`createEventSchema`, `listEventsQuerySchema`).
- Tipos `EventResponse` en `@afterdark/types`.
- Repository: `createEvent`, `findEventsByOwnerDocumentId` (paginado, join con `clubs` para nombre del club).
- Módulo NestJS `events` en `apps/api`.
- Ruta dashboard `/_app/events` con:
  - `EventsManagementView` + `PageLayout`.
  - `EventCreateDialog` + `EventForm` (campos del diálogo).
  - `EventRecords` (tabla + barra de paginación, patrón `ticket-record.tsx`).
- i18n namespace `events` (`es.json` / `en.json`).
- Entrada en sidebar: _Eventos_ → `/events`.
- Constantes `DASHBOARD_ROUTES.events()` y `API_ROUTES.events`.

### No incluye

- Editar o eliminar eventos (entrega futura).
- Campo `location` en el formulario (existe opcional en DB; fuera de v1).
- Filtros por estado o club en el listado (solo paginación en v1).
- Tabs Activos/Inactivos como en tickets.
- KPIs o métricas de ventas por evento.
- Catálogo público (`web`) ni publicación automática en `007-web-catalog`.
- Asociar tickets a eventos desde el formulario de tickets (feature `006-tickets`).

---

## User stories

### US-1: Crear evento en diálogo

**Como** dueño de clubes  
**Quiero** registrar un evento desde un diálogo  
**Para** definir nombre, descripción, fechas y estado antes de vender entradas

**Criterios de aceptación**

- [ ] **Dado** que estoy en `/events`, **Cuando** pulso el CTA de crear, **Entonces** se abre un `Dialog` con el formulario (mismo patrón que `TicketCreateDialog`).
- [ ] **Dado** el diálogo abierto, **Cuando** lo veo, **Entonces** muestra: club, nombre, descripción, inicio, fin y estado.
- [ ] **Dado** el formulario válido, **Cuando** envío, **Entonces** se llama `POST /api/events`, muestro toast de éxito, cierro el diálogo e invalido el listado.
- [ ] **Dado** error de API, **Cuando** falla el envío, **Entonces** permanezco en el diálogo con toast de error en español.

### US-2: Validación de campos obligatorios

**Como** dueño  
**Quiero** que el sistema valide los datos del evento  
**Para** no guardar eventos incompletos o con fechas incoherentes

**Criterios de aceptación**

- [ ] **Dado** un formulario sin club, **Cuando** envío, **Entonces** veo error _Seleccioná un club._ (o equivalente i18n).
- [ ] **Dado** nombre o descripción vacíos, **Cuando** envío, **Entonces** veo errores de campo requerido.
- [ ] **Dado** inicio o fin vacíos, **Cuando** envío, **Entonces** veo errores de campo requerido.
- [ ] **Dado** `startsAt` posterior o igual a `endsAt`, **Cuando** envío, **Entonces** veo error _La fecha y hora de inicio debe ser anterior a la de finalización._
- [ ] **Dado** `endsAt` anterior o igual a `startsAt`, **Cuando** envío, **Entonces** veo el mismo error de rango de fechas.
- [ ] **Dado** creación exitosa sin elegir estado, **Cuando** se persiste, **Entonces** el estado guardado es `EVENT_STATUS.PUBLISHED` (`published`).

### US-3: Listar eventos paginados

**Como** dueño  
**Quiero** ver mis eventos en una tabla paginada  
**Para** revisar qué tengo programado en cada club

**Criterios de aceptación**

- [ ] **Dado** que tengo eventos en mis clubes, **Cuando** entro a `/events`, **Entonces** veo filas con club, nombre, inicio, fin y estado desde `GET /api/events/my-events`.
- [ ] **Dado** más de 10 eventos (tamaño de página por defecto), **Cuando** navego páginas, **Entonces** la tabla actualiza y la barra de paginación refleja `page` / `totalPages` (mismo componente y estilos que `TicketRecordsPaginationBar`).
- [ ] **Dado** que no tengo eventos, **Cuando** cargo la página, **Entonces** veo estado vacío dedicado (sin tabla).
- [ ] **Dado** error de red o API, **Cuando** falla la carga, **Entonces** veo mensaje recuperable en español.

### US-4: Solo eventos de mis clubes

**Como** dueño  
**Quiero** ver y crear eventos únicamente en clubes que me pertenecen  
**Para** que otro dueño no acceda a mis datos

**Criterios de aceptación**

- [ ] **Dado** un `clubId` que no es mío, **Cuando** intento crear vía API, **Entonces** recibo `404` con mensaje _No encontramos el club solicitado._
- [ ] **Dado** el listado, **Cuando** consulto `my-events`, **Entonces** solo aparecen eventos cuyo `clubId` pertenece al dueño autenticado.

---

## Contratos

### API

| Método | Ruta                    | Auth      | Descripción                       |
| ------ | ----------------------- | --------- | --------------------------------- |
| `GET`  | `/api/events/my-events` | Owner JWT | Listado paginado del dueño        |
| `POST` | `/api/events`           | Owner JWT | Crear evento en un club del dueño |

**Query `GET /api/events/my-events`** — `listEventsQuerySchema`:

| Campo   | Tipo   | Default | Notas                      |
| ------- | ------ | ------- | -------------------------- |
| `page`  | number | `1`     | Desde `paginationSchema`   |
| `limit` | number | `10`    | Máx. coherente con tickets |

**Response** — `PaginatedResponse<EventResponse>`:

```ts
interface EventResponse {
  documentId: string
  clubId: string // documentId del club
  clubName: string
  name: string
  description: string
  startsAt: string // ISO 8601
  endsAt: string // ISO 8601
  status: EventStatus // 'draft' | 'published' | 'finished'
  createdAt: string
  updatedAt: string
}
```

**Request `POST /api/events`** — `createEventSchema` (JSON):

| Campo         | Tipo          | Requerido | Default / notas                                |
| ------------- | ------------- | --------- | ---------------------------------------------- |
| `clubId`      | UUID          | Sí        | `documentId` del club                          |
| `name`        | string        | Sí        | Trim, min 1                                    |
| `description` | string        | Sí        | Trim, min 1                                    |
| `startsAt`    | string        | Sí        | ISO datetime (mismo criterio que tickets)      |
| `endsAt`      | string        | Sí        | ISO datetime                                   |
| `status`      | `EventStatus` | No        | Default `EVENT_STATUS.PUBLISHED` en schema Zod |

**Validación Zod** (`packages/validators/src/event.ts`):

```ts
import { EVENT_STATUS } from '@afterdark/types'

const eventStatusSchema = z.enum([
  EVENT_STATUS.DRAFT,
  EVENT_STATUS.PUBLISHED,
  EVENT_STATUS.FINISHED,
])

export const createEventSchema = z
  .object({
    clubId: uuidSchema,
    name: z.string().trim().min(1, { message: 'VALIDATION_EVENT_NAME_REQUIRED' }),
    description: z.string().trim().min(1, { message: 'VALIDATION_EVENT_DESCRIPTION_REQUIRED' }),
    startsAt: z.string().min(1, { message: 'VALIDATION_EVENT_STARTS_AT_REQUIRED' }),
    endsAt: z.string().min(1, { message: 'VALIDATION_EVENT_ENDS_AT_REQUIRED' }),
    status: eventStatusSchema.default(EVENT_STATUS.PUBLISHED),
  })
  .refine((data) => new Date(data.startsAt).getTime() < new Date(data.endsAt).getTime(), {
    message: 'VALIDATION_EVENT_START_BEFORE_END',
    path: ['endsAt'],
  })
```

**Errores (mensaje al usuario en español)**

| HTTP | Código / cuándo                            | Mensaje                                                           |
| ---- | ------------------------------------------ | ----------------------------------------------------------------- |
| 400  | Validación Zod / fechas incoherentes       | Mensajes i18n por campo o _Revisá los datos del evento._          |
| 401  | Sin sesión                                 | Redirigir a login                                                 |
| 404  | Club no encontrado o no pertenece al dueño | _No encontramos el club solicitado._                              |
| 500  | Error interno                              | _No pudimos guardar el evento. Intentá de nuevo en unos minutos._ |

### Datos

| Tabla / campo | Cambio en esta feature                                     |
| ------------- | ---------------------------------------------------------- |
| `events`      | Sin migración nueva — tabla ya definida en schema          |
| `status`      | Enum DB: `draft`, `published`, `finished` (ver `event.ts`) |

Referencia de enum en schema:

```16:20:packages/db/src/schema/event.ts
  status: text('status', {
    enum: [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED, EVENT_STATUS.FINISHED],
  })
    .notNull()
    .default(EVENT_STATUS.DRAFT),
```

> **Nota de producto:** el default de **formulario y API** es `published`. El default de columna en DB sigue siendo `draft` hasta una migración opcional; el servicio siempre envía `status` explícito desde el cliente.

### UI (`dashboard`)

| Ruta           | Pantalla                                     |
| -------------- | -------------------------------------------- |
| `/_app/events` | Listado paginado + botón abrir diálogo crear |

**Diálogo crear** — patrón `TicketCreateDialog`:

```text
┌─────────────────────────────────────────────┐
│ Crear evento                                │
│ Completá los datos del evento.              │
├─────────────────────────────────────────────┤
│ Club *              [ Select clubes míos ]  │
│ Nombre *            [ ___________________ ] │
│ Descripción *       [ ___________________ ] │
│                     [ ___________________ ] │
│ Inicio *            [ DateTimeInput       ] │
│ Finalización *      [ DateTimeInput       ] │
│ Estado              [ Publicado ▼ ]         │  ← default Publicado
├─────────────────────────────────────────────┤
│                    Cancelar  |  Crear evento│
└─────────────────────────────────────────────┘
```

**Campos del formulario**

| Campo UI               | `name` en form | Componente                        | Notas                                    |
| ---------------------- | -------------- | --------------------------------- | ---------------------------------------- |
| Club                   | `clubId`       | `SelectField`                     | Opciones desde `GET /api/clubs/my-clubs` |
| Nombre del evento      | `name`         | `Input`                           | `maxLength` razonable (p. ej. 120)       |
| Descripción            | `description`  | `Textarea`                        |                                          |
| Fecha y hora de inicio | `startsAt`     | `DateTimeInput` (`@afterdark/ui`) | Valor `datetime-local` → ISO en submit   |
| Fecha y hora de fin    | `endsAt`       | `DateTimeInput`                   |                                          |
| Estado del evento      | `status`       | `SelectField`                     | Valores del enum `EVENT_STATUS`          |

**Opciones de estado (copy español)**

| Valor `EventStatus` | Label UI   |
| ------------------- | ---------- |
| `draft`             | Borrador   |
| `published`         | Publicado  |
| `finished`          | Finalizado |

**Tabla de listado** — replicar estructura de `TicketRecords`:

| Columna  | Contenido                                                |
| -------- | -------------------------------------------------------- |
| Club     | Celda identidad (`ClubIdentityCell`: iniciales + nombre) |
| Evento   | `name` (texto semibold)                                  |
| Inicio   | Fecha/hora formateada `es-AR`                            |
| Fin      | Fecha/hora formateada `es-AR`                            |
| Estado   | `Badge` con tono según status                            |
| Acciones | Vacío en v1 o solo menú deshabilitado “Próximamente”     |

**Paginación**

- `EVENTS_PAGE_SIZE = 10` (igual que `TICKETS_PAGE_SIZE`).
- Componentes: `Pagination`, `PaginationContent`, `PaginationPrevious`, `PaginationNext`, `getPaginationItems`, `PaginationEllipsis` desde `@afterdark/ui`.
- Contenedor: `border-t border-hairline px-4 py-4 sm:px-6` (mismo que tickets).
- Ocultar barra si `totalPages <= 1`.

**Copy (español)**

| Contexto             | Texto                                                                |
| -------------------- | -------------------------------------------------------------------- |
| Título página        | `Gestión de eventos`                                                 |
| Descripción página   | `Creá y consultá los eventos de tus clubes.`                         |
| CTA crear            | `Crear evento`                                                       |
| Título diálogo       | `Crear evento`                                                       |
| Descripción diálogo  | `Completá los datos del evento.`                                     |
| CTA enviar           | `Crear evento` / pendiente `Creando…`                                |
| Cancelar             | `Cancelar`                                                           |
| Toast éxito          | `Evento creado correctamente`                                        |
| Vacío                | `No hay eventos registrados` / `Creá tu primer evento para empezar.` |
| Error listado        | `No pudimos cargar los eventos. Intentá de nuevo en unos minutos.`   |
| Paginación anterior  | `Anterior`                                                           |
| Paginación siguiente | `Siguiente`                                                          |

**Componentes (dashboard)**

| Componente                   | Responsabilidad                              |
| ---------------------------- | -------------------------------------------- |
| `events-management-view.tsx` | Orquestación: query, página, diálogo, layout |
| `dialog-create-event.tsx`    | Botón + `Dialog` (como `TicketCreateDialog`) |
| `event-form.tsx`             | `@tanstack/react-form` + validación Zod      |
| `event-record.tsx`           | Tabla, filas, paginación, estado vacío       |
| `events.service.ts`          | Llamadas HTTP                                |
| `use-event-queries.ts`       | `useEvents({ page, limit })`                 |
| `use-event-mutations.ts`     | `useCreateEvent`                             |

---

## Reglas de negocio

- Solo dueños autenticados (`OwnerGuard`) acceden a rutas y endpoints de eventos.
- Un evento siempre pertenece a exactamente un club (`clubId` NOT NULL).
- El dueño solo puede crear eventos en clubes devueltos por `my-clubs`.
- `startsAt` debe ser estrictamente anterior a `endsAt` (comparación en timestamps).
- Estado permitido: valores de `EVENT_STATUS` en `@afterdark/types` / enum Drizzle en `event.ts`.
- Estado por defecto al crear desde UI: **`published`** (`EVENT_STATUS.PUBLISHED`).
- Listado ordenado por `startsAt` descendente (más recientes primero), salvo decisión contraria en implementación documentada en `plan.md`.
- Tras crear con éxito: invalidar query `['events', params]` y resetear formulario al cerrar diálogo.

## Preguntas abiertas

- Ninguna bloqueante. Edición/eliminación y filtro por estado quedan para una feature `011b` o ampliación de esta carpeta.
