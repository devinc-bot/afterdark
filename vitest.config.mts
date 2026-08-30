import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@repo/i18n/server': fileURLToPath(
        new URL('./test/mocks/translation-service.ts', import.meta.url)
      ),
    },
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
