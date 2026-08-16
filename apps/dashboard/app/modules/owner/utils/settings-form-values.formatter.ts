import type { CurrentOwnerResponse } from '@repo/types'
import type { OwnerSettingsFormValues } from '@repo/validators'

export function toOwnerFormValues(owner: CurrentOwnerResponse): OwnerSettingsFormValues {
  const organizationName = owner.organizationName ?? ''
  const taxId = owner.taxId ?? ''

  return {
    profile: {
      name: owner.name,
      lastName: owner.lastName,
      phone: owner.phone,
      birthday: owner.birthday ?? '',
      nationalId: owner.nationalId ?? '',
      organizationName,
      taxId,
      address: {
        address: owner.address?.address ?? '',
        streetNumber: owner.address?.streetNumber ?? '',
        state: owner.address?.state ?? '',
        city: owner.address?.city ?? '',
      },
    },
  }
}
