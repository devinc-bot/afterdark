import type { CurrentStaffResponse } from '@repo/types'
import { staffSettingsFormSchema, type StaffSettingsFormValues } from '@repo/validators'
import { createSettingsFormProvider } from '~/modules/settings/hooks/settings-form-context'

function toStaffFormValues(staff: CurrentStaffResponse): StaffSettingsFormValues {
  return {
    profile: {
      name: staff.name,
      lastName: staff.lastName,
      phone: staff.phone,
    },
  }
}

const STAFF_PROFILE_FIELD_ORDER = ['name', 'lastName', 'phone'] as const

export const { Provider: StaffSettingsFormProvider, useSettingsForm: useStaffSettingsForm } =
  createSettingsFormProvider<CurrentStaffResponse, StaffSettingsFormValues['profile']>({
    formSchema: staffSettingsFormSchema,
    toFormValues: toStaffFormValues,
    fieldOrder: STAFF_PROFILE_FIELD_ORDER,
  })
