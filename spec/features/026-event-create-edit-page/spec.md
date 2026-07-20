# Crear/editar evento en pantalla (wizard)

> Entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo          | Valor                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------- |
| **ID**         | `026-event-create-edit-page`                                                                  |
| **Status**     | `approved`                                                                                    |
| **Apps**       | `dashboard`, `api` (+ `validators`, `types`, `i18n`; `db` si hace falta schema/assets)         |
| **Depende de** | `002-locations-management`, `010-location-create-edit-page` (formulario simplificado + mapa) |
| **Reemplaza**  | `011-events-management` (spec eliminada; listado/API base pueden vivir en código)             |

---

## Qué hace

El dueño **crea y edita eventos** desde pantallas dedicadas (no modal), con un **wizard de 2 pasos**:

1. **Ubicación** — elegir una ubicación existente del dueño, o “agregar ubicación diferente” con un formulario simplificado (capacidad, dirección/mapa e imágenes de ubicación, máx. 4). En edición se muestra la ubicación ya asociada seleccionada.
2. **Datos del evento** — mismos campos que el formulario actual de evento **sin** el select de location, más imágenes del evento (**opcionales, máximo 2**).

El CTA de crear y la acción de editar en `/events` navegan a estas pantallas.

## Por qué

El modal queda corto para combinar ubicación + datos del evento + imágenes. Alinear la UX con ubicaciones (`010`) mejora el flujo de alta y permite asociar fotos del evento (hasta 2) y limitar las de ubicación a 4 en el alta embebida.

## Alcance

### Incluye

- Rutas create/edit a pantalla completa (espejo de locations).
- Wizard de 2 pasos en **create** y **edit**.
- Step 1: select de ubicaciones del dueño; opción “agregar ubicación diferente” → form simplificado (capacity + address/mapa + imágenes ubicación, **máx. 4**). En edit: preseleccionar la ubicación del evento.
- Step 2: campos del evento actuales **sin** select de location + imágenes del evento (**opcionales, máx. 2**).
- API: persistir imágenes de evento (0–2); validar tope de 4 imágenes en ubicación (flujo/validación del alta embebida y/o API de locations).
- Reemplazo del modal/diálogo de crear y del de editar por las pantallas nuevas.
- CTA del listado `/events` → navegación a create/edit (sin modal).

### No incluye

- Cambios al listado paginado de `/events` salvo CTA crear y link/acción editar.
- Catálogo público / app `web`.
- Tickets (`012` sigue aparte).
- Eliminar eventos.

---

## User stories

### US-1: Crear evento (wizard)

**Como** dueño  
**Quiero** crear un evento en un wizard de 2 pasos (ubicación → datos)  
**Para** asociarlo a una venue y publicarlo sin usar un modal

**Criterios de aceptación**

- [ ] **Dado** que estoy en `/events`, **Cuando** pulso el CTA de crear, **Entonces** navego a la pantalla de creación (no se abre un diálogo).
- [ ] **Dado** el paso 1, **Cuando** no hay ubicación seleccionada ni formulario de ubicación nueva válido, **Entonces** el botón _Siguiente_ está deshabilitado.
- [ ] **Dado** que seleccioné una ubicación existente, **Cuando** pulso _Siguiente_, **Entonces** paso al paso 2 con los campos del evento (sin select de location).
- [ ] **Dado** el paso 2 con datos válidos, **Cuando** envío, **Entonces** se persiste el evento (y 0–2 imágenes si las cargué), veo toast de éxito y vuelvo a `/events`.
- [ ] **Dado** error de API al guardar, **Cuando** falla el envío, **Entonces** permanezco en el wizard con toast de error en español.

### US-2: Editar evento (wizard)

**Como** dueño  
**Quiero** editar un evento en la misma pantalla/wizard  
**Para** corregir datos, fechas, estado o ubicación asociada

**Criterios de aceptación**

- [ ] **Dado** el listado `/events`, **Cuando** elijo editar un evento propio, **Entonces** navego a la pantalla de edición (no modal).
- [ ] **Dado** la pantalla de edición, **Cuando** cargo el paso 1, **Entonces** la ubicación asociada al evento aparece preseleccionada.
- [ ] **Dado** el paso 2, **Cuando** veo el formulario, **Entonces** muestra los datos actuales del evento (nombre, descripción, fechas, estado) **sin** select de location, y las imágenes existentes (si hay).
- [ ] **Dado** cambios válidos, **Cuando** guardo, **Entonces** se actualiza el evento, toast de éxito y vuelta a `/events`.
- [ ] **Dado** un `documentId` que no es mío o no existe, **Cuando** abro la ruta de edición, **Entonces** veo un mensaje de no encontrado y enlace para volver a `/events`.

