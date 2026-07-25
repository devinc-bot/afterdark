# AGENTS.md — Repo Monorepo

Instructions for AI assistants (Claude Code, Cursor, etc.) working on this project.

---

## Documentation map

Read the relevant doc before making changes:

| Doc                                                                                                  | When to consult                                                      |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [openspec/config.yaml](./openspec/config.yaml)                                                       | **Development flow** — OpenSpec project context & per-artifact rules |
| [.cursor/rules/spec-interview-before-changes.mdc](./.cursor/rules/spec-interview-before-changes.mdc) | **Antes de cada cambio nuevo** — flujo OpenSpec obligatorio (Cursor) |
| [spec/README.md](./spec/README.md)                                                                   | Legacy SDD layout (reference/history; migrate on next touch)         |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                                                                 | Project structure, modules, routes, layers, packages                 |
| [STYLEGUIDE.md](./STYLEGUIDE.md)                                                                     | Naming, constants, dependencies, lint/format                         |
| [DOMAIN.md](./DOMAIN.md)                                                                             | Business context, entities, validation, UI language                  |
| [packages/db/DATABASE.md](./packages/db/DATABASE.md)                                                 | Schema, migrations, repositories                                     |

---

## Development flow — OpenSpec

New work is spec-driven via **OpenSpec** (`openspec/`). Before implementing a new feature or scope
change, create and align an OpenSpec change first:

```text
/opsx:explore            # optional — read the area, shape the approach
/opsx:propose <slug>     # drafts openspec/changes/<slug>/ (proposal, specs deltas, design, tasks)
                         # → review the proposal with the user BEFORE coding
/opsx:apply              # implements ONE tasks.md item per turn, then pauses (say "seguí"/"todas" to continue)
/opsx:archive            # merges spec deltas into openspec/specs/ and archives the change
```

- Slash `/opsx:*` commands run in the AI chat; the CLI runs in the terminal: `pnpm openspec <cmd>`
  (`list`, `show <item>`, `validate`, `view`, `doctor`, `context`).
- Project context and per-artifact rules live in [openspec/config.yaml](./openspec/config.yaml).
- **Brownfield-first**: write **deltas** (ADDED/MODIFIED/REMOVED), not full specs. Don't back-fill specs
  for code you aren't changing.
- Legacy specs under `spec/features/NNN-*/` stay as reference; migrate a feature to `openspec/specs/`
  only when you next touch it.

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
# OpenSpec (spec-driven flow)
pnpm openspec list           # active changes
pnpm openspec show <item>    # view a change or spec
pnpm openspec validate       # validate changes and specs
pnpm openspec doctor         # health of the OpenSpec root

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
- **Repositories** — all Drizzle queries used by `apps/api` live in `packages/db/src/repositories/`. NestJS services call repository functions from `@repo/db`; do not import `db` directly in API services unless adding a new repository first.
- **Tailwind v4** has a different config format than v3 — consult the [v4 docs](https://tailwindcss.com/docs) before making changes.
- **Zod v4** has breaking changes from v3 — consult the [migration guide](https://zod.dev/v4) before modifying validators.
- **Drizzle migrations** use `drizzle-kit` — generate and run SQL migrations for schema changes; do not rely on auto-sync in production. New migration files use a `timestamp` prefix (`packages/db/drizzle.config.ts`); do not rename committed migrations.
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
