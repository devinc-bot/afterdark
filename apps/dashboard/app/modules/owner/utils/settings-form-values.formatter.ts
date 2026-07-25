import type { CurrentOwnerResponse } from '@repo/types'
import type { SettingsFormValues } from '@repo/validators'

export function toOwnerFormValues(owner: CurrentOwnerResponse): SettingsFormValues {
  return {
    profile: {
      name: owner.name,
      lastName: owner.lastName,
      phone: owner.phone,
      birthday: owner.birthday ?? '',
      nationalId: owner.nationalId ?? '',
      taxId: owner.taxId ?? '',
      address: {
        address: owner.address?.address ?? '',
        streetNumber: owner.address?.streetNumber ?? '',
        state: owner.address?.state ?? '',
        city: owner.address?.city ?? '',
      },
    },
  }
}
