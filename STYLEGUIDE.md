# STYLEGUIDE.md — Repo Monorepo

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

> UI display text (labels, messages, placeholders shown to users) is localized in Spanish and English through `@repo/i18n`. All identifiers (files, functions, constants, routes) must be in English. See [AGENTS.md](./AGENTS.md) for domain rules.

---

## No magic strings

Do not repeat string literals in application logic (env modes, statuses, roles, query keys, etc.). Define constants once and compare against them.

| Scope    | Location                                                   |
| -------- | ---------------------------------------------------------- |
| App-wide | `app/config/constants/` or `app/modules/common/constants/` |
| Domain   | `@repo/types` or `@repo/validators`                        |

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

## Derived display values

When placeholder, error message, disabled state copy, or similar **UI strings** depend on multiple flags (loading, empty, error, validation), do not use nested ternaries inside JSX or render callbacks. Extract a named function **outside the component** with early returns.

| Part          | Convention                                                    | Example                     |
| ------------- | ------------------------------------------------------------- | --------------------------- |
| Function name | `camelCase` with `get` prefix                                 | `getClubSelectFieldDisplay` |
| Return value  | Object or primitive for one visual/copy state                 | `{ placeholder, error }`    |
| Location      | Co-located in the same file (above component) or `*.utils.ts` | `staff-user-form.tsx`       |

```tsx
// incorrect — nested ternaries in render (see staff-user-form.tsx before refactor)
const clubPlaceholder = isClubsLoading
  ? STAFF_COPY.form.clubLoading
  : clubs.length === 0
    ? STAFF_COPY.form.clubEmpty
    : STAFF_COPY.form.clubPlaceholder
const clubFieldError = isClubsError ? STAFF_COPY.form.clubsLoadError : (error ?? undefined)

// correct — early returns in a module-level helper (getClubSelectFieldDisplay in staff-user-form.tsx)
type ClubSelectFieldDisplayInput = {
  isLoading: boolean
  isError: boolean
  clubCount: number
  fieldError: string | null
}

type ClubSelectFieldDisplay = {
  placeholder: string
  error: string | undefined
}

function getClubSelectFieldDisplay({
  isLoading,
  isError,
  clubCount,
  fieldError,
}: ClubSelectFieldDisplayInput): ClubSelectFieldDisplay {
  if (isLoading) {
    return { placeholder: STAFF_COPY.form.clubLoading, error: fieldError ?? undefined }
  }
  if (isError) {
    return { placeholder: STAFF_COPY.form.clubPlaceholder, error: STAFF_COPY.form.clubsLoadError }
  }
  if (clubCount === 0) {
    return { placeholder: STAFF_COPY.form.clubEmpty, error: fieldError ?? undefined }
  }
  return { placeholder: STAFF_COPY.form.clubPlaceholder, error: fieldError ?? undefined }
}

// in the component
const { placeholder, error: clubFieldError } = getClubSelectFieldDisplay({
  isLoading: isClubsLoading,
  isError: isClubsError,
  clubCount: clubs.length,
  fieldError: error,
})
```

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
