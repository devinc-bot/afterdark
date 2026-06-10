import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  envDir: '../..',
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      srcDirectory: 'app',
    }),
    react(),
  ],
  server: {
    port: 3002,
  },
})
