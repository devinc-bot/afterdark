import type { CurrentOwnerResponse } from '@repo/types'
import {
  ownerSettingsFormSchema,
  type OwnerSettingsFormValues,
  type UpdateCurrentOwnerInput,
} from '@repo/validators'
import { createSettingsFormProvider } from '~/modules/settings/hooks/settings-form-context'
import { toOwnerFormValues } from '~/modules/owner/utils/settings-form-values.formatter'

const OWNER_PROFILE_FIELD_ORDER = [
  'name',
  'lastName',
  'phone',
  'birthday',
  'nationalId',
  'isOrganization',
  'organizationName',
  'taxId',
  'address',
] as const

function toOwnerApiPayload(profile: OwnerSettingsFormValues['profile']): UpdateCurrentOwnerInput {
  const { isOrganization: _isOrganization, ...payload } = profile
  return payload
}

export const { Provider: SettingsFormProvider, useSettingsForm } = createSettingsFormProvider<
  CurrentOwnerResponse,
  OwnerSettingsFormValues['profile']
>({
  formSchema: ownerSettingsFormSchema,
  toFormValues: toOwnerFormValues,
  fieldOrder: OWNER_PROFILE_FIELD_ORDER,
  toApiPayload: toOwnerApiPayload,
})
