import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { LoginInput, RegisterOwnerInput } from '@afterdark/validators'
import { useSessionStore } from '~/modules/common/stores/session.store'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'
import { loginFn, registerOwnerFn } from '../services/auth.service'
import { saveAuthSession } from '../utils/auth-storage.utils'

export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: LoginInput) => loginFn({ data: input }),
    onSuccess: async (session) => {
      saveAuthSession(session)
      await useSessionStore.getState().loadSession()
      await navigate({ to: DASHBOARD_ROUTES.home() })
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: RegisterOwnerInput) => registerOwnerFn({ data: input }),
    onSuccess: async () => {
      await navigate({ to: DASHBOARD_ROUTES.login() })
    },
  })
}
