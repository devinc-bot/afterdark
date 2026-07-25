import type { SettingsResponse } from '@repo/types'
import { i18n } from '@repo/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@repo/common'

export function getSettings() {
  return api.get<SettingsResponse>(
    buildApiPath(API_ROUTES.settings, API_ROUTES.settings.path.root())
  )
}

export async function fetchSettings(): Promise<SettingsResponse> {
  try {
    return await getSettings()
  } catch (error) {
    throw toApiServiceError(error, i18n.t('settings:messages.loadFallback'))
  }
}

export async function updateSettings<T extends Record<string, unknown>>(
  input: T
): Promise<SettingsResponse> {
  try {
    return await api.patch<SettingsResponse>(
      buildApiPath(API_ROUTES.settings, API_ROUTES.settings.path.root()),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, '')
  }
}
