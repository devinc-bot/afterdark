import type { SettingsFormValues } from '@afterdark/validators'
import type { CurrentOwnerResponse } from '@afterdark/types'

export function createSettingsFormValues(user: CurrentOwnerResponse): SettingsFormValues {
  return {
    profile: {
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      birthday: user.birthday ?? '',
      nationalId: user.nationalId ?? '',
      taxId: user.taxId ?? '',
    },
  }
}

export function settingsValuesEqual(a: SettingsFormValues, b: SettingsFormValues): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
