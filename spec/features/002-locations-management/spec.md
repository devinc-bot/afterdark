# Gestión de ubicaciones

> Entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo          | Valor                                                   |
| -------------- | ------------------------------------------------------- |
| **ID**         | `002-locations-management`                              |
| **Status**     | `approved`                                              |
| **Apps**       | `api`, `dashboard`, `db`, `types`, `validators`, `i18n` |
| **Depende de** | `001-auth-sessions`                                     |
| **Antes**      | `002-club-management` (renombrada)                      |

> **Cambio en curso (2026-07-17):** renombrar dominio Clubes → Ubicaciones (UI + código + tabla DB) y reemplazar columna `status` por `type` (`permanente` \| `temporal`).

---

## Qué hace

El dueño gestiona **ubicaciones permanentes** desde la sección **Ubicaciones** del dashboard (`/locations`): listar, crear, editar y eliminar. El copy, rutas, API y tabla dejan de usar “club(s)” y pasan a `location(s)` / “Ubicaciones”.

Las ubicaciones creadas en esta sección tienen siempre `type = permanente`. Las ubicaciones **temporales** (creadas desde eventos, eligiendo una permanente o cargando datos ad hoc) quedan **fuera de este cambio** y se especificarán más adelante.

## Por qué

“Club” queda corto: el negocio necesita un concepto más general de **ubicación**, que después podrá ser permanente (locales fijos) o temporal (pop-ups / datos solo para un evento). Este entregable unifica el naming y el esquema (`type` en lugar de `status`) para desbloquear ese modelo.

## Alcance

### Incluye

- Rename completo: i18n (“Ubicaciones”), módulo dashboard, API, types, validators, tabla DB `locations` (ex `clubs`).
- Rutas dashboard: `/locations`, `/locations/new`, `/locations/$documentId/edit` (ex `/club-management…`).
- API: `/api/locations/*` (ex `/api/clubs/*`).
- Migración: quitar columna `status`; agregar `type` (`permanente` \| `temporal`).
- Create/update desde **Ubicaciones**: persistir siempre `type = permanente`.
- Formulario create/edit (`010-location-create-edit-page`): sin campo `status`; alineado al rename y al `type` permanente.
- Listado, KPIs y sidebar: terminología “Ubicaciones”.
- Actualizar FKs / tablas de enlace / referencias de código que apunten a `clubs` (p. ej. assets link, eventos, staff, etc.).

### No incluye

- Cambios en `web` / catálogo público.
- Crear o editar ubicaciones **temporales** desde eventos (selector permanente vs formulario temporal) — entregable futuro.
- Reglas de negocio distintas por tipo (eventos/tickets condicionados a permanente vs temporal).
- Implementación completa de `005-location-assets` (solo rename de la feature en roadmap).
- Soft-delete o reintroducir activo/inactivo.

---

## User stories

**Rol:** dueño (`owner`).

### US-1: Listar ubicaciones

**Como** dueño  
**Quiero** ver mis ubicaciones en `/locations`  
**Para** administrarlas con la terminología correcta

**Criterios de aceptación**

- [ ] **Dado** que estoy autenticado como dueño, **Cuando** abro `/locations`, **Entonces** veo el listado con copy “Ubicaciones” (no “Clubes”).
- [ ] **Dado** el listado, **Cuando** la API responde, **Entonces** los datos vienen de `GET /api/locations/...` (no `/api/clubs/...`).

### US-2: Crear ubicación permanente

**Como** dueño  
**Quiero** crear una ubicación desde la sección Ubicaciones  
**Para** registrar un espacio permanente

**Criterios de aceptación**

- [ ] **Dado** `/locations`, **Cuando** pulso agregar, **Entonces** navego a `/locations/new`.
- [ ] **Dado** el formulario válido, **Cuando** guardo, **Entonces** se crea con `type = permanente` (sin campo status; el tipo no es editable en UI), toast de éxito y vuelta a `/locations`.

### US-3: Editar y eliminar

**Como** dueño  
**Quiero** editar o eliminar una ubicación permanente  
**Para** mantener actualizado el registro

**Criterios de aceptación**

