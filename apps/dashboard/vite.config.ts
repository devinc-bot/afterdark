import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'

const DASHBOARD_BUILD_ENV_KEY = 'VITE_API_URL'

const DASHBOARD_DEVELOPMENT_SERVER = {
  host: '0.0.0.0',
  hostname: 'dashboard.localhost',
  port: 3002,
  apiPath: '/api',
  apiTarget: 'http://localhost:3000',
} as const

function validateDashboardBuildEnv(value: string | undefined) {
  if (!value) {
    throw new Error(
      `Missing required dashboard build environment variable: ${DASHBOARD_BUILD_ENV_KEY}`
    )
  }

  try {
    new URL(value)
  } catch {
    throw new Error(`Invalid dashboard build environment variable: ${DASHBOARD_BUILD_ENV_KEY}`)
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  validateDashboardBuildEnv(env[DASHBOARD_BUILD_ENV_KEY])

  return {
    plugins: [
      tailwindcss(),
      tsConfigPaths(),
      tanstackStart({
        srcDirectory: 'app',
      }),
      react(),
    ],
    server: {
      host: DASHBOARD_DEVELOPMENT_SERVER.host,
      allowedHosts: [DASHBOARD_DEVELOPMENT_SERVER.hostname],
      port: DASHBOARD_DEVELOPMENT_SERVER.port,
      strictPort: true,
      proxy: {
        [DASHBOARD_DEVELOPMENT_SERVER.apiPath]: {
          target: DASHBOARD_DEVELOPMENT_SERVER.apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: DASHBOARD_DEVELOPMENT_SERVER.host,
      port: DASHBOARD_DEVELOPMENT_SERVER.port,
      strictPort: true,
    },
  }
})
