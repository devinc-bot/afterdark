# Pantallas de creación y edición de club (dashboard)

> Entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo          | Valor                                            |
| -------------- | ------------------------------------------------ |
| **ID**         | `010-club-create-edit-page`                      |
| **Status**     | `approved`                                       |
| **Apps**       | `dashboard`                                      |
| **Depende de** | `002-club-management` (API y listado existentes) |

---

## Qué hace

Reemplaza el diálogo modal de crear/editar club (`ClubDialogForm`) por **dos pantallas dedicadas** a pantalla completa:

| Acción | Ruta                                | Origen                                  |
| ------ | ----------------------------------- | --------------------------------------- |
| Crear  | `/club-management/new`              | Botón _Agregar club_ en el listado      |
| Editar | `/club-management/$documentId/edit` | Acción _Editar_ en una fila del listado |

El dueño completa el mismo formulario (información general, imágenes, ubicación) en layout **dos columnas en desktop** (datos + ubicación | imágenes) y **una columna en mobile**. Las acciones _Cancelar_ y _Guardar_ están en una **barra fija al pie** (mobile y desktop).

Tras guardar con éxito: toast y vuelta a `/club-management`. Al cancelar, volver o usar el enlace _Volver_ **con cambios sin guardar**: diálogo de confirmación antes de salir.

## Por qué

El diálogo actual concentra tres secciones y 9+ campos (más hasta 5 imágenes) en un modal con scroll interno (`max-h ~ 48rem`). Eso genera mala UX, sobre todo en mobile (teclado + scroll en modal, acciones lejos del contenido).

Una pantalla dedicada da más espacio, mejor jerarquía y navegación clara sin cambiar reglas de negocio ni API.

## Alcance

### Incluye

- Rutas TanStack Router: `new` y `$documentId/edit` bajo `/_app/club-management`.
- Extraer formulario de `dialog-form.tsx` a componentes de página (sin `Dialog` para create/edit).
- Layout dos columnas en `lg+`: columna izquierda — información general + ubicación; columna derecha — imágenes. Una columna en viewports menores.
- Footer sticky con _Cancelar_ y CTA (_Registrar club_ / _Actualizar club_).
- Diálogo de confirmación al salir con cambios sin guardar (create y edit).
- Navegación desde `RegisteredClubs` vía `Link` / `useNavigate` (sin abrir modal de formulario).
- Reutilizar mutaciones (`useCreateClub`, `useUpdateClub`), `ImagesClubForm`, validadores y envío `FormData`.
- Edición: precargar club desde cache de `GET /api/clubs/my-clubs` (loader con `ensureQueryData`).
- Mantener `ClubRemoveDialog` en el listado para eliminar.
- Constantes de rutas en `DASHBOARD_ROUTES` (patrón `newProperty` / `editProperty`).

### No incluye

- Cambios de API (sin `GET /clubs/:id` nuevo).
- Cambios en validación, límites de imágenes o contratos multipart.
- Vista de detalle de club (solo formulario).
- Wizard multi-paso.
- Mover eliminar club fuera del diálogo actual.
- Cambios en `web` ni catálogo público.

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

---

## Contratos

### API

Sin cambios. Reutiliza endpoints de `002-club-management`:

| Método  | Ruta                     | Uso                                                  |
| ------- | ------------------------ | ---------------------------------------------------- |
| `GET`   | `/api/clubs/my-clubs`    | Prefetch en loader de edición; resolver `documentId` |
| `POST`  | `/api/clubs/create`      | Crear desde `/club-management/new`                   |
| `PATCH` | `/api/clubs/:documentId` | Editar desde `/club-management/:documentId/edit`     |

**Request create** — `multipart/form-data`: campos de `createClubSchema` + `images[]` (0–5).

**Request update** — `multipart/form-data`: campos de `updateClubSchema` + `keepImageIds[]` + `images[]` nuevas.

**Errores (mensaje al usuario en español)**

