import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateCurrentUserProfileInput } from '@afterdark/validators'
import { useSessionStore } from '~/modules/common/stores/session.store'
import { PROFILE_QUERY_KEY } from '~/modules/settings/queries/use-profile'
import { updateMyProfile } from '~/modules/settings/services/profile.service'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCurrentUserProfileInput) => updateMyProfile(input),
    onSuccess: async (profile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile)
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      await useSessionStore.getState().loadSession()
    },
  })
}
