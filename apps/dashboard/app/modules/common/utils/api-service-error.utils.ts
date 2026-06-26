import { QueryFactoryError } from '~/modules/common/utils/query-factory'

export function toApiServiceError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof QueryFactoryError) {
    const apiMessage = error.body?.message
    return new Error(typeof apiMessage === 'string' ? apiMessage : fallbackMessage)
  }

  return new Error(fallbackMessage)
}

export function throwApiServiceError(error: unknown, fallbackMessage: string): never {
  throw toApiServiceError(error, fallbackMessage)
}
