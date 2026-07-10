# ARCHITECTURE.md — afterdark Monorepo

Apps, packages, and data-flow conventions.

---

## Apps

| App         | Role                                      | Port |
| ----------- | ----------------------------------------- | ---- |
| `web`       | Public client (auth, discover / buy)      | 3001 |
| `dashboard` | Owner/staff panel (clubs, events, …)      | 3002 |
| `api`       | NestJS REST API + Drizzle (`@afterdark/db`) | 3000 |

```
apps/
├── web/app/{config,modules,routes}
├── dashboard/app/{config,modules,routes}
└── api/src/{modules,app.module.ts,main.ts}

packages/
├── common/      # QueryFactory, API_PREFIX, API_ROUTES, buildApiPath
├── db/          # schema + repositories
├── validators/  # Zod schemas
├── types/       # enums + DTOs
├── ui/          # ShadCN + files-sdk
└── i18n/        # locales
```

---

## Data flow

```
UI → queries/mutations → services → QueryFactory → Nest API → repositories → DB
```

1. `app/config/api.ts` creates `QueryFactory(API_URL)` (`API_URL = VITE_API_URL + /` + `API_PREFIX`).
2. Services call `api.*` with `buildApiPath(API_ROUTES.*, path)` — never hardcode `/api/...`.
3. Auth may wrap the same calls in `createServerFn`.
4. Nest `main.ts` uses `app.setGlobalPrefix(API_PREFIX)` from `@afterdark/common` (same constant).
5. API services use `@afterdark/db` repositories only — no direct `db` queries in Nest services.
6. Contracts from `@afterdark/types` / `@afterdark/validators`; copy from `@afterdark/i18n`.

Session: Zustand store + `GET /session/me`. Guards: `RequireGuest`, `RequireSession`, `RolesGuard`.

---

## Frontend modules

`app/modules/<feature>/` — use only the folders you need:

| Folder | Role |
| ------ | ---- |
| `services/` | API wrappers (`QueryFactory` or `createServerFn`) |
| `queries/` / `mutations/` | TanStack Query |
| `components/`, `hooks/`, `stores/`, `utils/`, `constants/` | UI / local helpers |

- Routes import from modules; modules **must not** import sibling modules → share via `modules/common/`.
- Navigation paths: `WEB_ROUTES` / `DASHBOARD_ROUTES` in `modules/common/constants/routes.ts`.
- `createFileRoute` needs a **string literal**; use route constants only for `Link` / `navigate`.
- Dashboard authenticated pages live under `routes/_app/`.

---

## Packages (rules)

| Package | Rule |
| ------- | ---- |
| `@afterdark/common` | Single source for `API_PREFIX`, `API_URL`, `API_ROUTES`, `QueryFactory` |
| `@afterdark/db` | `schema/` + `repositories/<domain>/` (one fn per file); migrations in prod |
| `@afterdark/validators` | All Zod schemas; do not redefine in apps |
| `@afterdark/types` | `enums/` + `dto/`; import only from package barrel |
| `@afterdark/ui` | ShadCN in `packages/ui`; export from package index |
| `@afterdark/i18n` | Shared locales / i18next |

---

## Env

Root `.env`. Main vars: `VITE_API_URL`, `TURSO_*`, `NODE_ENV`, `PORT`, `JWT_SECRET`, `DASHBOARD_URL`, `CORS_ALLOWED_ORIGINS`.

Validated at startup (`validators` + app/`common`/`db` env modules). `API_PREFIX` is a **code constant**, not env.

---

## Adding work

| Task | Where |
| ---- | ----- |
| New entity | `db` schema → repos → validators → types → `api` module → `API_ROUTES` → app service |
| New endpoint | repo → Nest service/controller → optional `API_ROUTES` + frontend service |
| New UI module | `app/modules/<name>/` + routes (`_app/` if authenticated dashboard) |
| New ShadCN | `cd packages/ui && pnpm dlx shadcn@latest add <name>` |
