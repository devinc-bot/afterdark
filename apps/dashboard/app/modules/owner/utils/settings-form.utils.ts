import { settingsFormSchema, type SettingsFormValues } from '@afterdark/validators'
import type { ZodError } from 'zod'

type ProfileField = 'name' | 'lastName' | 'phone' | 'birthday' | 'nationalId' | 'taxId'

export type SettingsFieldErrors = {
  profile?: Partial<Record<ProfileField, string>>
}

export function mapSettingsFormErrors(error: ZodError): SettingsFieldErrors {
  const fieldErrors: SettingsFieldErrors = {}

  for (const issue of error.issues) {
    const [section, field] = issue.path

    if (typeof section !== 'string' || typeof field !== 'string') {
      continue
    }

    if (section === 'profile') {
      fieldErrors.profile ??= {}
      fieldErrors.profile[field as ProfileField] = issue.message
    }
  }

  return fieldErrors
}

export function validateSettingsForm(values: SettingsFormValues) {
  return settingsFormSchema.safeParse(values)
}

export function getFirstInvalidFieldId(errors: SettingsFieldErrors): string | null {
  if (errors.profile?.name) {
    return 'settings-name'
  }
  if (errors.profile?.lastName) {
    return 'settings-last-name'
  }
  if (errors.profile?.phone) {
    return 'settings-phone'
  }
  if (errors.profile?.birthday) {
    return 'settings-birthday'
  }
  if (errors.profile?.nationalId) {
    return 'settings-national-id'
  }
  if (errors.profile?.taxId) {
    return 'settings-tax-id'
  }

  return null
}

export function focusSettingsField(fieldId: string) {
  requestAnimationFrame(() => {
    document.getElementById(fieldId)?.focus()
  })
}

export function resolveSaveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
