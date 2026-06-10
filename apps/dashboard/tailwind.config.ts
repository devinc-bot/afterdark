import type { Config } from 'tailwindcss'
import sharedConfig from '@afterdark/ui/tailwind.config'

export default {
  ...sharedConfig,
  content: ['./app/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
} satisfies Config
