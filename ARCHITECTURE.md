# ARCHITECTURE.md — afterdark Monorepo

Technical architecture of the afterdark monorepo: apps, packages, modules, routes, and data flow.

---

## Overview

The monorepo hosts two full-stack SSR applications and a REST API that share internal workspace packages:

| App         | Purpose                                        | Port |
| ----------- | ---------------------------------------------- | ---- |
| `web`       | Public webfront — catalog and product detail   | 3001 |
| `dashboard` | Admin panel — catalog and inventory management | 3002 |
| `api`       | Backend REST API — NestJS + TypeORM            | 3000 |

---

## Project structure

```
afterdark/
├── .husky/
│   └── pre-commit              # pnpm lint-staged
├── apps/
│   ├── web/                  # Public app (clients)
│   │   ├── app/
│   │   │   ├── modules/        # ← Feature modules (canonical code location)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── mutations/
│   │   │   │   │   ├── queries/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── types/
│   │   │   │   │   └── utils/
│   │   │   │   ├── properties/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── property-card.tsx
│   │   │   │   │   │   └── property-filter-form.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── mutations/
│   │   │   │   │   ├── queries/
│   │   │   │   │   │   └── use-properties.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── property.service.ts
│   │   │   │   │   ├── types/
│   │   │   │   │   └── utils/
│   │   │   │   └── common/     # Cross-module shared code (same sub-structure)
│   │   │   ├── routes/
│   │   │   │   ├── __root.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── properties/
│   │   │   │       ├── index.tsx   # /properties
│   │   │   │       └── $id.tsx     # /properties/:id
│   │   │   └── router.tsx
│   │   ├── app.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   └── package.json
│   │
│   ├── dashboard/              # Admin panel
│   │   ├── app/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── properties/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── mutations/
│   │   │   │   │   │   └── use-property-mutations.ts
│   │   │   │   │   ├── queries/
│   │   │   │   │   │   └── use-properties.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── property.service.ts
│   │   │   │   │   ├── types/
│   │   │   │   │   └── utils/
│   │   │   │   └── common/
│   │   │   ├── routes/
│   │   │   │   ├── __root.tsx
│   │   │   │   ├── index.tsx       # redirects → /properties
│   │   │   │   └── properties/
│   │   │   │       ├── index.tsx   # /properties
│   │   │   │       ├── new.tsx     # /properties/new
│   │   │   │       └── $id/
│   │   │   │           └── edit.tsx  # /properties/:id/edit
│   │   │   └── router.tsx
│   │   ├── app.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   └── package.json
│   │
│   └── api/                    # NestJS REST API
│       ├── src/
│       │   ├── modules/        # Domain modules
│       │   │   ├── auth/
│       │   │   ├── categories/
│       │   │   │   ├── categories.controller.ts
│       │   │   │   ├── categories.module.ts
│       │   │   │   ├── categories.service.ts
│       │   │   │   └── index.ts
│       │   │   ├── health/
│       │   │   ├── orders/
│       │   │   ├── users/
│       │   │   └── index.ts
│       │   ├── common/         # Infra helpers
│       │   │   ├── config/
│       │   │   ├── filters/
│       │   │   ├── lib/
│       │   │   ├── pipes/
│       │   │   ├── index.ts
│       │   │   └── common.module.ts
│       │   ├── templates/      # React Email templates
│       │   ├── app.controller.ts
│       │   ├── app.controller.spec.ts
│       │   ├── app.module.ts
│       │   └── main.ts
│       └── package.json
│
└── packages/
    ├── ui/                     # Shared ShadCN components
    │   ├── src/
    │   │   ├── components/ui/  # button, input, label, card, badge, separator, select
    │   │   ├── lib/utils.ts    # cn() helper
    │   │   └── globals.css     # CSS variables + Tailwind base
    │   ├── tailwind.config.ts  # Base Tailwind config (apps extend this)
    │   └── components.json     # ShadCN CLI config
    │
    ├── db/                     # Drizzle data layer (Turso / libSQL)
    │   └── src/
    │       ├── schema/
    │       │   ├── base.ts     # baseColumns: id (UUID), createdAt, updatedAt
    │       │   ├── user.ts
    │       │   └── property.ts
    │       ├── config/
    │       │   └── env.server.ts        # serverEnv (validated process.env)
    │       └── index.ts                 # db client (drizzle + @libsql/client)
    │
    ├── validators/             # Shared Zod schemas
    │   └── src/
    │       ├── common.ts       # paginationSchema, uuidSchema
    │       ├── auth.ts         # loginSchema, registerSchema
    │       ├── user.ts         # createUserSchema, updateUserSchema
    │       └── property.ts     # createPropertySchema, updatePropertySchema, filterPropertySchema
    │
    └── types/                  # Shared TypeScript interfaces
        └── src/
            ├── domain.ts       # User, Property and their enums
            ├── api.ts          # ApiResponse, ApiError
            └── pagination.ts   # PaginationParams, PaginatedResponse
```

