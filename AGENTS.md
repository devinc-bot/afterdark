# AGENTS.md — afterdark Monorepo

Instructions for AI assistants (Claude Code, Cursor, etc.) working on this project.

---

## Documentation map

Read the relevant doc before making changes:

| Doc                                                  | When to consult                                      |
| ---------------------------------------------------- | ---------------------------------------------------- |
| [spec/INTERVIEW.md](./spec/INTERVIEW.md)             | Creating a feature spec (guided Q&A; do not fill alone) |
| [spec/README.md](./spec/README.md)                   | SDD layout, spec folder conventions                  |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                 | Project structure, modules, routes, layers, packages |
| [STYLEGUIDE.md](./STYLEGUIDE.md)                     | Naming, constants, dependencies, lint/format         |
| [DOMAIN.md](./DOMAIN.md)                             | Business context, entities, validation, UI language  |
| [packages/db/DATABASE.md](./packages/db/DATABASE.md) | Schema, migrations, repositories                     |

---

## General guidelines

1. **Follow existing patterns** — match the module layout, layer conventions, and import rules described in [ARCHITECTURE.md](./ARCHITECTURE.md).
2. **Respect conventions** — naming, no magic strings, pinned deps, and pre-commit hooks per [STYLEGUIDE.md](./STYLEGUIDE.md).
3. **Honor business rules** — Spanish UI copy, English identifiers, shared validators/types per [DOMAIN.md](./DOMAIN.md).
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

# Build & type-check
pnpm build
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

# Add a ShadCN component (run from packages/ui)
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add table
```

---

## Framework gotchas

- **Drizzle schemas** are plain TypeScript in `packages/db/src/schema/` — use `sqliteTable` (Turso/libSQL); no decorators or `reflect-metadata`.
- **Repositories** — all Drizzle queries used by `apps/api` live in `packages/db/src/repositories/`. NestJS services call repository functions from `@afterdark/db`; do not import `db` directly in API services unless adding a new repository first.
- **Tailwind v4** has a different config format than v3 — consult the [v4 docs](https://tailwindcss.com/docs) before making changes.
- **Zod v4** has breaking changes from v3 — consult the [migration guide](https://zod.dev/v4) before modifying validators.
- **Drizzle migrations** use `drizzle-kit` — generate and run SQL migrations for schema changes; do not rely on auto-sync in production.
- **`createFileRoute`** requires a string literal path for TanStack Router codegen — use route constants only for navigation, not in route file definitions.
- **oxlint / oxfmt** are the only linter and formatter — config in `oxlint.json` and `.oxfmtrc.json`; unfixable lint errors block commits via Husky + lint-staged.

---

## Adding features (quick reference)

| Task                 | Start here                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| New entity           | [ARCHITECTURE.md → New entity](./ARCHITECTURE.md#new-entity)                 |
| New DB query in API  | `packages/db/src/repositories/<entity>.repository.ts` → export in `index.ts` |
| New feature module   | [ARCHITECTURE.md → New module](./ARCHITECTURE.md#new-module)                 |
| New ShadCN component | [ARCHITECTURE.md → New shared UI](./ARCHITECTURE.md#new-shared-ui-component) |
| New validation rule  | `packages/validators/src/<module>.ts`                                        |
| New domain type      | `packages/types/src/domain.ts`                                               |
