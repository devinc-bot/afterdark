import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Each client defines `~/` relative to its own `app/` directory. For example,
// dashboard's `~/modules/...` resolves to `apps/dashboard/app/modules/...`, while
// admin's resolves to `apps/admin/app/modules/...`. Root Vitest runs all client
// tests together, so it needs the importer path to select the right app.
const APP_ALIAS_IMPORTER_PATTERN = /[/\\]apps[/\\](web|dashboard|admin)[/\\](?:app|test)[/\\]/

function resolveAppAlias(source: string, importer?: string) {
  if (!source.startsWith('~/') || !importer) {
    return null
  }

  const appRootMatch = importer.match(APP_ALIAS_IMPORTER_PATTERN)
  if (appRootMatch?.index === undefined) {
    return null
  }

  // Keep resolved paths valid on local Windows runs (`C:\\Dev\\...`) and POSIX
  // CI runners (`/workspace/...`).
  const separator = importer.includes('\\') ? '\\' : '/'
  const projectRoot = importer.slice(0, appRootMatch.index)

  return `${projectRoot}${separator}apps${separator}${appRootMatch[1]}${separator}app${separator}${source.slice(
    2
  )}`
}

export default defineConfig({
  plugins: [
    {
      name: 'resolve-app-alias',
      enforce: 'pre',
      resolveId: resolveAppAlias,
    },
  ],
  resolve: {
    alias: [
      {
        find: '@repo/i18n/server',
        replacement: fileURLToPath(new URL('./test/mocks/translation-service.ts', import.meta.url)),
      },
    ],
  },
  oxc: false,
  esbuild: {
    target: 'es2022',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  },
  test: {
    server: {
      deps: {
        inline: [/^@repo\//],
      },
    },
    environment: 'node',
    globals: false,
    include: [
      'apps/**/*.test.ts',
      'apps/**/*.test.tsx',
      'packages/**/*.test.ts',
      'packages/**/*.test.tsx',
      'test/**/*.test.ts',
      'test/**/*.test.tsx',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.output/**',
      '**/.vinxi/**',
      '**/coverage/**',
      'e2e/**',
      'playwright-report/**',
      'test-results/**',
      '**/routeTree.gen.ts',
    ],
    setupFiles: ['./test/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    passWithNoTests: false,
    css: false,
  },
})
