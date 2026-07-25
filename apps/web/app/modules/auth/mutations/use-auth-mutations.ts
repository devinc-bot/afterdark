import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from '@repo/ui'
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterUserInput,
  ResetPasswordInput,
} from '@repo/validators'
import { WEB_ROUTES } from '../../common/constants/routes'
import { useSessionStore } from '../../common/stores/session.store'
import {
  forgotPasswordFn,
  loginFn,
  registerUserFn,
  resetPasswordFn,
} from '../services/auth.service'
import { saveAuthSession } from '../utils/auth-storage.utils'

export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: LoginInput) => loginFn({ data: input }),
    onSuccess: async (session) => {
      saveAuthSession(session)
      await useSessionStore.getState().loadSession()
      await navigate({ to: WEB_ROUTES.home() })
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  return useMutation({
    mutationFn: (input: RegisterUserInput) => registerUserFn({ data: input }),
    onSuccess: async () => {
      toast.success(t('register.success'))
      await navigate({ to: WEB_ROUTES.login() })
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => forgotPasswordFn({ data: input }),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => resetPasswordFn({ data: input }),
  })
}
