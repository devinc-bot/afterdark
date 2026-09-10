import type { AvatarMutationResponse, CurrentUserResponse } from '@repo/types'
import { AVATAR_MULTIPART_FIELD, type UpdateCurrentUserProfileInput } from '@repo/validators'
import { buildApiPath, toApiServiceError } from '@repo/common'
import { i18n } from '@repo/i18n/client'
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

export async function uploadMyAvatar(avatar: Blob): Promise<AvatarMutationResponse> {
  const formData = new FormData()
  formData.append(AVATAR_MULTIPART_FIELD, avatar, 'avatar.webp')

  try {
    return await api.put<AvatarMutationResponse>(
      buildApiPath(API_ROUTES.settings, API_ROUTES.settings.path.avatar()),
      formData
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('settings:web.profile.uploadError'))
  }
}

export async function removeMyAvatar(): Promise<AvatarMutationResponse> {
  try {
    return await api.delete<AvatarMutationResponse>(
      buildApiPath(API_ROUTES.settings, API_ROUTES.settings.path.avatar())
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('settings:web.profile.removeError'))
  }
}
