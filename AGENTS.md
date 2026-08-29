# AGENTS.md — Repo Monorepo

Instructions for AI assistants (Claude Code, Cursor, etc.) working on this project.

---

## Documentation map

Read the relevant doc before making changes:

| Doc                                                                                                  | When to consult                                                  |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [spec/README.md](./spec/README.md)                                                                   | **Development flow** — SDD lifecycle, layout, and artifact rules |
| [.cursor/rules/spec-interview-before-changes.mdc](./.cursor/rules/spec-interview-before-changes.mdc) | **En Cursor** — flujo SDD obligatorio                            |
| [STYLEGUIDE.md](./STYLEGUIDE.md)                                                                     | Naming, constants, dependencies, lint/format                     |
| [packages/db/DATABASE.md](./packages/db/DATABASE.md)                                                 | Schema, migrations, repositories                                 |
| [PRODUCT.md](./PRODUCT.md)                                                                           | Brand register, users, personality, anti-references, principles  |
| [DESIGN.md](./DESIGN.md)                                                                             | Visual tokens, themes, typography, component guidance            |

### Design Context

- **Register:** `brand` (public web leads; dashboard stays operational).
- **Personality:** Alegre · Original · Minimalista — product-as-hero, soft depth, airy type, cheerful tone ([dock.cool](https://www.dock.cool/#hero) as reference).
- **Themes & locales:** Dark + light are first-class; UI copy EN + ES via `@repo/i18n`.
- **Do not:** neon/glow costume, dense airless layouts, stiff editorial formality, generic stock marketing.

### Admin Panel

- `apps/admin` admits only seeded `admin` accounts and runs on port 3003.
- Add `http://localhost:3003` locally and the deployed Admin origin to `CORS_ALLOWED_ORIGINS` before testing authentication.

---

## Development Flow - SDD

New features and scope changes use the repository SDD workflow in `spec/`. Before implementation,
create an approved feature folder in `spec/features/active/<NNN-slug>/`.

```text
/sdd-propose <slug>  # create spec.md, plan.md, and tasks.md for review
/sdd-apply <slug>    # implement one unchecked task, then pause
/sdd-archive <slug>  # verify and move the completed feature to archive
```

- Each feature has exactly three generated artifacts: `spec.md`, `plan.md`, and `tasks.md`.
- Use `active/` for work in progress and `archive/` only after all tasks and acceptance criteria pass.
- Write complete, current feature specs rather than delta artifacts. Do not back-fill unrelated features.
- `spec.md` records intent, scope, non-goals, requirements, and Given/When/Then scenarios. `plan.md`
  describes the technical approach. `tasks.md` is the implementation checklist.
- Before every proposal, delegate codebase exploration to a subagent. The subagent must report the relevant
  architecture, existing patterns, affected files, dependencies, and risks to the main thread before it drafts artifacts.
- Review the proposed artifacts with the user before writing code unless they explicitly request otherwise.
- `/sdd-apply` completes one independently reviewable task by default. Continue in batches only when
  the user requests it.
- Plan and deliver work by layer: shared types and validators, database and migrations, API, then each
  affected client (`web`, `dashboard`, or `admin`) and i18n. Each task should cover one layer whenever possible.
- If a decision blocks planning, ask one concise question rather than assuming a product decision.

---

## General guidelines

1. **Follow existing patterns** — match the architecture and domain conventions below.
2. **Respect conventions** — naming, no magic strings, pinned deps, and pre-commit hooks per [STYLEGUIDE.md](./STYLEGUIDE.md).
3. **Honor business rules** — UI copy in Spanish and English via i18n, English identifiers, and shared validators/types.
4. **Minimize scope** — change only what the task requires; do not refactor unrelated code.
5. **Never edit generated files** — `routeTree.gen.ts` is auto-generated on `pnpm dev` and is in `.gitignore`.
6. **Lint and format** — all TS/JS must pass **oxlint** and **oxfmt** before committing; pre-commit runs both on staged files.

---

## Common commands

```bash
# Development
pnpm dev              # both apps in parallel
pnpm dev:web        # web only  → http://localhost:3001
pnpm dev:dashboard    # dashboard only → http://localhost:3002
pnpm dev:admin        # admin only → http://localhost:3003

# Build & type-check
pnpm build
pnpm build:admin      # admin only
pnpm type-check

# Lint & format (oxlint + oxfmt)
pnpm lint           # lint check
pnpm lint:fix       # lint + auto-fix
pnpm format         # format all files in place
pnpm format:check   # format check without writing (CI)

# Database (run from packages/db)
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
pnpm drizzle-kit push   # dev only — prefer migrations in production
pnpm db:seed:development # direct Neon URL; roles, admin, and development fixtures
pnpm db:seed:production  # direct Neon URL; roles and configured admin only

# Add a ShadCN component (run from packages/ui)
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add table
```

---

## Framework gotchas

- **Drizzle schemas** are plain TypeScript in `packages/db/src/schema/` — use `pgTable` (Neon PostgreSQL); no decorators or `reflect-metadata`.
- **Repositories** — all Drizzle queries used by `apps/api` live in `packages/db/src/repositories/`. NestJS services call repository functions from `@repo/db`; do not import `db` directly in API services unless adding a new repository first.
- **Tailwind v4** has a different config format than v3 — consult the [v4 docs](https://tailwindcss.com/docs) before making changes.
- **Zod v4** has breaking changes from v3 — consult the [migration guide](https://zod.dev/v4) before modifying validators.
- **Drizzle migrations** use `drizzle-kit` — generate and run SQL migrations for schema changes; do not rely on auto-sync in production. New migration files use a `timestamp` prefix (`packages/db/drizzle.config.ts`); do not rename committed migrations.
- **`createFileRoute`** requires a string literal path for TanStack Router codegen — use route constants only for navigation, not in route file definitions.
- **oxlint / oxfmt** are the only linter and formatter — config in `oxlint.json` and `.oxfmtrc.json`; unfixable lint errors block commits via Husky + lint-staged.

---

## Product domain

**Repo** is an events and ticketing platform for locations, events, and tickets. All apps share one Neon PostgreSQL database and shared types and validators.

| Audience | App         | Role                                                      |
| -------- | ----------- | --------------------------------------------------------- |
| Customer | `web`       | Account; discover and buy tickets                         |
| Owner    | `dashboard` | Organization, locations, events, tickets, staff, settings |
| Staff    | `dashboard` | Invited organization operations                           |
| Platform | `admin`     | Seeded-admin platform operations                          |

- Roles: `user` registers through `web`; `owner` through `dashboard`; `staff` only accepts an owner invitation; `admin` is provisioned by the seeder and logs in through `admin`.
- Core entities: `Account` and `Role`; role profiles (`User`, `Owner`, `Staff`); `Organization` and its N:M `OrganizationAccount` memberships; `Location`; `Event`; `Ticket`; `Order` and `tickets_sold`; `StaffInvitation`.
- Use `documentId` (UUID) in API and JWT contracts; internal integer `id` values are foreign keys only.
- The canonical term is **location**. Legacy `club` and `nightlife` wording in `spec/features/` is historical until that feature is touched.
- UI copy is localized in English and Spanish through `@repo/i18n`; code, identifiers, routes, and technical specs are English. Dark and light themes are first-class.
- Validate with `@repo/validators` before persistence. DTOs and enums belong to `@repo/types`; do not redefine either in apps.
- Current owner flows require exactly one associated organization, although the schema supports N:M memberships.
- Events belong to an organization and use a location as their venue. Owners manage their organization, locations, events, tickets, and staff; customers never manage inventory.
- Staff has no free registration and no direct staff-location relationship. Invitation acceptance creates membership in the inviting organization; access and staff management authorize through that membership.
- Authentication uses JWT plus refresh sessions; clients establish sessions with `GET /session/me`.

---

## Architecture

| App         | Responsibility              | Port |
| ----------- | --------------------------- | ---- |
| `web`       | Public customer client      | 3001 |
| `dashboard` | Owner and staff panel       | 3002 |
| `admin`     | Seeded platform-admin panel | 3003 |
| `api`       | NestJS REST API             | 3000 |

```text
apps/{web,dashboard,admin}/app/{config,modules,routes}
apps/api/src/{modules,app.module.ts,main.ts}
packages/{common,db,validators,types,ui,i18n}
```

### Data and API

```text
UI -> queries/mutations -> services -> QueryFactory -> Nest API -> repositories -> DB
```

- `app/config/api.ts` creates `QueryFactory(API_URL)`. Build endpoints with `buildApiPath(API_ROUTES.*, path)`; never hardcode `/api/...`. Auth may use `createServerFn` around the same calls.
- `API_PREFIX`, `API_URL`, `API_ROUTES`, `QueryFactory`, and `buildApiPath` are owned by `@repo/common`. Nest configures its global prefix with the same `API_PREFIX` constant.
- API modules use vertical slices under `apps/api/src/modules/<domain>/`: `presentation/` for HTTP controllers and guards, `application/` for one-`execute()` use cases and shared services, plus only needed `mappers/`, `validators/`, `adapters/`, `types/`, or `utils/`.
- Controllers validate at the boundary with shared Zod schemas and delegate to use cases. Use cases orchestrate repositories and module services, translate errors, and never issue raw database queries.
- `src/common/` is infrastructure wired by `common.module.ts`; `app.module.ts` is root and `main.ts` bootstraps. Internal modules without HTTP expose use cases or services to other modules.
- Keep vendor SDKs behind a port and adapter. For example, only the mail adapter imports Resend; mail config failures use `mail.NOT_CONFIGURED` and never log secrets, tokens, or passwords.

### Database and packages

- `@repo/db`: schemas in `src/schema/` use `pgTable`; all API Drizzle reads and writes live in `src/repositories/`, organized by entity with one function per file. API services import repository functions only, never `db` directly.
- `@repo/validators`: all domain and form Zod schemas; environment schemas live in `src/env/`. `@repo/types`: enums, DTOs, and repository types, imported through its barrel. `@repo/ui`: shared ShadCN and files SDK components. `@repo/i18n`: shared locale configuration and copy.
- Generate timestamp-prefixed Drizzle migrations for production; never rename committed migrations. `drizzle-kit push` is development-only.
- Root `.env` contains client API, Neon PostgreSQL, runtime, JWT, origin, CORS, and mail variables. `DATABASE_URL` uses Neon's pooled hostname for API runtime; `DATABASE_MIGRATION_URL` uses the direct hostname for Drizzle Kit, migrations, seeds, and administrative commands. Parse each app's environment with schemas in `packages/validators/src/env/`; `API_PREFIX` is a code constant, not environment configuration.
- `CORS_ALLOWED_ORIGINS` must include `http://localhost:3003` locally and the deployed admin origin.

### Frontend

- Use `app/modules/<feature>/` and only required folders: `services/`, `queries/`, `mutations/`, `components/`, `hooks/`, `stores/`, `utils/`, and `constants/`.
- Routes import feature modules, but feature modules do not import siblings. Put shared frontend code in `modules/common/`.
- Navigation uses `WEB_ROUTES` or `DASHBOARD_ROUTES` in `modules/common/constants/routes.ts`. `createFileRoute` paths must be string literals; use route constants only for `Link` and `navigate`.
- Dashboard authenticated pages live under `routes/_app/`. Sessions use the Zustand store and `/session/me`; use `RequireGuest`, `RequireSession`, and `RolesGuard` as appropriate. Admin uses `RequireAdminSession` and requires `USER_ROLE.ADMIN`.

### Change placement

| Change               | Order or location                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| Entity               | DB schema -> repository -> validator -> type -> API use case/controller -> `API_ROUTES` -> app service |
| Endpoint             | Repository -> use case/controller -> route constant and frontend service if needed                     |
| API module           | `apps/api/src/modules/<name>/` vertical slice                                                          |
| Environment variable | `packages/validators/src/env/` schema -> consuming app `ENV` parse                                     |
| UI module            | `app/modules/<name>/` and route; dashboard protected pages under `_app/`                               |
| ShadCN component     | From `packages/ui`: `pnpm dlx shadcn@latest add <name>`                                                |

---

## Adding features (quick reference)

| Task                 | Start here                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| New entity           | Database schema, repository, validator, type, and API vertical slice         |
| New DB query in API  | `packages/db/src/repositories/<entity>.repository.ts` → export in `index.ts` |
| New feature module   | `apps/api/src/modules/<name>/` vertical slice                                |
| New ShadCN component | `packages/ui` with the ShadCN CLI                                            |
| New validation rule  | `packages/validators/src/<module>.ts`                                        |
| New domain type      | `packages/types/src/domain.ts`                                               |

<!-- context7 -->

Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer — your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and what to look up in the library's documentation, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and what to look up in the library's documentation (not single words), scoped to a single concept. If the question spans multiple distinct concepts (e.g. routing and auth and caching), make a separate `query-docs` call per concept with the same library ID, unless the question is about how the concepts interact — combined queries dilute ranking and return shallow results for each topic
4. Answer using the fetched docs
<!-- context7 -->
