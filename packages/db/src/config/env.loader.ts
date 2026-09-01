import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  migrationEnvSchema,
  runtimeDatabaseEnvSchema,
  testDatabaseEnvSchema,
  type MigrationEnv,
  type RuntimeDatabaseEnv,
  type TestDatabaseEnv,
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

export function loadTestDatabaseEnv(environment: NodeJS.ProcessEnv = process.env): TestDatabaseEnv {
  const result = testDatabaseEnvSchema.safeParse(environment)

  if (!result.success) {
    throw new Error(`Invalid test database environment variables:\n${result.error.message}`)
  }

  const databaseName = new URL(result.data.DATABASE_TEST_URL).pathname.slice(1)
  if (!databaseName.endsWith('_test')) {
    throw new Error('DATABASE_TEST_URL must use a database name ending in "_test"')
  }

  if (
    result.data.DATABASE_TEST_URL === environment.DATABASE_URL ||
    result.data.DATABASE_TEST_URL === environment.DATABASE_MIGRATION_URL
  ) {
    throw new Error('DATABASE_TEST_URL must differ from runtime and migration database URLs')
  }

  return result.data
}
