## 1. Shared environment contracts

- [x] 1.1 Reduce `@repo/validators` environment exports to the shared database and `VITE_API_URL` schemas while preserving their current behavior and `@repo/db` compatibility.

## 2. API environment validation

- [x] 2.1 Move Google OAuth, mail, upload, Mercado Pago, and API URL schema definitions into `apps/api`; update the API environment parser to compose them with the shared database schema.

## 3. Browser environment validation

- [x] 3.1 Define the web-local environment schema and update web configuration to compose it with the shared API URL schema.
- [x] 3.2 Define the dashboard-local environment schema and update dashboard configuration to consume the shared API URL schema only.

## 4. Verification

- [x] 4.1 Run package and application type-checks, API tests, lint, format checks, builds, and OpenSpec validation.
