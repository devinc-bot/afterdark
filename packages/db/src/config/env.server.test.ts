import assert from 'node:assert/strict'
import test from 'node:test'
import { loadDatabaseEnv, loadMigrationEnv } from './env.loader.ts'

const DATABASE_URL = 'postgresql://runtime-user:runtime-password@postgres:5432/afterdark'
const DATABASE_MIGRATION_URL =
  'postgresql://migration-user:migration-password@postgres:5432/afterdark'

test('uses injected database URLs without reading a local environment file', () => {
  const environment: NodeJS.ProcessEnv = {
    DATABASE_URL,
    DATABASE_MIGRATION_URL,
  }

  const result = loadDatabaseEnv({
    environment,
    fileExists: () => true,
    loadEnvironmentFile: () => {
      throw new Error('The local environment file should not be loaded')
    },
  })

  assert.deepEqual(result, {
    DATABASE_URL,
  })
})

test('loads an existing local environment file when database URLs are absent', () => {
  const environment: NodeJS.ProcessEnv = {}
  let loadedPath: string | undefined

  const result = loadDatabaseEnv({
    environment,
    environmentFilePath: 'local.env',
    fileExists: (path) => path === 'local.env',
    loadEnvironmentFile: (path) => {
      loadedPath = path
      environment.DATABASE_URL = DATABASE_URL
      environment.DATABASE_MIGRATION_URL = DATABASE_MIGRATION_URL
    },
  })

  assert.equal(loadedPath, 'local.env')
  assert.deepEqual(result, {
    DATABASE_URL,
  })
})

test('uses the injected direct migration URL without reading a local environment file', () => {
  const environment: NodeJS.ProcessEnv = {
    DATABASE_MIGRATION_URL,
  }

  const result = loadMigrationEnv({
    environment,
    fileExists: () => true,
    loadEnvironmentFile: () => {
      throw new Error('The local environment file should not be loaded')
    },
  })

  assert.deepEqual(result, {
    DATABASE_MIGRATION_URL,
  })
})

test('rejects migration configuration without a direct database URL', () => {
  assert.throws(
    () => loadMigrationEnv({ environment: {}, fileExists: () => false }),
    /DATABASE_MIGRATION_URL/
  )
})
