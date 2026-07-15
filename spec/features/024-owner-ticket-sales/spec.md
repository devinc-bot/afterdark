# Ventas de tickets (historial del dueño)

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor                    |
| ---------- | ------------------------ |
| **ID**     | `024-owner-ticket-sales` |
| **Status** | `approved`               |
| **Apps**   | `api` · `dashboard`      |

**Ruta UI:** `/sales` · Sidebar: **Ventas** (solo dueño)  
**Dependencias:** `006-tickets`, tablas `orders` / `tickets_sold`

---

## Qué hace

El dueño abre **Ventas** en el dashboard y ve un historial paginado de compras completadas de sus clubes: comprador, evento, ticket, club, fecha de pago, cantidad, monto y estado.

## Por qué

En panel e inventario solo ve agregados. Necesita el detalle de cada venta para revisar ingresos y operar el día a día.

## Alcance

### Incluye

- Ítem de sidebar **Ventas** visible solo para rol `owner`
- Pantalla en `/sales` con listado paginado
- Una **fila por orden** (`orders`) con pago `COMPLETED`
- Columnas: comprador (nombre **y** email), evento, ticket, tipo, club, fecha de pago (`paidAt`), cantidad, monto, estado
- Filtros opcionales sobre ventas `COMPLETED`: **Evento**, **Club**, **Tipo de ticket** (`general` / `vip`), **Desde / Hasta** (`paidAt`)
- Endpoint `GET /api/dashboard/sales` acotado a los clubes del dueño autenticado

### No incluye

- App `web` / vista del cliente
- Export CSV / PDF
- Reembolsos o anulación de ventas
- Detalle de QR / check-in (panel staff)
- Órdenes `PENDING`, `REJECTED` o `CANCELLED` (solo completadas)
- Fila por unidad (`tickets_sold`) — queda fuera; una fila = una orden
- Filtro por ticket concreto (`ticketId`); solo por **tipo** enum

---

## User stories

### US-1: Ver listado de ventas

**Como** dueño  
**Quiero** ver mis ventas completadas en `/sales`  
**Para** revisar las compras recientes de mis clubes

**Criterios de aceptación**

- [ ] **Dado** que soy dueño con ventas `COMPLETED`, **Cuando** abro `/sales`, **Entonces** veo una tabla paginada con comprador (nombre y email), evento, ticket, tipo, club, fecha de pago, cantidad, monto y estado.
- [ ] **Dado** que no hay ventas (o el filtro no trae resultados), **Cuando** cargo la página, **Entonces** veo empty state: _No hay ventas para mostrar._
- [ ] **Dado** que la API/red falla, **Cuando** cargo `/sales`, **Entonces** veo un mensaje de error recuperable en español (mismo patrón que inventario/eventos).
- [ ] **Dado** la carga en curso, **Cuando** espero datos, **Entonces** veo loading/skeleton alineado al resto del dashboard.

### US-2: Filtrar ventas

**Como** dueño  
**Quiero** filtrar las ventas completadas por evento, club, tipo de ticket y rango de fechas  
**Para** acotar el historial a lo que busco

**Criterios de aceptación**

- [ ] **Dado** `/sales` con datos, **Cuando** elijo un **evento**, **Entonces** el listado solo muestra órdenes de ese evento.
- [ ] **Dado** `/sales` con datos, **Cuando** elijo un **club**, **Entonces** solo veo órdenes de tickets de eventos de ese club.
- [ ] **Dado** `/sales` con datos, **Cuando** elijo un **tipo de ticket** (`general` / `vip`), **Entonces** solo veo órdenes de ese tipo.
- [ ] **Dado** un rango **Desde / Hasta**, **Cuando** filtro, **Entonces** solo veo órdenes cuyo `paidAt` cae en ese rango (inclusive).
- [ ] **Dado** filtros aplicados, **Cuando** limpio o cambio filtros, **Entonces** la paginación vuelve a página 1 y el listado se actualiza.

### US-3: Paginar el historial

**Como** dueño  
**Quiero** paginar el listado  
**Para** recorrer muchas ventas sin cargar todo de una

**Criterios de aceptación**

- [ ] **Dado** más ventas que el `limit` de página, **Cuando** cambio de página, **Entonces** la tabla y la barra de paginación reflejan `page` / `totalPages`.
- [ ] **Dado** una sola página de resultados, **Cuando** veo el listado, **Entonces** la paginación sigue visible (mismo criterio que inventario de tickets).

### US-4: Solo dueño (sidebar + ruta)

