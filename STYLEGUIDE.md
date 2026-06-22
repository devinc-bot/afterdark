# STYLEGUIDE.md — afterdark Monorepo

Code conventions, naming rules, dependency policy, and quality toolchain.

---

## Naming conventions

| What                  | Convention                                | Example                                |
| --------------------- | ----------------------------------------- | -------------------------------------- |
| Files                 | `kebab-case`                              | `property-card.tsx`                    |
| Components            | `PascalCase`                              | `PropertyCard`                         |
| Hooks                 | `camelCase` with `use` prefix             | `useProperties`                        |
| Server fns            | `camelCase` with `Fn` suffix              | `getPropertiesFn`                      |
| Query options         | `camelCase` with `QueryOptions` suffix    | `propertiesQueryOptions`               |
| Routes paths          | English, kebab-case                       | `/properties/new`                      |
| Constant maps         | `SCREAMING_SNAKE_CASE` export, `as const` | `SESSION_STORAGE_KEYS`, `MODE`         |
| Map keys (grouped)    | `camelCase`                               | `accessToken`, `sessionToken`          |
| External key values   | `snake_case` string literals              | `'access_token'`, `'session_token'`    |
| String values in code | Use constant maps, not inline literals    | `MODE.DEVELOPMENT` not `"development"` |

> UI **display text** (labels, messages, placeholders shown to users) stays in **Spanish** per product requirements. All identifiers (files, functions, constants, routes) must be in **English**. See [DOMAIN.md](./DOMAIN.md) for language rules.

---

## No magic strings

Do not repeat string literals in application logic (env modes, statuses, roles, query keys, etc.). Define constants once and compare against them.

| Scope    | Location                                                   |
| -------- | ---------------------------------------------------------- |
| App-wide | `app/config/constants/` or `app/modules/common/constants/` |
| Domain   | `@afterdark/types` or `@afterdark/validators`              |

Define constant maps with `as const`. Derive TypeScript types from the map when needed.

### Grouped constant maps

For storage keys, cookie names, query keys, and similar **grouped identifiers**, use one exported map per domain:

| Part          | Convention             | Example                |
| ------------- | ---------------------- | ---------------------- |
| Export name   | `SCREAMING_SNAKE_CASE` | `SESSION_STORAGE_KEYS` |
| Property keys | `camelCase`            | `accessToken`          |
| String values | `snake_case`           | `'access_token'`       |

```ts
// app/modules/common/constants/storage.ts
export const SESSION_STORAGE_KEYS = {
  accessToken: 'access_token',
} as const
```

```ts
// app/modules/common/constants/cookies.ts
export const COOKIE_KEYS = {
  sessionToken: 'session_token',
} as const
```

Reference grouped maps by property — never repeat the raw string:

```ts
// incorrect
sessionStorage.setItem('access_token', token)

// correct
sessionStorage.setItem(SESSION_STORAGE_KEYS.accessToken, token)
```

For **enum-style** constants (modes, statuses, roles), keep `SCREAMING_SNAKE_CASE` keys with lowercase string values:

```ts
// app/config/constants/mode.ts
export const MODE = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const

export type Mode = (typeof MODE)[keyof typeof MODE]
```

```ts
// incorrect
if (envResult.MODE === 'development') {
}

// correct
if (envResult.MODE === MODE.DEVELOPMENT) {
}
```

Use the same values in Zod enums: `z.enum([MODE.DEVELOPMENT, MODE.PRODUCTION, MODE.TEST])`.

**Exceptions (literals are OK):** route paths inside `createFileRoute("...")` (codegen), UI copy shown to users (Spanish), and one-off test fixtures.

---

## Conditional class names

When `cn()` receives state-dependent Tailwind classes (disabled, active, error, etc.), do not use nested ternaries inline. Extract a named function with early returns that returns the variant string.

| Part          | Convention                                         | Example                              |
| ------------- | -------------------------------------------------- | ------------------------------------ |
| Function name | `camelCase` with `get` prefix + `ClassName` suffix | `getSidebarNavItemStateClassName`    |
| Return value  | Tailwind utility string for one visual state       | `'bg-surface-container text-ink'`    |
| Location      | Co-located helper, `*.utils.ts`, or `lib/`         | `packages/ui/src/lib/sidebar-nav.ts` |

```ts
// incorrect
const className = cn(
  baseClassName,
  item.disabled
    ? 'cursor-not-allowed opacity-50'
    : isActive
      ? 'bg-surface-container text-ink'
      : 'text-ink-muted hover:bg-surface-container/70'
)

// correct
function getSidebarNavItemStateClassName({
  disabled,
  isActive,
}: {
  disabled?: boolean
  isActive: boolean
}): string {
  if (disabled) return 'cursor-not-allowed opacity-50'
  if (isActive) return 'bg-surface-container text-ink'
  return 'text-ink-muted hover:bg-surface-container/70 hover:text-ink'
}

const className = cn(
  baseClassName,
  getSidebarNavItemStateClassName({ disabled: item.disabled, isActive })
)
```

Compose the final class list with `cn(baseClassName, get…ClassName(input))`. Keep base/layout classes separate from state variants.

---

## Dependency management

- **No `^` or `~`** — all versions are pinned exactly.
- `save-exact=true` is set in `.npmrc` — every `pnpm add` auto-pins.
- Always commit `pnpm-lock.yaml`. Never delete it.
- To upgrade a dep: `pnpm add <pkg>@<exact-version>`, review changelog first.
- Never run blind upgrade commands (`pnpm update --latest`, `npm-check-updates`, etc.).
- Use `pnpm install --frozen-lockfile` in CI.

### Pinned versions (key deps)

| Package                      | Version  |
| ---------------------------- | -------- |
| `@tanstack/react-start`      | 1.168.13 |
| `@tanstack/react-router`     | 1.170.8  |
| `@tanstack/react-query`      | 5.100.14 |
| `@tanstack/react-form`       | 1.32.0   |
| `@tanstack/zod-form-adapter` | 0.42.1   |
| `react` / `react-dom`        | 19.2.6   |
| `zod`                        | 4.4.3    |
| `typeorm`                    | 1.0.0    |
| `typescript`                 | 6.0.3    |
| `tailwindcss`                | 4.3.0    |
| `vinxi`                      | 0.5.11   |
| `oxlint`                     | 1.66.0   |
| `oxfmt`                      | 0.51.0   |

---

## Code quality toolchain

| Tool            | Role                            | Config                         |
| --------------- | ------------------------------- | ------------------------------ |
| **oxlint**      | Linter (Oxc ecosystem, Rust)    | `oxlint.json`                  |
| **oxfmt**       | Formatter (Oxc ecosystem, Rust) | `.oxfmtrc.json`                |
| **Husky**       | Git hooks                       | `.husky/pre-commit`            |
| **lint-staged** | Run tools on staged files only  | `package.json → "lint-staged"` |

Pre-commit (runs on every `git commit`):

1. `oxlint --fix` → lint + auto-fix staged TS/JS files
2. `oxfmt` → format staged files in place

Unfixable lint errors **block** the commit.

```bash
pnpm lint           # lint check
pnpm lint:fix       # lint + auto-fix
pnpm format         # format all files in place
pnpm format:check   # format check without writing (CI)
```
