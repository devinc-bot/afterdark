import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'

const WEB_BUILD_ENV_KEYS = {
  apiUrl: 'VITE_API_URL',
  dashboardUrl: 'VITE_DASHBOARD_URL',
} as const

function validateBuildUrl(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required web build environment variable: ${name}`)
  }

  try {
    new URL(value)
  } catch {
    throw new Error(`Invalid web build environment variable: ${name}`)
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  validateBuildUrl(WEB_BUILD_ENV_KEYS.apiUrl, env[WEB_BUILD_ENV_KEYS.apiUrl])
  validateBuildUrl(WEB_BUILD_ENV_KEYS.dashboardUrl, env[WEB_BUILD_ENV_KEYS.dashboardUrl])

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
      port: 3001,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 3001,
      strictPort: true,
    },
  }
})
