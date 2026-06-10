export const MODE = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const

export type Mode = (typeof MODE)[keyof typeof MODE]