**Como** dueño  
**Quiero** que solo yo vea y acceda a Ventas  
**Para** que el staff no consulte el historial de compras

**Criterios de aceptación**

- [ ] **Dado** sesión `owner`, **Cuando** veo el sidebar, **Entonces** aparece el ítem **Ventas** → `/sales`.
- [ ] **Dado** sesión `staff`, **Cuando** veo el sidebar, **Entonces** **no** aparece **Ventas**.
- [ ] **Dado** sesión `staff`, **Cuando** navego a `/sales` (URL directa), **Entonces** la ruta está bloqueada (redirect al home permitido, mismo patrón `role-routes`).
- [ ] **Dado** sesión no-owner, **Cuando** llamo al endpoint de listado de ventas, **Entonces** recibo `403`.

---

## Contratos

### API

| Método | Ruta                     | Auth      | Descripción                          |
| ------ | ------------------------ | --------- | ------------------------------------ |
| `GET`  | `/api/dashboard/sales`   | Owner JWT | Listado paginado de ventas completadas |

**Query**

| Param        | Obligatorio   | Notas                                      |
| ------------ | ------------- | ------------------------------------------ |
| `page`       | default `1`   | paginación                                 |
| `limit`      | default `10`  | paginación                                 |
| `eventId`    | no            | `documentId` del evento                    |
| `clubId`     | no            | `documentId` del club del dueño            |
| `ticketType` | no            | `general` \| `vip` (`TICKET_TYPE`)         |
| `from`       | no            | ISO datetime; límite inferior de `paidAt`  |
| `to`         | no            | ISO datetime; límite superior de `paidAt`  |

**Response:** `PaginatedResponse<OwnerSaleResponse>`

| Campo         | Tipo     | Notas                          |
| ------------- | -------- | ------------------------------ |
| `id`          | string   | `documentId` de la orden       |
| `buyerName`   | string   | perfil usuario                 |
| `buyerEmail`  | string   | email de la account            |
| `eventName`   | string   |                                |
| `ticketName`  | string   |                                |
| `ticketType`  | enum     | `general` \| `vip`             |
| `clubName`    | string   |                                |
| `paidAt`      | string \| null | ISO; en COMPLETED suele estar seteado |
| `quantity`    | number   |                                |
| `amount`      | number   | monto de la orden              |
| `status`      | enum     | siempre `COMPLETED` en este listado |

**Errores:** `401` no auth · `403` no owner · `400` query inválida (p. ej. `from` > `to`, ids mal formados) — mensajes i18n en español.

**Contratos compartidos:** Zod en `@afterdark/validators` · DTO en `@afterdark/types` · `API_ROUTES.dashboard.path.sales()`.

### Datos

Sin migración. Repository bajo `packages/db/.../dashboard/` (o `orders/` si conviene), joins `orders` → `tickets` → `events` → `clubs` → `owners`, más `users` / `accounts` para comprador. Solo `PAYMENT_STATUS.COMPLETED` y clubes del dueño.

### UI

| Pieza | Valor |
| ----- | ----- |
| Ruta | `/_app/sales` · `DASHBOARD_ROUTES.sales()` |
| Nav | Sidebar **Ventas** solo `owner` · `/sales` en `OWNER_ALLOWED_PATH_PREFIXES` |
| Filtros | **Evento** · **Club** · **Tipo de ticket** · **Desde** · **Hasta** |
| Empty | _No hay ventas para mostrar._ |
| Error carga | Mensaje genérico recuperable (patrón inventario/eventos) |
| Tabla | Columnas del DTO; paginación visible como inventario |
| i18n | Namespace `sales` (`es` / `en`) |

---

## Reglas de negocio

1. El listado solo incluye órdenes con `status = COMPLETED` cuyo ticket → evento → club pertenece al dueño autenticado (`JWT` + rol `owner`).
2. Orden por defecto: `paidAt` descendente (más recientes primero). Si `paidAt` es null, no deberían aparecer en COMPLETED; si aparecen, van al final.
3. Filtros `clubId` / `eventId` que no pertenecen al dueño: respuesta **vacía** (sin filtrar ownership de otros dueños; no 404 que filtre existencia).
4. Si `from` > `to`: `400` con mensaje i18n en español.
5. v1 es solo lectura: sin detalle de orden, sin mutaciones, sin exportación.
6. Selectores de filtro en UI: solo clubes y eventos del dueño (reutilizar listados existentes cuando se pueda).
7. Staff: sin ítem en sidebar y ruta `/sales` bloqueada vía `role-routes`; API responde `403` si el rol no es `owner`.

## Preguntas abiertas

_(ninguna)_