| HTTP | Cuándo                                | Mensaje                              |
| ---- | ------------------------------------- | ------------------------------------ |
| 400  | Validación / imágenes / IDs inválidos | Mensaje de API                       |
| 401  | Sin sesión                            | Redirigir a login (`_app`)           |
| 404  | Club no encontrado (PATCH)            | _No encontramos el club solicitado._ |
| 500  | Fallo create/update/upload            | Fallbacks actuales del dashboard     |

### Datos

Sin migraciones ni cambios de esquema.

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
├───────────────────────┴──────────────────────────┤
│              Cancelar  |  Registrar/Actualizar   │  ← sticky footer
└──────────────────────────────────────────────────┘
```

**Componentes**

| Componente                        | Responsabilidad                                                           |
| --------------------------------- | ------------------------------------------------------------------------- |
| `club-form.tsx`                   | Formulario compartido (`@tanstack/react-form`, secciones, submit handler) |
| `club-form-page-layout.tsx`       | Header, grid 2 cols, footer sticky, slot para form                        |
| `club-unsaved-changes-dialog.tsx` | `AlertDialog` al salir con `isDirty`                                      |
| `club-create-page.tsx`            | Orquestación modo create                                                  |
| `club-edit-page.tsx`              | Resolver club por `documentId`, modo edit                                 |
| `images-club-form.tsx`            | Sin cambios funcionales                                                   |
| `registered-clubs.tsx`            | `Link` a rutas; quitar `ClubDialogForm`                                   |

**Loader edición**

```ts
loader: ({ context: { queryClient }, params }) =>
  queryClient.ensureQueryData(clubsQueryOptions()).then((clubs) => {
    const club = clubs.find((c) => c.documentId === params.documentId)
    if (!club) throw notFound() // o componente dedicado
    return club
  })
```

**Copy (español)**

| Contexto                    | Texto                                                                      |
| --------------------------- | -------------------------------------------------------------------------- |
| Volver                      | `Volver a clubes`                                                          |
| Título crear                | `Añadir nuevo club`                                                        |
| Descripción crear           | `Completá los datos para registrar un club en la plataforma.`              |
| Título editar               | `Editar club`                                                              |
| Descripción editar          | `Actualizá la información del club. Los cambios se reflejan de inmediato.` |
| Cancelar                    | `Cancelar`                                                                 |
| CTA crear                   | `Registrar club` / pendiente `Registrando…`                                |
| CTA editar                  | `Actualizar club` / pendiente `Actualizando…`                              |
| Toast éxito crear           | `Club registrado correctamente`                                            |
| Toast éxito editar          | `Club actualizado correctamente`                                           |
| Club no encontrado          | `No encontramos el club que querés editar.`                                |
| Diálogo salir — título      | `¿Salir sin guardar?`                                                      |
| Diálogo salir — descripción | `Tenés cambios sin guardar. Si salís ahora, se perderán.`                  |
| Diálogo salir — quedarse    | `Seguir editando`                                                          |
| Diálogo salir — confirmar   | `Salir sin guardar`                                                        |

**Rutas tipadas (`DASHBOARD_ROUTES`)**

```ts
clubManagementNew: () => '/club-management/new'
clubManagementEdit: (documentId: string) => `/club-management/${documentId}/edit`
```

---

## Reglas de negocio

- Misma validación que hoy: `createClubSchema` al enviar; máximo `CLUB_IMAGE_MAX_COUNT` (5) imágenes totales en edición (conservadas + nuevas).
- Solo dueños autenticados bajo `_app`.
- En edición solo clubes presentes en `my-clubs` del dueño actual.
- `isDirty` incluye cambios en campos de texto, estado, imágenes nuevas y eliminación de imágenes existentes en UI.
- Tras create/update exitoso: invalidar query de clubes (mutaciones actuales) y navegar al listado.
- Eliminar club permanece en el listado con `ClubRemoveDialog`.

## Preguntas abiertas

- Ninguna bloqueante para implementar (copy de confirmación definido arriba).
