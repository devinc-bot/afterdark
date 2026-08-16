import type { CurrentOwnerResponse } from '@repo/types'
import { ownerSettingsFormSchema, type OwnerSettingsFormValues } from '@repo/validators'
import { createSettingsFormProvider } from '~/modules/settings/hooks/settings-form-context'
import { toOwnerFormValues } from '~/modules/owner/utils/settings-form-values.formatter'

const OWNER_PROFILE_FIELD_ORDER = [
  'name',
  'lastName',
  'phone',
  'birthday',
  'nationalId',
  'organizationName',
  'taxId',
  'address',
] as const

export const { Provider: SettingsFormProvider, useSettingsForm } = createSettingsFormProvider<
  CurrentOwnerResponse,
  OwnerSettingsFormValues['profile']
>({
  formSchema: ownerSettingsFormSchema,
  toFormValues: toOwnerFormValues,
  fieldOrder: OWNER_PROFILE_FIELD_ORDER,
})
