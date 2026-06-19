import { SETTINGS_COPY } from '~/modules/settings/constants/settings.copy'
import type { CurrentUserResponse } from '@afterdark/types'
import type { UpdateCurrentUserInput } from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { QueryFactoryError } from '~/modules/common/utils/query-factory'

const UPDATE_USER_FALLBACK_ERROR = SETTINGS_COPY.messages.saveFallback

function usersApiPath(path: string) {
  return `${API_ROUTES.users.prefix}${path}`
}

export async function updateCurrentUser(
  input: UpdateCurrentUserInput
): Promise<CurrentUserResponse> {
  try {
    return await api.patch<CurrentUserResponse>(usersApiPath(API_ROUTES.users.path.me()), input)
  } catch (error) {
    if (error instanceof QueryFactoryError) {
      const apiMessage = error.body?.message
      throw new Error(typeof apiMessage === 'string' ? apiMessage : UPDATE_USER_FALLBACK_ERROR)
    }

    throw new Error(UPDATE_USER_FALLBACK_ERROR)
  }
}
