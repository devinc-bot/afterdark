import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SettingsResponse } from '@repo/types'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { useSessionStore } from '~/modules/common/stores/session.store'
import { removeMyAvatar, uploadMyAvatar } from '~/modules/settings/services/settings.service'

function useAvatarMutationSuccess() {
  const queryClient = useQueryClient()

  return async (avatar: string | null) => {
    queryClient.setQueryData<SettingsResponse>(QUERY_KEYS.settings(), (settings) =>
      settings ? { ...settings, avatar } : settings
    )
    useSessionStore.setState((state) => ({
      user: state.user ? { ...state.user, avatar } : null,
    }))
  }
}

export function useUploadMyAvatar() {
  const onAvatarChanged = useAvatarMutationSuccess()

  return useMutation({
    mutationFn: uploadMyAvatar,
    onSuccess: ({ avatar }) => onAvatarChanged(avatar),
  })
}

export function useRemoveMyAvatar() {
  const onAvatarChanged = useAvatarMutationSuccess()

  return useMutation({
    mutationFn: removeMyAvatar,
    onSuccess: ({ avatar }) => onAvatarChanged(avatar),
  })
}
