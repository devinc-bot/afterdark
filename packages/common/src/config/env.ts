import { clientApiEnvSchema } from '@repo/validators'

function getImportMetaEnv(): Record<string, unknown> {
  return (import.meta as { env?: Record<string, unknown> }).env ?? {}
}

const envResult = clientApiEnvSchema.safeParse(getImportMetaEnv())
if (!envResult.success) {
  throw new Error('Error validating client environment variables', { cause: envResult.error })
}

export const clientEnv = envResult.data
