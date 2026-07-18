# Pantallas de creación y edición de ubicación (dashboard)

> Entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo          | Valor                                                           |
| -------------- | --------------------------------------------------------------- |
| **ID**         | `010-location-create-edit-page`                                 |
| **Status**     | `in-progress`                                                   |
| **Apps**       | `dashboard`, `api` (+ esquema `addresses` / validators / types) |
| **Depende de** | `002-locations-management` (API y listado existentes)           |
| **Antes**      | `010-club-create-edit-page` (renombrada)                        |

> **Ampliación (2026-07-15):** mapa [mapcn](https://www.mapcn.dev/docs) en la sección de ubicación del formulario create/edit para elegir coordenadas exactas y persistirlas en `addresses`.

> **Rename (2026-07-17):** dominio Clubes → Ubicaciones; copy/rutas/API/módulo alineados con `002-locations-management` (`status` → `type`). Detalle en esa spec.

---

## Qué hace

Reemplaza el diálogo modal de crear/editar club (`ClubDialogForm`) por **dos pantallas dedicadas** a pantalla completa:

| Acción | Ruta                                | Origen                                  |
| ------ | ----------------------------------- | --------------------------------------- |
| Crear  | `/club-management/new`              | Botón _Agregar club_ en el listado      |
| Editar | `/club-management/$documentId/edit` | Acción _Editar_ en una fila del listado |

El dueño completa el mismo formulario (información general, imágenes, ubicación) en layout **dos columnas en desktop** (datos + ubicación | imágenes) y **una columna en mobile**. Las acciones _Cancelar_ y _Guardar_ están en una **barra fija al pie** (mobile y desktop).

Tras guardar con éxito: toast y vuelta a `/club-management`. Al cancelar, volver o usar el enlace _Volver_ **con cambios sin guardar**: diálogo de confirmación antes de salir.

### Ampliación — ubicación en mapa

En la sección **Ubicación** (create y edit), el dueño ve un mapa [mapcn](https://www.mapcn.dev/docs) (MapLibre), completa los campos de dirección a mano y coloca/ajusta un **pin** (click o arrastre). Puede usar **ubicación aproximada por IP** (botón junto a Ciudad). Al guardar, las coordenadas se persisten en `addresses`.

## Por qué

El diálogo actual concentra tres secciones y 9+ campos (más hasta 5 imágenes) en un modal con scroll interno (`max-h ~ 48rem`). Eso genera mala UX, sobre todo en mobile (teclado + scroll en modal, acciones lejos del contenido).

Una pantalla dedicada da más espacio, mejor jerarquía y navegación clara.

La dirección textual sola no alcanza para una ubicación exacta. El mapa con pin + ubicación por IP da precisión sin depender de proveedores de autocomplete/geocode de pago.

## Alcance

### Incluye

**Pantallas create/edit (base `010`)**

- Rutas TanStack Router: `new` y `$documentId/edit` bajo `/_app/club-management`.
- Extraer formulario de `dialog-form.tsx` a componentes de página (sin `Dialog` para create/edit).
- Layout dos columnas en `lg+`: columna izquierda — información general + ubicación; columna derecha — imágenes. Una columna en viewports menores.
- Footer sticky con _Cancelar_ y CTA (_Registrar club_ / _Actualizar club_).
- Diálogo de confirmación al salir con cambios sin guardar (create y edit).
- Navegación desde `RegisteredClubs` vía `Link` / `useNavigate` (sin abrir modal de formulario).
- Reutilizar mutaciones (`useCreateClub`, `useUpdateClub`), `ImagesClubForm`, validadores y envío `FormData`.
- Edición: precargar club desde cache / `GET /api/clubs/my-clubs` en **cliente** (`useClubs`), no loader SSR autenticado.
- Mantener `ClubRemoveDialog` en el listado para eliminar.
- Constantes de rutas en `DASHBOARD_ROUTES` (patrón `newProperty` / `editProperty`).

**Mapa y coordenadas (ampliación)**

- Mapa mapcn en la sección Ubicación (create y edit).
- Pin colocable por **click** en el mapa y **arrastrable**; lat/lng se actualizan al soltar.
- Botón **ubicación por IP** junto al input Ciudad → `GET /api/geo/ip-locate` ([ipquery](https://ipquery.io/#docs)); centra el mapa y setea lat/lng (y ciudad/estado si el provider los envía).
- Centro inicial en create (aún sin pin): **geolocalización del browser**, con **fallback** Buenos Aires si niega o falla.
- En edit: mostrar pin en las coordenadas guardadas; si no hay coords, el dueño coloca el pin (IP, click o drag) antes de guardar.
- Columnas `latitude` / `longitude` en `addresses` + create/update club + respuesta de `my-clubs`.
- Coordenadas **requeridas** al enviar el formulario.

### No incluye

- Vista de detalle de club (solo formulario).
- Wizard multi-paso.
- Mover eliminar club fuera del diálogo actual.
- Mapa en listado, `web` o catálogo público.
- **Autocomplete de direcciones** y **forward geocode** (endpoints / UI eliminados).
- Proveedores de mapas de pago (MapTiler, Google Places, etc.) — tiles CARTO free de mapcn por defecto.
- Cambiar el layout de dos columnas de `010`.
- Reverse geocoding que **reescriba** calle/número al **arrastrar** el pin (el drag solo ajusta lat/lng).

---

## User stories

### US-1: Crear club en pantalla dedicada

**Como** dueño de clubes  
**Quiero** registrar un club en una pantalla completa  
**Para** completar todos los campos cómodamente sin un modal estrecho

**Criterios de aceptación**

- [ ] **Dado** que estoy en `/club-management`, **Cuando** pulso _Agregar club_, **Entonces** navego a `/club-management/new`.
- [ ] **Dado** la pantalla de creación, **Cuando** la veo en desktop (`lg+`), **Entonces** los campos de datos/ubicación están a la izquierda y la sección de imágenes a la derecha.
- [ ] **Dado** el formulario válido, **Cuando** envío, **Entonces** se llama `POST /api/clubs/create` con `FormData`, muestro toast _Club registrado correctamente_ y vuelvo a `/club-management`.
- [ ] **Dado** error de API, **Cuando** falla el envío, **Entonces** permanezco en la pantalla con toast de error en español.

### US-2: Editar club en pantalla dedicada

**Como** dueño  
**Quiero** editar un club en una pantalla completa con sus datos actuales  
**Para** actualizar información e imágenes con claridad

**Criterios de aceptación**

- [ ] **Dado** un club en el listado, **Cuando** elijo _Editar_, **Entonces** navego a `/club-management/:documentId/edit`.
- [ ] **Dado** la ruta de edición, **Cuando** el club existe en `my-clubs`, **Entonces** el formulario muestra todos los campos e imágenes guardadas.
- [ ] **Dado** cambios válidos, **Cuando** envío, **Entonces** se llama `PATCH /api/clubs/:documentId` con `FormData` (`keepImageIds` + nuevas `images`), toast _Club actualizado correctamente_ y vuelvo al listado.
- [ ] **Dado** que quito imágenes en la UI, **Cuando** guardo, **Entonces** esas imágenes no se incluyen en `keepImageIds`.

### US-3: Salir con cambios sin guardar

**Como** dueño  
**Quiero** que me avisen si salgo con cambios pendientes  
**Para** no perder trabajo por error

**Criterios de aceptación**

- [ ] **Dado** un formulario con cambios respecto al estado inicial, **Cuando** pulso _Cancelar_, _Volver a clubes_ o navego fuera, **Entonces** veo un diálogo de confirmación antes de salir.
- [ ] **Dado** el diálogo de confirmación, **Cuando** elijo _Seguir editando_, **Entonces** permanezco en el formulario con los datos intactos.
- [ ] **Dado** el diálogo de confirmación, **Cuando** elijo _Salir sin guardar_, **Entonces** navego a `/club-management` sin persistir.
- [ ] **Dado** un formulario sin cambios, **Cuando** cancelo o vuelvo, **Entonces** salgo directo al listado sin diálogo.

### US-4: Club inexistente en edición

**Como** dueño  
**Quiero** un mensaje claro si la URL de edición es inválida  
**Para** no ver un formulario vacío engañoso

**Criterios de aceptación**

- [ ] **Dado** un `documentId` que no está en `my-clubs`, **Cuando** cargo la ruta de edición, **Entonces** veo mensaje _No encontramos el club que querés editar._ y enlace _Volver a clubes_.
- [ ] **Dado** listado aún cargando, **Cuando** entro a editar, **Entonces** veo fallback de carga hasta resolver el club.

### US-5: Listado sin diálogo de formulario

**Como** dueño  
**Quiero** que crear y editar sean pantallas, no modales  
**Para** una experiencia consistente

**Criterios de aceptación**

- [ ] **Dado** `/club-management`, **Cuando** creo o edito, **Entonces** no se abre `ClubDialogForm`.
- [ ] **Dado** el listado, **Cuando** elimino un club, **Entonces** `ClubRemoveDialog` sigue funcionando como hoy.

### US-6: Acciones siempre visibles

**Como** dueño en mobile  
**Quiero** ver Cancelar y Guardar sin scrollear hasta el fondo  
**Para** enviar el formulario con facilidad

**Criterios de aceptación**

- [ ] **Dado** cualquier viewport, **Cuando** estoy en create o edit, **Entonces** el footer con acciones está fijo al pie de la ventana (`sticky`/`fixed` con padding inferior al contenido).
- [ ] **Dado** errores de campo al enviar, **Cuando** valido, **Entonces** se muestran con `role="alert"` y labels asociados (mismo patrón que el diálogo actual).

### US-7: Ubicar el mapa por IP

**Como** dueño de clubes  
**Quiero** ubicar el mapa con mi zona aproximada por IP  
**Para** no tener que buscar el punto a mano desde cero

**Criterios de aceptación**

- [ ] **Dado** el formulario create/edit, **Cuando** pulso el botón de ubicación por IP junto a Ciudad, **Entonces** el mapa se centra, se coloca/actualiza el pin y se setean lat/lng (y ciudad/estado si el provider los envía).
- [ ] **Dado** que `ip-locate` falla, **Cuando** ocurre el error, **Entonces** veo un mensaje en español y puedo reintentar o colocar el pin a mano.

### US-8: Ajustar precisión con el pin

**Como** dueño  
**Quiero** colocar y arrastrar el pin en el mapa  
**Para** fijar la ubicación exacta del local

**Criterios de aceptación**

- [ ] **Dado** el mapa, **Cuando** hago click o arrastro el pin y suelto, **Entonces** se actualizan `latitude` / `longitude` **sin** reescribir calle ni número (el drag no reescribe texto).
- [ ] **Dado** create sin pin aún, **Cuando** cargo la pantalla, **Entonces** el mapa intenta geolocalización del browser (o fallback Buenos Aires si falla/niega).
- [ ] **Dado** edit con coordenadas guardadas, **Cuando** abro el formulario, **Entonces** el pin está en ese punto.
- [ ] **Dado** edit sin coordenadas, **Cuando** abro el formulario, **Entonces** no hay pin hasta que lo coloque (IP, click o drag); al guardar hace falta pin.

### US-9: Guardar coordenadas

**Como** dueño  
**Quiero** que al registrar/actualizar se guarden lat/lng  
**Para** reutilizarlas después (mapas / producto)

**Criterios de aceptación**

- [ ] **Dado** formulario válido con pin, **Cuando** envío create/update, **Entonces** la petición incluye `latitude` y `longitude` y se persisten en `addresses`.
- [ ] **Dado** que no hay coordenadas al enviar, **Cuando** valido, **Entonces** veo error de campo en español y no se envía la petición.

## Contratos

### API

Reutiliza endpoints de `002-club-management` y añade campos de coordenadas. Proxy de ubicación por IP en `api` (JWT dueño).

| Método  | Ruta                     | Auth      | Uso                                                               |
| ------- | ------------------------ | --------- | ----------------------------------------------------------------- |
| `GET`   | `/api/clubs/my-clubs`    | JWT owner | Listado / edición; responde `latitude` / `longitude` (nullable)   |
| `POST`  | `/api/clubs/create`      | JWT owner | Crear; multipart incluye `latitude` + `longitude` **requeridos**  |
| `PATCH` | `/api/clubs/:documentId` | JWT owner | Editar; multipart incluye `latitude` + `longitude` **requeridos** |
| `GET`   | `/api/geo/ip-locate`     | JWT owner | Ubicación aproximada por IP ([ipquery](https://ipquery.io/#docs)) |

**Request create/update** — `multipart/form-data`: campos de `createClubSchema` (ampliado) + imágenes como hoy + `latitude` + `longitude`.

**`createClubSchema` (delta)**

```ts
latitude: z.coerce.number().min(-90).max(90)
longitude: z.coerce.number().min(-180).max(180)
```

**`ClubResponse` (delta)**

```ts
latitude: number | null
longitude: number | null
```

**`GeoIpLocateResult` (sketch)**

```ts
{
  latitude: number
  longitude: number
  city?: string
  state?: string
  country?: string
}
```

**Errores (mensaje al usuario en español)**

| HTTP | Cuándo                               | Mensaje                                                       |
| ---- | ------------------------------------ | ------------------------------------------------------------- |
| 400  | Validación / imágenes / IDs / coords | Mensaje de API / validación i18n                              |
| 401  | Sin sesión                           | Redirigir a login (`_app`)                                    |
| 404  | Club no encontrado (PATCH)           | _No encontramos el club solicitado._                          |
| 429  | Rate-limit geo                       | _Demasiadas búsquedas. Esperá un momento e intentá de nuevo._ |
| 502  | Fallo del proveedor IP               | _No pudimos ubicar tu zona. Probá de nuevo o mové el pin._    |
| 500  | Fallo create/update/upload           | Fallbacks actuales del dashboard                              |

### Datos

| Tabla / campo         | Cambio                                                                  |
| --------------------- | ----------------------------------------------------------------------- |
| `addresses.latitude`  | Columna nueva, tipo numérico (`real`), **nullable** (clubes existentes) |
| `addresses.longitude` | Idem                                                                    |

- Create/update: lat/lng obligatorios en request y persistidos.
- Filas antiguas: `null` hasta que el dueño edite y guarde con pin.
- Migración Drizzle; repositories create/update + mappers.

### UI (`dashboard`)

| Ruta                                     | Pantalla                          |
| ---------------------------------------- | --------------------------------- |
| `/_app/club-management`                  | Listado (sin diálogo create/edit) |
| `/_app/club-management/new`              | Formulario **creación**           |
| `/_app/club-management/$documentId/edit` | Formulario **edición**            |

**Layout (desktop `lg+`)**

```text
┌──────────────────────────────────────────────────┐
│ ← Volver a clubes    Título + descripción        │
├───────────────────────┬──────────────────────────┤
│ Información general   │ Imágenes                 │
│ Ubicación             │ (dropzone + previews)    │
│  [ciudad] [IP btn]    │                          │
│  [campos dirección]   │                          │
│  [mapa mapcn + pin]   │                          │
├───────────────────────┴──────────────────────────┤
│              Cancelar  |  Registrar/Actualizar   │  ← sticky footer
└──────────────────────────────────────────────────┘
```

**Componentes**

| Componente                        | Responsabilidad                                             |
| --------------------------------- | ----------------------------------------------------------- |
| `club-form.tsx`                   | Formulario; ubicación + botón IP + mapa                     |
| `club-location-map.tsx`           | mapcn: centro, click-to-pin, pin arrastrable, geo browser   |
| `club-form-page-layout.tsx`       | Header, grid 2 cols, footer sticky, slot para form          |
| `club-unsaved-changes-dialog.tsx` | `AlertDialog` al salir con `isDirty`                        |
| `club-create-view.tsx`            | Orquestación modo create                                    |
| `club-edit-view.tsx`              | Modo edit; club resuelto en ruta con `useClubs()` (cliente) |
| `images-club-form.tsx`            | Sin cambios funcionales                                     |
| `registered-clubs.tsx`            | `Link` / navigate a rutas                                   |

**Carga edición (cliente)**

```ts
// routes/.../$documentId/edit.tsx — sin loader SSR autenticado
const { data: clubs, isLoading, isError } = useClubs()
const club = clubs?.find((c) => c.documentId === documentId)
```

**Copy (español) — ubicación (delta)**

| Contexto          | Texto                                                             |
| ----------------- | ----------------------------------------------------------------- |
| Hint mapa         | `Arrastrá el pin para ajustar la ubicación exacta.`               |
| Lat/lng faltantes | `Seleccioná la ubicación en el mapa.`                             |
| Botón IP          | `Ubicarme por IP`                                                 |
| IP cargando       | `Ubicando…`                                                       |
| Error IP          | `No pudimos ubicar tu zona por IP. Probá de nuevo o mové el pin.` |

Lat/lng **no** se muestran como inputs (solo mapa + campos hidden). Geolocalización denegada: fallback de centro sin modal.

**Constantes API (`API_ROUTES`) — delta geo**

```ts
geo: {
  ipLocate: '/geo/ip-locate'
}
```

---

## Reglas de negocio

- Misma validación que hoy: `createClubSchema` al enviar; máximo `CLUB_IMAGE_MAX_COUNT` (5) imágenes totales en edición (conservadas + nuevas).
- Solo dueños autenticados bajo `_app`.
- En edición solo clubes presentes en `my-clubs` del dueño actual.
- `isDirty` incluye cambios en campos de texto, estado, imágenes nuevas, eliminación de imágenes existentes **y** cambios de pin / `latitude` / `longitude`.
- Tras create/update exitoso: invalidar query de clubes (mutaciones actuales) y navegar al listado.
- Eliminar club permanece en el listado con `ClubRemoveDialog`.
- Arrastrar / click del pin **no** reescribe calle ni número (solo lat/lng).
- Ubicación por IP setea lat/lng y puede rellenar ciudad/estado si el provider los envía.
- Create y edit: sin coordenadas no se puede enviar; mensaje _Seleccioná la ubicación en el mapa._
- Edit de club sin coords históricas: se puede abrir el form; al guardar hace falta pin (IP, click o arrastre).
- `ip-locate` solo vía proxy del backend; rate-limit por cuenta.

## Preguntas abiertas

- Ninguna bloqueante. QA manual pendiente para marcar feature `done`.