---

## Apps Documentation

### `apps/api` (NestJS + Drizzle ORM)

#### Stack

- NestJS 11 (`@nestjs/*`)
- Drizzle ORM + Turso (`@afterdark/db`, `@libsql/client`)
- Validation: Zod (via shared schemas) + custom `ZodValidationPipe`
- Auth: JWT + refresh sessions persisted in DB
- Email: Resend + React Email templates

#### Structure

- `src/modules/*` domain modules (`auth`, `categories`, `users`, `orders`, `health`) — each module exposes `*.module.ts`, `*.controller.ts`, `*.service.ts` and re-exports via `index.ts`
- `src/common/*` infra helpers (`config`, `filters`, `pipes`, `lib`) wired through `common.module.ts`
- `src/templates/` React Email templates
- `src/app.module.ts` root module; `src/main.ts` bootstrap

#### Database conventions

- Schemas live in `packages/db/src/schema/` (`sqliteTable`) — the API consumes them via `@afterdark/db`.
- In development, `drizzle-kit push` may sync schema changes; for production prefer migrations.

#### API conventions

- Use contracts from `@repo/shared`, never duplicate request/response shapes locally.
- Keep validation at controller boundary with Zod schemas.
- Keep business logic in services, not controllers.
- Avoid logging secrets/tokens/plain passwords.

---

## Module architecture

Each feature module inside `app/modules/<module>/` follows this layout:

| Folder        | Responsibility                                                             | Type                 |
| ------------- | -------------------------------------------------------------------------- | -------------------- |
| `services/`   | TanStack Start server functions (`createServerFn`). **Server-side only.**  | `*.service.ts`       |
| `queries/`    | TanStack Query hooks for **GET** data (`useSuspenseQuery`, `queryOptions`) | `use-*.ts`           |
| `mutations/`  | TanStack Query hooks for **writes** (POST / PUT / PATCH / DELETE)          | `use-*-mutations.ts` |
| `components/` | React components scoped to this module                                     | `*.tsx`              |
| `hooks/`      | Generic React hooks that don't fit queries or mutations                    | `use-*.ts`           |
| `types/`      | Module-local TypeScript types not shared across packages                   | `*.types.ts`         |
| `utils/`      | Pure helper functions                                                      | `*.utils.ts`         |

`modules/common/` follows the exact same structure and holds code shared **between modules** within the same app.

### Import rules

```
routes/
  └── imports from ──▶ modules/<module>/queries
                       modules/<module>/mutations
                       modules/<module>/components
                       modules/<module>/services   (server fns)
                       modules/common/...
                       @afterdark/ui
                       @afterdark/validators
                       @afterdark/types

modules/<module>/
  └── must NOT import from other sibling modules
      → move shared code to modules/common/ instead
```

---

## Routes

### web (`apps/web`)

| File                          | URL               | Description                   |
| ----------------------------- | ----------------- | ----------------------------- |
| `routes/index.tsx`            | `/`               | Landing page                  |
| `routes/properties/index.tsx` | `/properties`     | Property listing with filters |
| `routes/properties/$id.tsx`   | `/properties/:id` | Property detail               |

### Dashboard (`apps/dashboard`)

| File                             | URL                    | Description                |
| -------------------------------- | ---------------------- | -------------------------- |
| `routes/index.tsx`               | `/`                    | Redirects to `/properties` |
| `routes/properties/index.tsx`    | `/properties`          | Admin property table       |
| `routes/properties/new.tsx`      | `/properties/new`      | Create property form       |
| `routes/properties/$id/edit.tsx` | `/properties/:id/edit` | Edit property form         |

### Route conventions

- `$param` in a filename → dynamic URL segment.
- `__root.tsx` → root layout, uses `createRootRouteWithContext<RouterContext>()`.
- Router context **always** carries `queryClient: QueryClient`.
- Route loaders prefetch with `queryClient.prefetchQuery()` or `ensureQueryData()`.
- Search params are validated: `validateSearch: (s) => schema.parse(s)`.

### Route constants

To avoid hardcoding route strings across the app and prevent subtle mistakes like `"/catalog"` vs `"/catalog/"`, each app keeps route paths centralized in:

- `apps/<name>/app/modules/common/constants/routes.ts` (`WEB_ROUTES`, etc.)

Use these constants for **navigation** (`Link`, `navigate`, redirects). TanStack Router codegen requires a **string literal** in `createFileRoute` — do not pass `WEB_ROUTES.*()` there.

