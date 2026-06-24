# DOMAIN.md — afterdark

Business context, domain model, and product rules for the afterdark platform.

---

## Business context

**afterdark** is a night events platform. The platform supports two audiences:

| Audience  | App         | Capabilities                                      |
| --------- | ----------- | ------------------------------------------------- |
| Customers | `web`       | Browse catalog, filter products, view detail      |
| Staff     | `dashboard` | Manage catalog and inventory (CRUD, admin tables) |

Both apps operate on the same Turso (libSQL) database and share domain types and validation schemas through workspace packages.

---

## Domain model

### Entities

| Entity     | Package                             | Description                           |
| ---------- | ----------------------------------- | ------------------------------------- |
| `User`     | `@afterdark/db`, `@afterdark/types` | Authentication and account management |
| `Property` | `@afterdark/db`, `@afterdark/types` | Catalog item (furniture product)      |

All entities extend `BaseAppEntity`: UUID primary key, `createdAt`, `updatedAt`.

### Validation schemas

Business rules for input validation live in `@afterdark/validators`:

| Module     | Schemas                                                                |
| ---------- | ---------------------------------------------------------------------- |
| `auth`     | `loginSchema`, `registerSchema`                                        |
| `user`     | `createUserSchema`, `updateUserSchema`                                 |
| `property` | `createPropertySchema`, `updatePropertySchema`, `filterPropertySchema` |
| `common`   | `paginationSchema`, `uuidSchema`                                       |

Never redefine validation rules locally — always import from `@afterdark/validators`.

### TypeScript interfaces

Domain interfaces and enums are defined in `@afterdark/types`:

- `domain.ts` — `User`, `Property`, and their enums
- `api.ts` — `ApiResponse`, `ApiError`
- `pagination.ts` — `PaginationParams`, `PaginatedResponse`

---

## Product rules

### Language

- **UI copy** (labels, messages, placeholders, button text shown to users) must be in **Spanish**.
- **Code identifiers** (files, functions, variables, constants, route paths) must be in **English**.

### Data integrity

- Entity `documentId` values are UUIDs exposed in API/JWT; internal `id` columns are integers for FK joins.
- Forms validate against Zod schemas from `@afterdark/validators` before persisting.
- Database access from `apps/api` goes through `packages/db/src/repositories/`; do not query `db` directly in NestJS services.
- In development, `drizzle-kit push` may sync schema locally; production requires migrations (`drizzle-kit generate` + `migrate`).

### App responsibilities

| Concern          | `web`                           | `dashboard`                  |
| ---------------- | ------------------------------- | ---------------------------- |
| Catalog browsing | Yes — public listing and detail | Yes — admin table view       |
| Product creation | No                              | Yes — `/properties/new`      |
| Product editing  | No                              | Yes — `/properties/:id/edit` |
| Product deletion | No                              | Yes — via mutations          |
| Authentication   | Planned (`auth` module)         | Planned (`auth` module)      |
