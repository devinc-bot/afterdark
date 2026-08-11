## ADDED Requirements

### Requirement: Application-owned environment schemas

Each application SHALL define and validate environment variables that are exclusive to its runtime. `apps/api` MUST own schemas for Google OAuth, mail, uploads, Mercado Pago, and API-specific public URLs. `apps/web` and `apps/dashboard` MUST each own schemas for variables unique to their Vite runtime.

#### Scenario: API validates server-only configuration

- **GIVEN** the API starts with its environment variables
- **WHEN** the API environment parser runs
- **THEN** it validates server-only integration values from schemas owned by `apps/api`

#### Scenario: Client validates app-specific configuration

- **GIVEN** web or dashboard starts with its Vite environment variables
- **WHEN** the application's environment parser runs
- **THEN** it validates its app-specific values without importing a client-specific schema owned by another app

### Requirement: Shared environment contracts

`@repo/validators/src/env` SHALL retain only environment schemas that are consumed by more than one runtime: database configuration for API and `@repo/db`, and `VITE_API_URL` for web and dashboard. Shared schemas MUST preserve their existing validation behavior.

#### Scenario: Database consumer validates shared configuration

- **GIVEN** `@repo/db` loads its server environment
- **WHEN** it validates database configuration
- **THEN** it consumes the shared database schema from `@repo/validators`

#### Scenario: Browser applications validate API origin

- **GIVEN** web and dashboard load their Vite environment
- **WHEN** they validate `VITE_API_URL`
- **THEN** both consume the same shared API URL validation contract

### Requirement: Environment contract compatibility

Relocating schemas MUST NOT change environment variable names, requiredness, defaults, transformations, or runtime error behavior for any current consumer.

#### Scenario: Existing deployment configuration remains valid

- **GIVEN** a valid existing API, web, dashboard, or database environment
- **WHEN** the migrated parser validates it
- **THEN** validation succeeds with the same resulting values as before relocation