- [ ] **Dado** una fila en el listado, **Cuando** edito, **Entonces** navego a `/locations/$documentId/edit` y al guardar se actualiza vía API de locations (sigue siendo permanente).
- [ ] **Dado** una fila, **Cuando** elimino con confirmación, **Entonces** desaparece del listado.

### US-4: Rename visible y de contratos

**Como** dueño  
**Quiero** que la UI y la API hablen de ubicación(es)  
**Para** no ver “club” en el flujo de gestión

**Criterios de aceptación**

- [ ] **Dado** sidebar, listado, KPIs y formularios, **Cuando** uso la sección, **Entonces** el copy dice “Ubicación(es)” / “Ubicaciones”.
- [ ] **Dado** filas migradas desde `clubs`, **Cuando** las consulto, **Entonces** tienen `type = permanente`.

---

## Contratos

### API

Auth: JWT rol `owner` (igual que el CRUD actual de clubs).

| Método   | Ruta                          | Notas                                                                                               |
| -------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/locations/my-locations` | Ex `/api/clubs/my-clubs`                                                                            |
| `POST`   | `/api/locations/create`       | Ex `/api/clubs/create`; `type` no viene del cliente desde Ubicaciones — el server setea `permanent` |
| `PATCH`  | `/api/locations/:documentId`  | Ex `/api/clubs/:documentId`; no cambia `type` desde este flujo                                      |
| `DELETE` | `/api/locations/:documentId`  | Ex `/api/clubs/:documentId`                                                                         |

**Payload / response**

- Quitar `status` de request y response.
- Exponer `type`: `permanent` \| `temporary`.
- Resto de campos (nombre, capacidad, descripción, imágenes, dirección, lat/lng) se mantienen con rename de tipos/`Club*` → `Location*`.

**Errores (mensajes ES al usuario)** — mismos códigos HTTP que hoy; copy con “ubicación” en lugar de “club” (p. ej. no encontrada, no autorizado, validación).

### Datos

| Antes                   | Después                  |
| ----------------------- | ------------------------ |
| tabla `clubs`           | `locations`              |
| `club_addresses_lnk`    | `location_addresses_lnk` |
| `club_assets_lnk`       | `location_assets_lnk`    |
| `staff_club_lnk`        | `staff_location_lnk`     |
| columnas / FK `club_id` | `location_id`            |

- Columna nueva `type` (`permanent` \| `temporary`), NOT NULL.
- Sin columna `status`.
- Migración de filas existentes: `type = permanent`.
- Enums/types/validators: `LOCATION_TYPE` / `locationTypeSchema`; eliminar `CLUB_STATUS`.

### UI (dashboard)

| Ruta                          | Uso     |
| ----------------------------- | ------- |
| `/locations`                  | Listado |
| `/locations/new`              | Crear   |
| `/locations/$documentId/edit` | Editar  |

- Sidebar / i18n: “Ubicaciones”.
- Formulario: sin `status` y sin selector de `type`.
- Toasts y vacíos en español con “ubicación(es)”.

---

## Reglas de negocio

1. Las ubicaciones creadas o actualizadas desde la sección **Ubicaciones** tienen siempre `type = permanent`. El cliente no envía ni edita `type` en ese flujo.
2. No existe cambio de `type` (p. ej. permanent → temporary) desde este entregable.
3. Solo el dueño propietario de la ubicación puede listar/crear/editar/eliminar sus ubicaciones (mismo ownership que clubs hoy).
4. La eliminación conserva el comportamiento actual respecto a relaciones (events, staff links, assets, addresses); no se rediseñan cascadas en este cambio.
5. Rename breaking: no hay alias de rutas `/api/clubs` ni de tabla `clubs`.

### Edge cases

- Filas migradas desde `clubs` → `type = permanent`.
- Referencias de código/API a `club` / `clubId` / `/clubs` se actualizan en el mismo cambio (`location` / `locationId` / `/locations`).
- Ubicaciones temporales y el flujo desde eventos quedan fuera; el enum `temporary` existe en esquema para el futuro.

## Preguntas abiertas

_(ninguna)_
