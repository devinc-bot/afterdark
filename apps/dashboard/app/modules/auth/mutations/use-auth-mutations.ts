import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { LoginInput } from '@afterdark/validators'
import { DASHBOARD_ROUTES } from '../../shared/constants/routes'
import { loginFn } from '../services/auth.service'
import { saveAuthSession } from '../utils/auth-storage.utils'

export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: LoginInput) => loginFn({ data: input }),
    onSuccess: async (session) => {
      saveAuthSession(session)
      await navigate({ to: DASHBOARD_ROUTES.properties() })
    },
  })
}
