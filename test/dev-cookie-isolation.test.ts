import { readFile } from 'node:fs/promises'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { apiConfigSchema } from '../apps/api/src/config/env.schema'

const API_TARGET = 'http://localhost:3000'

const APP_CONFIGURATIONS = [
  {
    name: 'web',
    port: 3001,
    viteConfigUrl: new URL('../apps/web/vite.config.ts', import.meta.url),
  },
  {
    name: 'dashboard',
    port: 3002,
    viteConfigUrl: new URL('../apps/dashboard/vite.config.ts', import.meta.url),
  },
  {
    name: 'admin',
    port: 3003,
    viteConfigUrl: new URL('../apps/admin/vite.config.ts', import.meta.url),
  },
] as const

function parseEnvironment(source: string) {
  return Object.fromEntries(
    source
      .split(/\r?\n/u)
      .filter((line) => line.length > 0 && !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=')
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1).replaceAll('"', '')]
      })
  )
}

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'http://web.localhost:3001')
  vi.stubEnv('VITE_DASHBOARD_URL', 'http://dashboard.localhost:3002')
})

describe('development cookie isolation', () => {
  test.each(APP_CONFIGURATIONS)(
    '$name keeps its Vite development server isolated',
    async ({ name, port, viteConfigUrl }) => {
      const { default: createConfig } = await import(viteConfigUrl.href)
      const config = await createConfig({ mode: 'development' })
      const server = config.server

      expect(server?.allowedHosts).toEqual([`${name}.localhost`])
      expect(server?.proxy).toMatchObject({
        '/api': {
          target: API_TARGET,
          changeOrigin: true,
        },
      })
      expect(server?.port).toBe(port)
      expect(server?.strictPort).toBe(true)
    },
    15_000
  )

  test('versioned development runtime environment uses the three isolated app origins', async () => {
    const environmentUrl = new URL('../deploy/env/development.runtime.env.example', import.meta.url)
    const environment = parseEnvironment(await readFile(environmentUrl, 'utf8'))

    expect(environment.WEB_URL).toBe('http://web.localhost:3001')
    expect(environment.DASHBOARD_URL).toBe('http://dashboard.localhost:3002')
    expect(environment.ADMIN_URL).toBe('http://admin.localhost:3003')
  })

  test('versioned development runtime environment relies on derived CORS origins', async () => {
    const environment = parseEnvironment(
      await readFile(
        new URL('../deploy/env/development.runtime.env.example', import.meta.url),
        'utf8'
      )
    )

    expect(environment.CORS_ALLOWED_ORIGINS).toBeUndefined()
    expect(apiConfigSchema.parse(environment).CORS_ALLOWED_ORIGINS).toEqual([
      'http://web.localhost:3001',
      'http://dashboard.localhost:3002',
      'http://admin.localhost:3003',
    ])
  })
})