### US-3: Crear ubicación en el paso 1

**Como** dueño  
**Quiero** agregar una ubicación distinta desde el wizard  
**Para** no ir primero a `/locations` cuando la venue todavía no existe

**Criterios de aceptación**

- [ ] **Dado** el paso 1, **Cuando** elijo agregar ubicación diferente, **Entonces** se despliega el formulario simplificado (capacidad, dirección/mapa e imágenes de ubicación).
- [ ] **Dado** ese formulario válido en el paso 1, **Cuando** pulso _Siguiente_, **Entonces** avanzo al paso 2 **sin** persistir aún la ubicación (los datos quedan en estado del wizard).
- [ ] **Dado** imágenes de la ubicación nueva, **Cuando** intento cargar más de 4, **Entonces** el sistema no permite superar el máximo de 4.
- [ ] **Dado** que volví al select de ubicaciones existentes, **Cuando** elijo una del listado, **Entonces** se oculta/descarta el form de ubicación nueva y se habilita _Siguiente_.
- [ ] **Dado** ubicación nueva en el wizard y datos del evento válidos, **Cuando** envío el formulario final, **Entonces** se crea primero la ubicación (con sus imágenes ≤4) y luego el evento ligado a ella (misma orquestación cliente o endpoint compuesto; ver Contratos).

### US-4: Imágenes del evento y de ubicación

**Como** dueño  
**Quiero** adjuntar hasta 2 fotos del evento (opcionales) y hasta 4 de una ubicación nueva  
**Para** ilustrar la noche y la venue sin saturar el almacenamiento

**Criterios de aceptación**

- [ ] **Dado** el paso 2, **Cuando** no cargo imágenes del evento, **Entonces** puedo guardar el evento con éxito (imágenes opcionales).
- [ ] **Dado** el paso 2, **Cuando** intento cargar más de 2 imágenes del evento, **Entonces** el sistema no permite superar el máximo de 2.
- [ ] **Dado** create o edit, **Cuando** guardo con 1 o 2 imágenes válidas, **Entonces** quedan asociadas al evento y se muestran al reabrir la edición.
- [ ] **Dado** el form de ubicación nueva en el paso 1, **Cuando** cargo imágenes, **Entonces** aplica el tope de 4 (misma regla que la validación de ubicación en este flujo).

### US-5: Cancelar / salir con cambios sin guardar

**Como** dueño  
**Quiero** cancelar o volver con el mismo patrón que ubicaciones  
**Para** no perder datos por error ni salir sin aviso

**Criterios de aceptación**

- [ ] **Dado** el wizard con cambios respecto al estado inicial, **Cuando** pulso _Cancelar_, _Volver_ o navego fuera, **Entonces** veo un diálogo de confirmación antes de salir.
- [ ] **Dado** el diálogo, **Cuando** elijo seguir editando, **Entonces** permanezco en el wizard con los datos intactos.
- [ ] **Dado** el diálogo, **Cuando** elijo salir sin guardar, **Entonces** vuelvo a `/events` sin persistir.
- [ ] **Dado** el wizard sin cambios, **Cuando** cancelo o vuelvo, **Entonces** salgo directo a `/events` sin diálogo.

---

## Contratos

### API

| Método | Ruta                         | Auth (JWT + owner) | Notas                                                                 |
| ------ | ---------------------------- | ------------------ | --------------------------------------------------------------------- |
| GET    | `/api/events/my-events`      | sí                 | Listado paginado existente (sin cambio de contrato salvo `images`).   |
| GET    | `/api/events/:documentId`    | sí                 | **Nuevo.** Detalle para hidratar edit (ownership). Incluye `images`.  |
| POST   | `/api/events`                | sí                 | Create; multipart con campo `images` (0–2) + campos del evento.       |
| PATCH  | `/api/events/:documentId`    | sí                 | Update; multipart `images` nuevas + ids a conservar (patrón location).|
| POST   | `/api/locations` (existente) | sí                 | Usado si el wizard crea ubicación nueva **en el submit final**.       |

