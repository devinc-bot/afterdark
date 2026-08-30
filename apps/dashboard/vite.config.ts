import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'

const DASHBOARD_BUILD_ENV_KEY = 'VITE_API_URL'

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
      host: '0.0.0.0',
      port: 3002,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 3002,
      strictPort: true,
    },
  }
})
