import type { SettingsResponse } from '@afterdark/types'
import type { UpdateCurrentOwnerInput } from '@afterdark/validators'
import { i18n } from '@afterdark/i18n/client'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

export function getSettings() {
  return api.get<SettingsResponse>(API_ROUTES.settings.prefix)
}

export async function fetchSettings(): Promise<SettingsResponse> {
  try {
    return await getSettings()
  } catch (error) {
    throw toApiServiceError(error, i18n.t('settings:messages.loadFallback'))
  }
}

export async function updateSettings(input: UpdateCurrentOwnerInput): Promise<SettingsResponse> {
  try {
    return await api.patch<SettingsResponse>(API_ROUTES.settings.prefix, input)
  } catch (error) {
    throw toApiServiceError(error, '')
  }
}