```ts
// Route file — literal path required for route tree generation
export const Route = createFileRoute("/catalog/")({ ... })

// Navigation — centralized paths
<Link to={WEB_ROUTES.catalog()} />
```

---

## Layer patterns

### Services

```ts
// modules/<m>/services/property.service.ts
export const getPropertiesFn = createServerFn({ method: 'GET' })
  .validator(filterPropertySchema.merge(paginationSchema))
  .handler(async ({ data }) => {
    const { page, limit, ...filters } = data
    return PropertyRepository.findWithFilters(filters, page, limit)
  })
```

### Queries

Export a `queryOptions` factory (used by loaders) and a `useSuspenseQuery` hook (used inside `<Suspense>`).

```ts
// modules/<m>/queries/use-properties.ts
export const propertiesQueryOptions = (params = { page: 1, limit: 10 }) =>
  queryOptions({
    queryKey: ['properties', params],
    queryFn: () => getPropertiesFn({ data: params }),
  })

export function useProperties(params?) {
  return useSuspenseQuery(propertiesQueryOptions(params))
}
```

Query key pattern: `['entity']` | `['entity', id]` | `['entity', filters]`.

### Mutations

```ts
// modules/<m>/mutations/use-property-mutations.ts
export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return async (id: string) => {
    await deletePropertyFn({ data: { id } })
    await queryClient.invalidateQueries({ queryKey: ['properties'] })
  }
}
```

### Forms

TanStack Form + Zod adapter. Schema always from `@afterdark/validators`.

```ts
const form = useForm<CreatePropertyInput>({
  validatorAdapter: zodValidator(),
  validators: { onSubmit: createPropertySchema },
  onSubmit: async ({ value }) => { ... },
})
// Field errors: field.state.meta.errors[0]
```

---

## Shared packages

### `@afterdark/ui`

To add a ShadCN component:

```bash
cd packages/ui && pnpm dlx shadcn@latest add <name>
# then export it from packages/ui/src/index.ts
```

Apps import CSS in `__root.tsx`:

```ts
import '@afterdark/ui/globals.css'
```

Apps extend the shared Tailwind config and include the UI package in `content`:

```ts
// apps/*/tailwind.config.ts
export default {
  ...sharedConfig,
  content: ['./app/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
}
```

### `@afterdark/db`

Entities extend `BaseAppEntity` (UUID PK, `createdAt`, `updatedAt`). `reflect-metadata` is imported once in `packages/db/src/index.ts`. `synchronize: true` in development only — use migrations in production.

### `@afterdark/validators`

Single source of truth for Zod schemas. Never redefine locally what already exists here.

### `@afterdark/types`

Single source of truth for domain TypeScript interfaces.

---

## Environment variables

File: `.env` at the repo root (copy from `.env.example`). Both apps load it via Vite `envDir`.

| Variable             | Description                                  | Default                                |
| -------------------- | -------------------------------------------- | -------------------------------------- |
| `TURSO_DATABASE_URL` | Turso database URL (`libsql://…` or `file:`) | `file:../../local.db` (repo root, dev) |
| `TURSO_AUTH_TOKEN`   | Turso auth token (not needed for `file:`)    | —                                      |
| `NODE_ENV`           | Environment                                  | `development`                          |

Validation (Zod) runs at startup:

- `app/config/env.ts` — client (`import.meta.env`; `VITE_*` when added)
- `packages/validators/src/database.ts` — Zod schemas for `TURSO_*` and `NODE_ENV`
- `packages/db/src/config/env.server.ts` — parses `process.env` and exports `serverEnv` (used by the db client)
- `app/config/env.server.ts` — re-exports `@afterdark/db/config/env.server`; import from `*-data.server.ts` only

---

## How to add a new feature

### New entity

1. `packages/db/src/entities/<name>.entity.ts` — extend `BaseAppEntity`
2. Register in `AppDataSource` entities array
3. `packages/db/src/repositories/<name>.repository.ts`
4. Export from `entities/index.ts` and `repositories/index.ts`
5. `packages/validators/src/<name>.ts` — Zod schemas
6. `packages/types/src/domain.ts` — TypeScript interfaces

### New module

1. Create `app/modules/<module>/` with all sub-folders
2. `services/<name>.service.ts` — server functions
3. `queries/use-<name>.ts` — queryOptions + suspense hooks
4. `mutations/use-<name>-mutations.ts` — write hooks
5. `components/<name>.tsx` — UI components
6. Add routes under `app/routes/<module>/`

### New shared UI component

1. `packages/ui/src/components/ui/<name>.tsx`
2. Export from `packages/ui/src/index.ts`
