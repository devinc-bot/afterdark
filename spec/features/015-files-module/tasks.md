# Tasks — Módulo de archivos

> Checklist de tareas. Marcar `[x]` al completar. Orden sugerido de arriba a abajo.

## Spec & plan

- [ ] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [ ] `spec.md` completo y en status `approved`
- [ ] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [ ] Schemas en `@repo/validators` (si aplica)
- [ ] Códigos/mensajes en `@repo/i18n` (si aplica)

## API

- [ ] Cambios en `apps/api/src/modules/files/`
- [ ] Actualizar consumidores si cambia el contrato de `FilesService`

## Calidad

- [ ] `pnpm type-check`
- [ ] `pnpm lint`
- [ ] `pnpm format` (o pre-commit)
- [ ] Verificación manual según `plan.md`
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md`