**Orquestación ubicación nueva (asumido — opción B):** el paso 1 no llama a la API. En el submit final del wizard:

1. Si eligió ubicación existente → solo `POST`/`PATCH` evento con ese `locationId`.
2. Si cargó ubicación nueva → `POST /api/locations` (multipart, ≤4 imágenes) y con el `documentId` resultante → `POST`/`PATCH` evento.

No se requiere endpoint compuesto evento+ubicación en v1.

**Request / Response**

- Reutilizar / extender `createEventSchema` / `updateEventSchema` (+ validación de archivos).
- Constante nueva: `EVENT_IMAGE_MAX_COUNT = 2`.
- Cambiar: `LOCATION_IMAGE_MAX_COUNT` de `5` → `4` (API, validators, UI locations y wizard).
- `EventResponse` incluye `images: EventImageResponse[]` (mismo shape que `LocationImageResponse` o tipo compartido de asset).
- Tipos/validators de upload alineados con locations (`FilesInterceptor`, MIME, tamaño).

**Errores (mensaje al usuario en español)**

| HTTP | Cuándo                         | Mensaje (orientativo / i18n)                                      |
| ---- | ------------------------------ | ----------------------------------------------------------------- |
| 400  | Validación / demasiadas imgs   | p. ej. _Podés subir hasta 2 imágenes del evento._ / _…hasta 4…_ |
| 401  | Sin sesión                     | Mensaje auth existente                                            |
| 403  | No es dueño del recurso        | Mensaje ownership existente                                       |
| 404  | Evento no encontrado / no propio | _No encontramos el evento que querés editar._                     |

### Datos

| Tabla / campo                         | Cambio                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `event_assets_lnk` (nueva)            | Link `event_id` ↔ `asset_id` (espejo de `location_assets_lnk`).        |
| `assets`                              | Reuso; sin cambio de schema salvo filas nuevas.                        |
| `LOCATION_IMAGE_MAX_COUNT`            | Valor de negocio 4 (constante validators; no columna DB).              |
| `events`                              | Sin columnas nuevas de imagen (relación vía link).                     |

### UI

| Ruta                         | Pantalla                                      |
| ---------------------------- | --------------------------------------------- |
| `/events`                    | Listado (CTA → create; acción → edit).        |
| `/events/new`                | Wizard create (2 steps).                      |
| `/events/$documentId/edit`   | Wizard edit (2 steps; ubicación preseleccionada). |

**Copy (español) — orientativo**

| Contexto              | Texto                                              |
| --------------------- | -------------------------------------------------- |
| CTA listado           | Crear evento / equivalente i18n actual             |
| Step 1 título         | Ubicación del evento                               |
| Step 1 CTA alt        | Agregar ubicación diferente                        |
| Step 2 título         | Datos del evento                                   |
| Footer                | Cancelar · Siguiente / Guardar (crear o actualizar)|
| Unsaved dialog        | Mismo patrón que locations (_Seguir editando_ / _Salir sin guardar_) |
| Edit 404              | No encontramos el evento que querés editar.        |

Constantes ruta: `DASHBOARD_ROUTES.eventsNew()`, `eventsEdit(documentId)` (espejo locations).

---

## Reglas de negocio

- Solo rol **owner**; el recurso debe pertenecer al dueño autenticado (evento y ubicación).
- `startsAt` < `endsAt` (validación existente cliente/servidor).
- Imágenes del evento: **0–2**, opcionales; mismo MIME/tamaño que locations.
- Imágenes de ubicación: **máximo 4** en create/update de locations y en el form embebido del wizard (`LOCATION_IMAGE_MAX_COUNT = 4`).
- Step 1 sin ubicaciones existentes: se ofrece “agregar ubicación diferente”; _Siguiente_ solo con ubicación elegida o form nueva válido.
- En edit, la ubicación actual viene preseleccionada; el dueño puede cambiar a otra existente o a una ubicación nueva (persistida solo al guardar).
- Cancelar / volver / navegar fuera con dirty: diálogo unsaved; sin llamadas de persistencia.
- Ubicación nueva en memoria: no se crea en API hasta el submit final exitoso del evento.
- Listado `/events`: **no** muestra thumbnails de imágenes del evento en esta feature.
- Delete de eventos: fuera de alcance (puede existir en código; esta spec no lo redefine).

## Preguntas abiertas

- Ninguna bloqueante. Supuestos de fase 4–5 aceptados vía _“sigue”_.
