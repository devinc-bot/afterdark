import { SETTINGS_COPY } from '~/modules/owner/constants/settings.copy'
import type { CurrentOwnerResponse } from '@afterdark/types'
import type { UpdateCurrentOwnerInput } from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

const UPDATE_OWNER_FALLBACK_ERROR = SETTINGS_COPY.messages.saveFallback

function ownersApiPath(path: string) {
  return `${API_ROUTES.owners.prefix}${path}`
}

export async function updateCurrentOwner(
  input: UpdateCurrentOwnerInput
): Promise<CurrentOwnerResponse> {
  try {
    return await api.patch<CurrentOwnerResponse>(ownersApiPath(API_ROUTES.owners.path.me()), input)
  } catch (error) {
    throw toApiServiceError(error, UPDATE_OWNER_FALLBACK_ERROR)
  }
}
