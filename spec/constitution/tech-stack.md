# Tech stack

> Tecnologías y convenciones del monorepo.

## Apps

| App         | Stack                                 | Puerto |
| ----------- | ------------------------------------- | ------ |
| `api`       | NestJS 11, Express, Drizzle           | 3000   |
| `web`       | TanStack Start, React 19, Tailwind v4 | 3001   |
| `dashboard` | TanStack Start, React 19, Tailwind v4 | 3002   |

## Packages compartidos

| Package                 | Responsabilidad                                          |
| ----------------------- | -------------------------------------------------------- |
| `@afterdark/db`         | Schema Drizzle, repositories, migraciones (Turso/libSQL) |
| `@afterdark/types`      | Tipos de dominio e interfaces API                        |
| `@afterdark/validators` | Schemas Zod (v4)                                         |
| `@afterdark/ui`         | Componentes ShadCN compartidos                           |

## Convenciones obligatorias

- **Validación:** Zod en `@afterdark/validators`; pipes `ZodValidationPipe` en API.
- **DB:** queries solo en `packages/db/src/repositories/`; servicios NestJS no importan `db` directo.
- **Constantes:** maps `SCREAMING_SNAKE_CASE` con `as const`; sin magic strings.
- **Lint / format:** oxlint + oxfmt; pre-commit en archivos staged.
- **Rutas TanStack:** literal en `createFileRoute`; constantes solo para navegación.
- **UI:** copy en español; identificadores en inglés.

## Almacenamiento de archivos

- `files-sdk` + Cloudflare R2 (`apps/api/src/modules/files/`).
- Variables: ver `packages/validators/src/upload.ts` y `apps/api/.env`.

## Comandos habituales

```bash
pnpm dev              # web + dashboard + api
pnpm dev:api          # solo API
pnpm type-check
pnpm lint && pnpm format:check
```

## Referencias

- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [STYLEGUIDE.md](../../STYLEGUIDE.md)
- [AGENTS.md](../../AGENTS.md)
