## Context

`apps/api/src/config/env.ts` imports and invokes `dotenv` while evaluating the API environment schema. The API package already requires Node.js 22, whose CLI can populate `process.env` from an environment file before TypeScript or compiled application code loads.

## Goals / Non-Goals

**Goals:**
- Use Node's `--env-file` startup option for API development and production commands.
- Preserve the API-local Zod validation boundary and the existing `apps/api/.env` location.
- Remove `dotenv` from the API dependencies and runtime imports.

**Non-Goals:**
- Change validation schemas, environment values, or other workspace package startup commands.

## Decisions

### Load the API environment file in package scripts

The `dev` script will start Node with `--env-file=.env`, preload `tsx`, and enable watch mode. The `start` script will use the same native option before running the compiled entrypoint. This ensures all imports observe a populated `process.env` before the existing parser runs.

Keeping file loading inside `env.ts` was rejected because it requires a runtime loader such as `dotenv`. Nest configuration modules were rejected because they add framework configuration for behavior already supplied by Node.

## Risks / Trade-offs

- [Node CLI compatibility] → The API's development runtime is Node 22.13.1, which supports `--env-file`; deployment must use the supported Node major version.
- [Commands launched outside package scripts] → Operators must provide environment variables directly or use the documented API scripts.

## Migration Plan

1. Update API start commands to load `.env` natively.
2. Remove the `dotenv` import, invocation, and dependency.
3. Verify development and built startup load valid variables before schema validation.

## Open Questions

None.
