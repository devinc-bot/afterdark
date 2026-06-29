import { z, type core } from 'zod'
import type { TFunction } from 'i18next'

type ValidationT = TFunction<'validation'>

type RawZodIssue = core.$ZodRawIssue
type ZodCustomErrorMap = core.$ZodErrorMap

// Dynamic keys bypass strict type checking — keys verified at runtime by check:i18n
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t_any = (t: ValidationT, key: string, vars?: Record<string, unknown>): string =>
  (t as any)(key, vars) as string

function resolveZodMessage(t: ValidationT, issue: RawZodIssue): string {
  if (issue.code === 'invalid_type') {
    return t('zod.invalid_type')
  }

  if (issue.code === 'too_small') {
    const type = (issue as { type?: string }).type ?? 'string'
    return t_any(t, `zod.too_small.${type}`, {
      minimum: (issue as { minimum?: number }).minimum ?? 0,
    })
  }

  if (issue.code === 'too_big') {
    const type = (issue as { type?: string }).type ?? 'string'
    return t_any(t, `zod.too_big.${type}`, {
      maximum: (issue as { maximum?: number }).maximum ?? 0,
    })
  }

  if (issue.code === 'invalid_format') {
    const format = (issue as { format?: string }).format
    return t_any(t, format ? `zod.invalid_string.${format}` : 'zod.invalid_string.regex')
  }

  if (issue.code === 'invalid_value') {
    return t('zod.invalid_enum_value')
  }

  if (issue.code === 'not_multiple_of') {
    return t_any(t, 'zod.not_multiple_of', {
      multipleOf: (issue as { multipleOf?: number }).multipleOf ?? 0,
    })
  }

  if (issue.code === 'custom') {
    const message = issue.message
    if (message && message.includes(':')) {
      return t_any(t, message)
    }
    return message ?? t('zod.custom')
  }

  return t('zod.custom')
}

function createErrorMapHandler(t: ValidationT): ZodCustomErrorMap {
  return (issue) => {
    try {
      return { message: resolveZodMessage(t, issue) }
    } catch {
      return { message: issue.message ?? 'Invalid value' }
    }
  }
}

export function installZodI18n(t: ValidationT): void {
  z.config({
    customError: createErrorMapHandler(t),
  })
}

export function createZodErrorMap(t: ValidationT): ZodCustomErrorMap {
  return createErrorMapHandler(t)
}
