import type { Logger } from '@nestjs/common'

export type RunCleanupJobOptions = {
  logger: Logger
  failureMessage: string
  successMessage?: (deleted: number) => string
  run: () => Promise<number | void>
}

export async function runCleanupJob(options: RunCleanupJobOptions): Promise<void> {
  try {
    const result = await options.run()
    if (typeof result === 'number' && result > 0 && options.successMessage) {
      options.logger.log(options.successMessage(result))
    }
  } catch (error) {
    options.logger.error(options.failureMessage, error)
  }
}
