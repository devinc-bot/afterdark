# ARCHITECTURE.md — Repo Monorepo

Apps, packages, and data-flow conventions.

---

## Apps

| App         | Role                                   | Port |
| ----------- | -------------------------------------- | ---- |
| `web`       | Public client (auth, discover / buy)   | 3001 |
| `dashboard` | Owner/staff panel (clubs, events, …)   | 3002 |
| `admin`     | Platform admin panel (seeded accounts) | 3003 |
| `api`       | NestJS REST API + Drizzle (`@repo/db`) | 3000 |

```
apps/
├── web/app/{config,modules,routes}
├── dashboard/app/{config,modules,routes}
├── admin/app/{config,modules,routes}
└── api/src/{modules,app.module.ts,main.ts}

packages/
├── common/      # QueryFactory, API_PREFIX, API_ROUTES, buildApiPath
├── db/          # schema + repositories
├── validators/  # Zod schemas (domain + src/env/)
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
4. Nest `main.ts` uses `app.setGlobalPrefix(API_PREFIX)` from `@repo/common` (same constant).
5. API services use `@repo/db` repositories only — no direct `db` queries in Nest services.
6. Contracts from `@repo/types` / `@repo/validators`; copy from `@repo/i18n`.

Session: Zustand store + `GET /session/me`. Guards: `RequireGuest`, `RequireSession`, `RolesGuard`; `apps/admin` uses `RequireAdminSession` to require `USER_ROLE.ADMIN`.

---

## API modules (NestJS)

- NestJS 11 (`@nestjs/*`)
- Drizzle ORM + Turso (`@repo/db`, `@libsql/client`)
- Validation: Zod (via shared schemas) + custom `ZodValidationPipe`
- Auth: JWT + refresh sessions persisted in DB
- Email: Resend + React Email templates (`modules/mail/`)

### Structure

- `src/modules/*` domain modules — each exposes `*.module.ts` and re-exports via `index.ts`
- **Vertical slice (standard for all domain modules):** `presentation/` (controller, if HTTP), `application/` (use cases + module services), optional `mappers/` / `validators/` / `adapters/` / `types/` / `utils/`.
- `src/common/*` infra helpers (`config`, `filters`, `pipes`, `lib`) wired through `common.module.ts` — not a domain module
- `src/app.module.ts` root module; `src/main.ts` bootstrap

### Module layout (vertical slice)

**HTTP module** (e.g. `clubs/`, `events/`, `tickets/`, `staff/`, `invitations/`, `settings/`, `auth/`, `session/`):

```text
apps/api/src/modules/clubs/
├── presentation/clubs.controller.ts   # HTTP, guards, ZodValidationPipe
├── application/
│   ├── list-my-clubs.use-case.ts      # one public method: execute()
│   ├── create-club.use-case.ts
│   └── services/                      # NestJS services shared by use cases in this module
├── mappers/club.mapper.ts             # row → DTO (pure)
├── validators/club.validator.ts       # reglas puras (límites, IDs)
└── clubs.module.ts
```

**Internal module** (e.g. `mail/`, `owner/`, `files/` — no HTTP; other modules inject use cases / services):

```text
apps/api/src/modules/mail/
├── application/
│   ├── send-mail.use-case.ts
│   ├── send-welcome.use-case.ts       # (+ staff-invitation, password-reset, smoke)
│   └── services/                      # MailConfigService, MailTemplatesService
├── adapters/resend.mail-sender.ts     # only place that imports `resend`
├── templates/                         # React Email components
├── types/                             # SendMailInput, render inputs, etc.
├── mail-sender.port.ts                # MailSender port + DI token in mail.tokens.ts
├── scripts/smoke-mail.ts              # pnpm --filter api mail:smoke
└── mail.module.ts
```

`files/` keeps `application/services/files.service.ts` as shared infra (consumed by clubs); stubs like `health/`, `categories/`, `orders/` only need `presentation/` until they grow use cases.

- Controllers (when present) delegate to use cases; they do not call `@repo/db` directly.
- Use cases orchestrate repositories, module services (`FilesService`, mail adapters, etc.), and map errors via `TranslationService`.
- Keep **database access** in `@repo/db` only — not in use cases as raw SQL, and not duplicated in a local repository layer.
- Vendor SDKs (e.g. Resend) stay behind a port + adapter; domain modules must not import the vendor package.

### Database conventions

- Schemas live in `packages/db/src/schema/` (`sqliteTable`) — table definitions and `*Select` / `*Insert` types.
- **Repositories** live in `packages/db/src/repositories/` — one folder per entity, one file per function; all Drizzle queries/writes used by `apps/api` belong here.
- The API imports repositories from `@repo/db`; use cases orchestrate business rules and HTTP exceptions.
- In development, `drizzle-kit push` may sync schema changes; for production prefer migrations.

### API conventions

- Use contracts from `@repo/types` and `@repo/validators`, never duplicate request/response shapes locally.
- Keep validation at controller boundary with Zod schemas.
- Keep business logic in use cases (and `application/services/` for shared module helpers), not controllers.
- Keep **database access** in `@repo/db` repositories, not API layer.
- Avoid logging secrets/tokens/plain passwords.

---

## Frontend modules

`app/modules/<feature>/` — use only the folders you need:

| Folder                                                     | Role                                              |
| ---------------------------------------------------------- | ------------------------------------------------- |
| `services/`                                                | API wrappers (`QueryFactory` or `createServerFn`) |
| `queries/` / `mutations/`                                  | TanStack Query                                    |
| `components/`, `hooks/`, `stores/`, `utils/`, `constants/` | UI / local helpers                                |

- Routes import from modules; modules **must not** import sibling modules → share via `modules/common/`.
- Navigation paths: `WEB_ROUTES` / `DASHBOARD_ROUTES` in `modules/common/constants/routes.ts`.
- `createFileRoute` needs a **string literal**; use route constants only for `Link` / `navigate`.
- Dashboard authenticated pages live under `routes/_app/`.

---

## Packages (rules)

| Package            | Rule                                                                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@repo/common`     | Single source for `API_PREFIX`, `API_URL`, `API_ROUTES`, `QueryFactory`                                                                                                                         |
| `@repo/db`         | `schema/` + `repositories/<domain>/` (one fn per file); migrations in prod                                                                                                                      |
| `@repo/validators` | All Zod schemas; do not redefine in apps. Env schemas live in `src/env/` (`database`, `mail`, `client`, `upload`); domain/form schemas stay at `src/*.ts`. Subpaths: `.`, `./database`, `./env` |
| `@repo/types`      | `enums/` + `dto/` + `repository/`; import only from package barrel                                                                                                                              |
| `@repo/ui`         | ShadCN in `packages/ui`; export from package index                                                                                                                                              |
| `@repo/i18n`       | Shared locales / i18next                                                                                                                                                                        |

---

## Env

Root `.env`. Main vars: `VITE_API_URL`, `TURSO_*`, `NODE_ENV`, `PORT`, `JWT_SECRET`, `DASHBOARD_URL`, `WEB_URL`, `CORS_ALLOWED_ORIGINS`, `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_SMOKE_TO`.

Zod schemas for env live in `packages/validators/src/env/`. Apps compose them at boot (`apps/api/.../config/env.ts`, `packages/db`, web/dashboard/admin client env). `CORS_ALLOWED_ORIGINS` MUST include `http://localhost:3003` in local development and the deployed Admin origin. Mail keys may be empty at boot; `MailConfigService` / send use cases fail with `mail.NOT_CONFIGURED` when sending without config. `API_PREFIX` is a **code constant**, not env.

---

## Adding work

| Task           | Where                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| New entity     | `db` schema → repos → validators → types → `api` module (use cases) → `API_ROUTES` → app service              |
| New endpoint   | repo → use case/controller → optional `API_ROUTES` + frontend service                                         |
| New API module | Vertical slice under `apps/api/src/modules/<name>/` (`application/` + optional `presentation/` / `adapters/`) |
| New env var    | Schema in `packages/validators/src/env/` → extend app `ENV` parse                                             |
| New UI module  | `app/modules/<name>/` + routes (`_app/` if authenticated dashboard)                                           |
| New ShadCN     | `cd packages/ui && pnpm dlx shadcn@latest add <name>`                                                         |
