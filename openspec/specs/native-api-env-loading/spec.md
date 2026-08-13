# native-api-env-loading Specification

## Purpose
TBD - created by archiving change native-api-env-loading. Update Purpose after archive.
## Requirements
### Requirement: Native API environment-file loading

The API development and production startup commands SHALL load `apps/api/.env` with Node.js native environment-file support before application modules evaluate. The API environment parser MUST validate the resulting `process.env` using its existing application-owned schemas and MUST NOT load environment files through `dotenv`.

#### Scenario: Start the API in development
- **GIVEN** `apps/api/.env` contains valid API environment variables
- **WHEN** the API development command starts
- **THEN** the API validates and uses those variables without importing `dotenv`

#### Scenario: Start the built API
- **GIVEN** `apps/api/.env` contains valid API environment variables
- **WHEN** the API production start command runs
- **THEN** the built API validates and uses those variables without importing `dotenv`

#### Scenario: Missing required environment variable
- **GIVEN** a required API environment variable is absent from the process environment and `apps/api/.env`
- **WHEN** the API starts
- **THEN** the existing environment validation fails before the API accepts requests

