import type { TFunction } from 'i18next'

const VALIDATION_NAMESPACE_PREFIX = 'validation:'

export function translateValidationMessage(message: string, t: TFunction<'validation'>): string {
  if (message.startsWith(VALIDATION_NAMESPACE_PREFIX)) {
    const key = message.slice(VALIDATION_NAMESPACE_PREFIX.length)
    // Dynamic keys — verified at runtime by check:i18n
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (t as any)(key) as string
  }

  return message
}

function extractFieldErrorMessage(errors: ReadonlyArray<unknown>): string | null {
  const [first] = errors
  if (!first) return null
  if (typeof first === 'string') return first
  if (typeof first === 'object' && first !== null && 'message' in first) {
    return String((first as { message: unknown }).message)
  }
  return null
}

export function resolveFieldError(
  errors: ReadonlyArray<unknown>,
  t: TFunction<'validation'>
): string | null {
  const message = extractFieldErrorMessage(errors)
  if (!message) return null
  return translateValidationMessage(message, t)
}
