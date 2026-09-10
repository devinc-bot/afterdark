import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CurrentUserResponse } from '@repo/types'
import { useSessionStore } from '~/modules/common/stores/session.store'
import { PROFILE_QUERY_KEY } from '~/modules/settings/queries/use-profile'
import { removeMyAvatar, uploadMyAvatar } from '~/modules/settings/services/profile.service'

export function useUploadMyAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadMyAvatar,
    onSuccess: async ({ avatar }) => {
      queryClient.setQueryData<CurrentUserResponse>(PROFILE_QUERY_KEY, (profile) =>
        profile ? { ...profile, avatar } : profile
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
        useSessionStore.getState().loadSession(),
      ])
    },
  })
}

export function useRemoveMyAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeMyAvatar,
    onSuccess: async ({ avatar }) => {
      queryClient.setQueryData<CurrentUserResponse>(PROFILE_QUERY_KEY, (profile) =>
        profile ? { ...profile, avatar } : profile
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
        useSessionStore.getState().loadSession(),
      ])
    },
  })
}
