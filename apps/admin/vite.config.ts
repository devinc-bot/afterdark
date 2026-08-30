import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'

const ADMIN_BUILD_ENV_KEY = 'VITE_API_URL'

function validateAdminBuildEnv(value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required admin build environment variable: ${ADMIN_BUILD_ENV_KEY}`)
  }

  try {
    new URL(value)
  } catch {
    throw new Error(`Invalid admin build environment variable: ${ADMIN_BUILD_ENV_KEY}`)
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  validateAdminBuildEnv(env[ADMIN_BUILD_ENV_KEY])

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
      port: 3003,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 3003,
      strictPort: true,
    },
  }
})
