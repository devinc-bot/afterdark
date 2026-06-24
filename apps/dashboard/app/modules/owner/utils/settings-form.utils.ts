import { SETTINGS_COPY } from '~/modules/owner/constants/settings.copy'
import { NOTIFICATION_FIELD_BY_ID } from '~/modules/owner/constants/settings-form'
import { settingsFormSchema, type SettingsFormValues } from '@afterdark/validators'
import type { ZodError } from 'zod'

type ProfileField = 'name' | 'lastName' | 'phone' | 'birthday' | 'nationalId' | 'taxId'

export type SettingsFieldErrors = {
  profile?: Partial<Record<ProfileField, string>>
  organization?: Partial<Record<'brandName' | 'location', string>>
  security?: Partial<Record<'twoFactorEnabled', string>>
  preferences?: {
    language?: string
    notifications?: Partial<
      Record<'ticketSales' | 'inventory' | 'registration' | 'securityLog', string>
    >
  }
}

export function mapSettingsFormErrors(error: ZodError): SettingsFieldErrors {
  const fieldErrors: SettingsFieldErrors = {}

  for (const issue of error.issues) {
    const [section, field, nestedField] = issue.path

    if (typeof section !== 'string' || typeof field !== 'string') {
      continue
    }

    if (section === 'profile') {
      fieldErrors.profile ??= {}
      fieldErrors.profile[field as ProfileField] = issue.message
      continue
    }

    if (section === 'preferences' && field === 'notifications' && typeof nestedField === 'string') {
      const notificationKey = nestedField as
        | 'ticketSales'
        | 'inventory'
        | 'registration'
        | 'securityLog'
      fieldErrors.preferences ??= { notifications: {} }
      fieldErrors.preferences.notifications ??= {}
      fieldErrors.preferences.notifications[notificationKey] = issue.message
      continue
    }

    const sectionErrors = (fieldErrors[section as keyof SettingsFieldErrors] ?? {}) as Record<
      string,
      string
    >
    sectionErrors[field] = issue.message

    if (section === 'organization') {
      fieldErrors.organization = sectionErrors as SettingsFieldErrors['organization']
    } else if (section === 'security') {
      fieldErrors.security = sectionErrors as SettingsFieldErrors['security']
    } else if (section === 'preferences') {
      fieldErrors.preferences ??= {}
      fieldErrors.preferences[field as 'language'] = issue.message
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
  if (errors.organization?.brandName) {
    return 'settings-brand-name'
  }
  if (errors.organization?.location) {
    return 'settings-club-location'
  }
  if (errors.preferences?.language) {
    return 'settings-language'
  }

  const notificationErrors = errors.preferences?.notifications
  if (notificationErrors) {
    for (const [optionId, field] of Object.entries(NOTIFICATION_FIELD_BY_ID)) {
      if (notificationErrors[field]) {
        return `settings-notification-${optionId}`
      }
    }
  }

  return null
}

export function focusSettingsField(fieldId: string) {
  requestAnimationFrame(() => {
    document.getElementById(fieldId)?.focus()
  })
}

export function resolveSaveErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return SETTINGS_COPY.messages.saveFallback
}
