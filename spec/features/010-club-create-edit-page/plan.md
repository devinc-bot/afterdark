# Plan de implementación — Pantallas create/edit club

> Complementa [spec.md](./spec.md). Status spec: `approved`.

## Orden de capas

```text
1. apps/dashboard — constants (DASHBOARD_ROUTES, CLUB_COPY)
2. apps/dashboard — extraer club-form + layout + unsaved dialog
3. apps/dashboard — rutas new + edit (loaders)
4. apps/dashboard — registered-clubs (navegación, quitar dialog-form)
5. apps/dashboard — eliminar dialog-form.tsx
6. pnpm dev:dashboard → codegen routeTree.gen.ts
```

Sin cambios en `@afterdark/validators`, `@afterdark/types`, `packages/db` ni `apps/api`.

## Archivos a crear / modificar

### Dashboard — constants

| Archivo                                              | Cambio                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| `app/modules/common/constants/routes.ts`             | `clubManagementNew()`, `clubManagementEdit(documentId)`        |
| `app/modules/club-management/constants/club.copy.ts` | **Nuevo** — copy de páginas, footer, unsaved dialog, not found |

### Dashboard — club-management module

| Archivo                                      | Cambio                                                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `components/club-form.tsx`                   | **Nuevo** — lógica de `ClubDialogFormInner` sin Dialog; grid 2 cols en `lg+`                                   |
| `components/club-form-page-layout.tsx`       | **Nuevo** — header con `Link` volver, título, descripción, footer sticky                                       |
| `components/club-unsaved-changes-dialog.tsx` | **Nuevo** — `AlertDialog` controlado                                                                           |
| `components/club-create-page.tsx`            | **Nuevo** — modo create, valores vacíos, navigate on success                                                   |
| `components/club-edit-page.tsx`              | **Nuevo** — recibe club del loader, not found UI                                                               |
| `components/registered-clubs.tsx`            | Quitar estado dialog create/edit; `Link`/`navigate` a rutas nuevas                                             |
| `components/dialog-form.tsx`                 | **Eliminar** tras migrar                                                                                       |
| `utils/club-form.mapper.ts`                  | **Nuevo** (opcional) — `clubResponseToFormValues`, `registeredClubToFormValues` (mover desde registered-clubs) |

### Dashboard — routes

| Archivo                                                | Cambio                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `app/routes/_app/club-management/new.tsx`              | **Nuevo** — `createFileRoute('/_app/club-management/new')`, render `ClubCreatePage` |
| `app/routes/_app/club-management/$documentId/edit.tsx` | **Nuevo** — loader `ensureQueryData(clubsQueryOptions)` + resolver club             |
| `app/routes/_app/club-management.tsx`                  | Sin cambios funcionales (sigue siendo listado) o `head` meta si aplica              |

## Diseño técnico

### Formulario compartido

- Extraer de `dialog-form.tsx`: `ClubFormField`, `FormSection`, `sanitizeNonNegativeDigits`, `EMPTY_CLUB_FORM_VALUES`, submit con `FormData` (create/update).
- Props: `mode: 'create' | 'edit'`, `clubDocumentId?`, `defaultValues`, `onSuccess`, `onDirtyChange?`.
- Layout interno:

```tsx
<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
  <div className="flex flex-col gap-8">{/* Información general + Ubicación */}</div>
  <div>{/* Imágenes */}</div>
</div>
```

### Dirty state y salida

- `@tanstack/react-form` `form.state.isDirty` + tracking de cambios en `existingImages` / `clubImg` (si el form no los marca dirty, comparar con snapshot inicial en `useEffect` o `Subscribe`).
- `ClubFormPageLayout` recibe `isDirty` y `onNavigateAway: () => void`.
- Botón _Volver_, _Cancelar_ y `useBlocker` (TanStack Router) cuando `isDirty` → abrir `ClubUnsavedChangesDialog`.
- Al confirmar salida: `navigate({ to: DASHBOARD_ROUTES.clubManagement() })`.

### Edición — datos

```text
loader (edit)
  └─ ensureQueryData(clubsQueryOptions)
       └─ find by documentId
            ├─ found → ClubEditPage + defaultValues
            └─ missing → NotFound UI (sin throw si se prefiere UI inline)
```

### Listado

- _Agregar club_ → `<Link to={DASHBOARD_ROUTES.clubManagementNew()}>`.
- _Editar_ en fila → `navigate({ to: DASHBOARD_ROUTES.clubManagementEdit(club.id) })`.
- Eliminar: sin cambios (`ClubRemoveDialog`).

### Flujo post-guardado

```text
submit OK → toast → invalidateQueries (mutation actual) → navigate('/club-management')
```

## Riesgos / edge cases

| Caso                                        | Comportamiento esperado                                       |
| ------------------------------------------- | ------------------------------------------------------------- |
| Editar con `documentId` ajeno o inexistente | UI not found + volver al listado                              |
| Cache de clubes vacío/stale en edit         | Loader espera query; si no está el club tras fetch, not found |
| Usuario agrega imágenes y cancela           | Diálogo unsaved; al salir no se sube nada                     |
| Usuario quita imagen existente y cancela    | `isDirty` true; confirmación al salir                         |
| Submit con red lenta                        | Footer `loading` en CTA; deshabilitar Cancelar                |
| `routeTree.gen.ts`                          | Regenerar con `pnpm dev:dashboard`; no editar a mano          |

## Verificación manual

| Paso                                   | Resultado esperado                                                |
| -------------------------------------- | ----------------------------------------------------------------- |
| 1. `/club-management` → _Agregar club_ | Navega a `/club-management/new`, sin modal                        |
| 2. Completar y guardar club nuevo      | Toast éxito, vuelve al listado, club visible                      |
| 3. _Editar_ en un club                 | `/club-management/:id/edit`, datos precargados, 2 cols en desktop |
| 4. Quitar imagen + guardar             | Imagen desaparece del listado tras refresh                        |
| 5. Cambiar campo + _Cancelar_          | Diálogo unsaved; _Seguir editando_ mantiene datos                 |
| 6. Cambiar campo + _Salir sin guardar_ | Vuelve al listado sin PATCH                                       |
| 7. URL edit inválida                   | Mensaje not found                                                 |
| 8. Eliminar club desde listado         | `ClubRemoveDialog` sigue OK                                       |
| 9. `pnpm type-check` + `pnpm lint`     | Sin errores en dashboard                                          |
