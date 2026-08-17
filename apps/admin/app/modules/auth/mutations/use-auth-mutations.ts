import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { LoginInput } from '@repo/validators'
import { translateSync } from '@repo/i18n'
import { clearAuthenticatedState } from '~/modules/auth/utils/sign-out.utils'
import { ADMIN_ROUTES } from '~/modules/common/constants/routes'
import { useSessionStore } from '~/modules/common/stores/session.store'
import { isAdminSession } from '~/modules/common/utils/session.utils'
import { loginFn } from '../services/auth.service'
import { saveAuthSession } from '../utils/auth-storage.utils'

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LoginInput) => loginFn({ data: input }),
    onSuccess: async (session) => {
      saveAuthSession(session)
      await useSessionStore.getState().loadSession()

      if (!isAdminSession(useSessionStore.getState().user)) {
        clearAuthenticatedState(queryClient)
        throw new Error(translateSync('admin:accessDenied'))
      }

      await navigate({ to: ADMIN_ROUTES.home() })
    },
  })
}
