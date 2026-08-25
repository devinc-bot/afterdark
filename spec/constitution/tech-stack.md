# Tech stack

> Tecnologías y convenciones del monorepo.

## Apps

| App         | Stack                                 | Puerto |
| ----------- | ------------------------------------- | ------ |
| `api`       | NestJS 11, Express, Drizzle           | 3000   |
| `web`       | TanStack Start, React 19, Tailwind v4 | 3001   |
| `dashboard` | TanStack Start, React 19, Tailwind v4 | 3002   |

## Packages compartidos

| Package            | Responsabilidad                                             |
| ------------------ | ----------------------------------------------------------- |
| `@repo/db`         | Schema Drizzle, repositories, migraciones (Neon PostgreSQL) |
| `@repo/types`      | Tipos de dominio e interfaces API                           |
| `@repo/validators` | Schemas Zod (v4)                                            |
| `@repo/ui`         | Componentes ShadCN compartidos                              |

## Convenciones obligatorias

- **Validación:** Zod en `@repo/validators`; pipes `ZodValidationPipe` en API.
- **DB:** queries solo en `packages/db/src/repositories/`; servicios NestJS no importan `db` directo.
- **Constantes:** maps `SCREAMING_SNAKE_CASE` con `as const`; sin magic strings.
- **Lint / format:** oxlint + oxfmt; pre-commit en archivos staged.
- **Rutas TanStack:** literal en `createFileRoute`; constantes solo para navegación.
- **UI:** copy en español; identificadores en inglés.

## Almacenamiento de archivos

- `files-sdk` + Cloudflare R2 (`apps/api/src/modules/files/`).
- Variables: ver `packages/validators/src/upload.ts` y `apps/api/.env`.

## Correo (transaccional)

- Puerto `MailSender` + adaptador Resend (`apps/api/src/modules/mail/`).
- Templates: React Email (`react-email`); copy en namespace i18n `emails`.
- Variables: `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_SMOKE_TO` (opcional; ver `packages/validators/src/mail.ts`).
- Humo: `pnpm --filter @repo/api mail:smoke` (solo development).

## Comandos habituales

```bash
pnpm dev              # web + dashboard + api
pnpm dev:api          # solo API
pnpm type-check
pnpm lint && pnpm format:check
```

## Referencias

- [STYLEGUIDE.md](../../STYLEGUIDE.md)
- [AGENTS.md](../../AGENTS.md)
