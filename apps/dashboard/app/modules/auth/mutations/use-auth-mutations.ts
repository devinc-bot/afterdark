import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type {
  ConfirmUserRegistrationInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterOwnerInput,
  ResetPasswordInput,
} from '@repo/validators'
import { useSessionStore } from '~/modules/common/stores/session.store'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'
import {
  confirmOwnerRegistrationFn,
  forgotPasswordFn,
  loginFn,
  requestRegisterOwnerFn,
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
      await navigate({ to: DASHBOARD_ROUTES.home() })
    },
  })
}

export function useRequestRegister() {
  return useMutation({
    mutationFn: (input: RegisterOwnerInput) => requestRegisterOwnerFn({ data: input }),
  })
}

export function useConfirmOwnerRegistration() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: ConfirmUserRegistrationInput) =>
      confirmOwnerRegistrationFn({ data: input }),
    onSuccess: async (session) => {
      saveAuthSession(session)
      await useSessionStore.getState().loadSession()
      await navigate({ to: DASHBOARD_ROUTES.home() })
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
