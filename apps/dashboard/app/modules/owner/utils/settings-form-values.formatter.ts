import type { CurrentOwnerResponse } from '@afterdark/types'
import type { SettingsFormValues } from '@afterdark/validators'

export function toOwnerFormValues(owner: CurrentOwnerResponse): SettingsFormValues {
  return {
    profile: {
      name: owner.name,
      lastName: owner.lastName,
      phone: owner.phone,
      birthday: owner.birthday ?? '',
      nationalId: owner.nationalId ?? '',
      taxId: owner.taxId ?? '',
    },
  }
}
