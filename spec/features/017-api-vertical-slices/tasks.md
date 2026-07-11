# Tasks — Arquitectura de capas (repositorios + API vertical slice)

## Shared packages — `@afterdark/db`

- [x] Carpeta por entidad bajo `repositories/`
- [x] Un archivo kebab-case por función exportada
- [x] `index.ts` por carpeta + barrel raíz
- [x] Eliminar `*.repository.ts` monolíticos

## Shared packages — `@afterdark/types`

- [x] Crear `src/repository/` por dominio
- [x] Exportar desde barrel público
- [x] Subpaths `enums` y consumo de `@afterdark/db/schema` donde aplica

## API — módulo `clubs` (piloto)

- [x] `presentation/clubs.controller.ts`
- [x] Use cases: list, create, update, delete
- [x] `ClubImagesService`, `ClubLookupService`
- [x] `mappers/club.mapper.ts`, `validators/club.validator.ts`
- [x] Eliminar `clubs.service.ts`, `clubs.controller.ts` raíz, `clubs.formatter.ts`
- [x] Actualizar `clubs.module.ts`

## Documentación

- [x] `ARCHITECTURE.md` — convenciones DB, types/repository, API vertical slice
- [x] `spec/constitution/roadmap.md` — entrada 017
- [x] `spec/features/017-api-vertical-slices/spec.md`

## Calidad

- [x] `pnpm --filter @afterdark/api type-check`
- [x] `pnpm lint`
