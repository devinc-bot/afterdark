import type { CurrentUserResponse } from '@afterdark/types'
import type { UpdateCurrentUserProfileInput } from '@afterdark/validators'
import { buildApiPath, toApiServiceError } from '@afterdark/common'
import { i18n } from '@afterdark/i18n/client'
import { api, API_ROUTES } from '~/config/api'

export async function getMyProfile(): Promise<CurrentUserResponse> {
  try {
    return await api.get<CurrentUserResponse>(
      buildApiPath(API_ROUTES.settings, API_ROUTES.settings.path.root())
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('settings:web.messages.loadError'))
  }
}

export async function updateMyProfile(
  input: UpdateCurrentUserProfileInput
): Promise<CurrentUserResponse> {
  try {
    return await api.patch<CurrentUserResponse>(
      buildApiPath(API_ROUTES.settings, API_ROUTES.settings.path.root()),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('settings:web.messages.saveError'))
  }
}
