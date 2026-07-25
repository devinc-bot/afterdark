# Arquitectura de capas (repositorios + API vertical slice)

| Campo      | Valor                                       |
| ---------- | ------------------------------------------- |
| **ID**     | `017-api-vertical-slices`                   |
| **Status** | `done`                                      |
| **Apps**   | `packages/db`, `packages/types`, `apps/api` |

---

## Qué hace

Estandariza tres convenciones transversales del monorepo:

1. **Repositorios Drizzle** — carpeta por entidad, un archivo por función exportada.
2. **Tipos de repositorio** — shapes de filas/joins en `packages/types/src/repository/`.
3. **Módulos API** — vertical slice por dominio: `presentation/` (HTTP), `application/` (use cases), `mappers/`, `validators/`.

`clubs` es el módulo piloto del patrón API.

## Por qué

Los archivos `*.repository.ts` monolíticos y los `*.service.ts` con toda la lógica dificultan navegar y testear. Separar queries, tipos de fila y casos de uso reduce acoplamiento sin introducir capas extra (no Clean Architecture, no repos en API).

## Alcance

### Incluye

- `packages/db/src/repositories/<entity>/` con un archivo kebab-case por función y `index.ts` que re-exporta.
- `packages/types/src/repository/<entity>.ts` para tipos usados por repositorios (joins, rows).
- Subpath `@repo/db/schema` y `@repo/types/enums` para romper dependencias circulares.
- Módulo `apps/api/src/modules/clubs/` refactorizado:
  - `presentation/clubs.controller.ts`
  - `application/*-club.use-case.ts` + `application/services/`
  - `mappers/club.mapper.ts`, `validators/club.validator.ts`
- Actualización de `ARCHITECTURE.md` con las nuevas convenciones.

### No incluye

- Migrar otros módulos API (`tickets`, `staff`, `settings`, …) — siguen con `*.service.ts` hasta una entrega futura.
- Cambios de rutas HTTP, guards, schemas Zod ni mensajes de error.
- Repositorios en la capa API ni entidades de dominio NestJS.

---

## User stories

### US-1: Repositorios navegables

**Como** desarrollador  
**Quiero** encontrar cada query en su propio archivo bajo la carpeta de la entidad  
**Para** modificar una operación sin abrir un repository de 300 líneas

**Criterios de aceptación**

- [x] **Dado** `findClubIdByDocumentId`, **cuando** busco su implementación, **entonces** está en `packages/db/src/repositories/clubs/find-club-id-by-document-id.ts`.
- [x] **Dado** un import desde `@repo/db`, **cuando** consumo la función, **entonces** no cambia la firma pública.

### US-2: Tipos de fila centralizados

**Como** desarrollador  
**Quiero** tipos de join/row de repositorio en `@repo/types`  
**Para** reutilizarlos en API formatters sin duplicar shapes

**Criterios de aceptación**

- [x] **Dado** `OwnerStaffPersonnelRow`, **cuando** lo importo en API, **entonces** sale de `@repo/types`.
- [x] **Dado** un schema Drizzle, **cuando** un tipo de repositorio lo necesita, **entonces** importa `*Select` desde `@repo/db/schema`.

### US-3: Clubs como vertical slice

**Como** desarrollador API  
**Quiero** que el módulo `clubs` separe controller, use cases y utils  
**Para** seguir el mismo layout al agregar endpoints

**Criterios de aceptación**

- [x] **Dado** `GET /clubs/my-clubs`, **cuando** reviso el código, **entonces** el controller delega a `ListMyClubsUseCase.execute()`.
- [x] **Dado** el refactor, **cuando** ejecuto los mismos flujos de clubes, **entonces** rutas, status HTTP y errores i18n no cambian.

---

## Contratos

### API — sin cambios de contrato HTTP

| Método | Ruta                     | Auth        | Use case             |
| ------ | ------------------------ | ----------- | -------------------- |
| GET    | `/api/clubs/my-clubs`    | JWT + owner | `ListMyClubsUseCase` |
| POST   | `/api/clubs/create`      | JWT         | `CreateClubUseCase`  |
| PATCH  | `/api/clubs/:documentId` | JWT         | `UpdateClubUseCase`  |
| DELETE | `/api/clubs/:documentId` | JWT         | `DeleteClubUseCase`  |

### Layout API (módulo piloto `clubs`)

```text
apps/api/src/modules/clubs/
├── presentation/
│   └── clubs.controller.ts      # HTTP, guards, Zod pipes
├── application/
│   ├── list-my-clubs.use-case.ts
│   ├── create-club.use-case.ts
│   ├── update-club.use-case.ts
│   ├── delete-club.use-case.ts
│   └── services/
│       ├── club-images.service.ts   # R2 + assets DB
│       └── club-lookup.service.ts   # requireOwnerId / requireClubId
├── mappers/club.mapper.ts         # row → DTO
├── validators/club.validator.ts   # reglas puras (límites de imágenes)
└── clubs.module.ts
```

### Layout repositorios

```text
packages/db/src/repositories/clubs/
├── find-club-id-by-document-id.ts
├── create-club-with-address.ts
└── index.ts                       # re-export barrel de la carpeta
```

### Reglas

- **DB:** sin NestJS ni excepciones HTTP en repositorios; retornar `null` cuando falte fila.
- **API use cases:** orquestan `@repo/db`, `FilesService` y `TranslationService`; mapean errores a HTTP.
- **Controller:** solo validación de entrada y delegación a `execute()`.
- **Mappers** en `mappers/`; **validators** en `validators/` (funciones puras). Servicios NestJS solo cuando hay dependencias inyectadas (`application/services/`).

## Preguntas abiertas

- ¿Migrar `tickets` o `settings` como segundo piloto? (fuera de alcance actual)
