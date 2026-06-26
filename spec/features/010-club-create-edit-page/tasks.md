# Tasks — Pantallas create/edit club

> Checklist de tareas. Marcar `[x]` al completar.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [ ] _(N/A — sin cambios en validators, types, db, api)_

## Dashboard — constants

- [ ] Agregar `clubManagementNew` y `clubManagementEdit` en `routes.ts`
- [ ] Crear `club.copy.ts` con copy de spec

## Dashboard — componentes

- [ ] Crear `club-form.tsx` (extraer de `dialog-form.tsx`, layout 2 columnas)
- [ ] Crear `club-form-page-layout.tsx` (header, footer sticky)
- [ ] Crear `club-unsaved-changes-dialog.tsx`
- [ ] Crear `club-create-page.tsx`
- [ ] Crear `club-edit-page.tsx` (+ estado not found)
- [ ] Actualizar `registered-clubs.tsx` (links, quitar dialog create/edit)
- [ ] Eliminar `dialog-form.tsx`
- [ ] (Opcional) `club-form.mapper.ts` para mapeos de valores iniciales

## Dashboard — rutas

- [ ] Crear `routes/_app/club-management/new.tsx`
- [ ] Crear `routes/_app/club-management/$documentId/edit.tsx` con loader
- [ ] Verificar `routeTree.gen.ts` regenerado vía `pnpm dev:dashboard`

## Calidad

- [ ] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] `pnpm format` (o pre-commit)
- [ ] Verificación manual según `plan.md`
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`
