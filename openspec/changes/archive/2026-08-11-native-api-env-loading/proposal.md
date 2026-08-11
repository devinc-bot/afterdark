## Why

The API currently loads its local environment file with the `dotenv` package at module evaluation time. Node.js provides native environment-file loading, so the API can remove this runtime dependency while keeping validation centralized in its existing Zod parser.

## What Changes

- Load `apps/api/.env` through Node.js native `--env-file` startup options for development and production commands.
- Remove the API's `dotenv` dependency and its runtime configuration call.
- Preserve the existing environment variable names, file location, and Zod validation behavior.

## Capabilities

### New Capabilities
- `native-api-env-loading`: Native Node.js loading of the API environment file before application bootstrap.

### Modified Capabilities

- None.

## Non-goals

- Changing any environment variable values, names, defaults, or validation rules.
- Changing environment loading for web, dashboard, database scripts, or other packages.
- Adding another environment-loading library or framework configuration module.

## Impact

- Affected app: `api`.
- Unaffected apps/packages: `web`, `dashboard`, `db`, `ui`, `validators`, and `i18n`.
- `apps/api` development and production startup commands require the repository's supported Node.js runtime with `--env-file` support.
