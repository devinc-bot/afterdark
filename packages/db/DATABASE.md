# Database

`@repo/db` owns PostgreSQL persistence on Neon.

## Structure

- Schemas: `src/schema/`
- Repositories: `src/repositories/`
- Migrations: `src/migrations-postgresql/`
- Runtime client: `src/client.ts`
- Seeds: `src/seed/`

Schemas use Drizzle `pgTable`. Tables use internal integer `id` foreign keys and public UUID `documentId` values. Use `documentId` in API and JWT contracts.

All API database access belongs in repositories. NestJS services import repository functions from `@repo/db`; they do not query `db` directly.

## Connections

| Variable                 | Purpose                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `DATABASE_URL`           | Pooled Neon URL for application runtime                            |
| `DATABASE_MIGRATION_URL` | Direct Neon URL for migrations, seeds, and administrative commands |

## Commands

Run from `packages/db`.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:seed:development
pnpm db:seed:production
pnpm db:studio
```

`db:seed:production` creates roles and the configured admin account. `db:seed:development` additionally creates non-production fixtures. Both are idempotent.

Use `@repo/validators` before persistence and keep API DTOs and enums in `@repo/types`.
