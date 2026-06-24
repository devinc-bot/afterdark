import {
  settingsStoredValuesSchema,
  type SettingsFormValues,
  type SettingsStoredValues,
} from '@afterdark/validators'
import type { CurrentOwnerResponse } from '@afterdark/types'
import { SETTINGS_STORAGE_KEY } from '~/modules/owner/constants/settings-form'
import { NOTIFICATION_FIELD_BY_ID } from '~/modules/owner/constants/settings-form'
import { NOTIFICATION_OPTIONS } from '~/modules/owner/constants/settings.mock'

function defaultNotifications(): SettingsStoredValues['preferences']['notifications'] {
  const notifications: SettingsStoredValues['preferences']['notifications'] = {
    ticketSales: false,
    inventory: false,
    registration: false,
    securityLog: false,
  }

  for (const option of NOTIFICATION_OPTIONS) {
    const field = NOTIFICATION_FIELD_BY_ID[option.id]
    notifications[field] = option.defaultChecked
  }

  return notifications
}

export function createDefaultStoredSettings(): SettingsStoredValues {
  return {
    organization: {
      brandName: 'AFTERDARK',
      location: '',
    },
    security: {
      twoFactorEnabled: false,
    },
    preferences: {
      language: 'es',
      notifications: defaultNotifications(),
    },
  }
}

export function createSettingsFormValues(user: CurrentOwnerResponse): SettingsFormValues {
  const stored = loadStoredSettings()

  return {
    profile: {
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      birthday: user.birthday ?? '',
      nationalId: user.nationalId ?? '',
      taxId: user.taxId ?? '',
    },
    organization: stored.organization,
    security: stored.security,
    preferences: stored.preferences,
  }
}

export function loadStoredSettings(): SettingsStoredValues {
  if (typeof window === 'undefined') {
    return createDefaultStoredSettings()
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) {
      return createDefaultStoredSettings()
    }

    const parsed = settingsStoredValuesSchema.parse(JSON.parse(raw))
    return parsed
  } catch {
    return createDefaultStoredSettings()
  }
}

export function saveStoredSettings(values: SettingsStoredValues): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(values))
  } catch {
    // Quota exceeded or private browsing — preferences stay in memory for this session.
  }
}

export function settingsValuesEqual(a: SettingsFormValues, b: SettingsFormValues): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
