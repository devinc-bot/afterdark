import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  migrationEnvSchema,
  runtimeDatabaseEnvSchema,
  type MigrationEnv,
  type RuntimeDatabaseEnv,
} from './env.ts'

const DEFAULT_ENV_FILE_PATH = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../.env')

type LoadEnvOptions = {
  environment?: NodeJS.ProcessEnv
  environmentFilePath?: string
  fileExists?: typeof existsSync
  loadEnvironmentFile?: (path: string) => void
}

export function loadDatabaseEnv({
  environment = process.env,
  environmentFilePath = environment.DATABASE_ENV_FILE ?? DEFAULT_ENV_FILE_PATH,
  fileExists = existsSync,
  loadEnvironmentFile = process.loadEnvFile,
}: LoadEnvOptions = {}): RuntimeDatabaseEnv {
  if (!environment.DATABASE_URL && fileExists(environmentFilePath)) {
    loadEnvironmentFile(environmentFilePath)
  }

  const result = runtimeDatabaseEnvSchema.safeParse(environment)

  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${result.error.message}`)
  }

  return result.data
}

export function loadMigrationEnv({
  environment = process.env,
  environmentFilePath = environment.DATABASE_ENV_FILE ?? DEFAULT_ENV_FILE_PATH,
  fileExists = existsSync,
  loadEnvironmentFile = process.loadEnvFile,
}: LoadEnvOptions = {}): MigrationEnv {
  if (!environment.DATABASE_MIGRATION_URL && fileExists(environmentFilePath)) {
    loadEnvironmentFile(environmentFilePath)
  }

  const result = migrationEnvSchema.safeParse(environment)

  if (!result.success) {
    throw new Error(`Invalid migration environment variables:\n${result.error.message}`)
  }

  return result.data
}
