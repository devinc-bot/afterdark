import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type {
  ConfirmUserRegistrationInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterUserInput,
  ResetPasswordInput,
} from '@repo/validators'
import { WEB_ROUTES } from '../../common/constants/routes'
import { useSessionStore } from '../../common/stores/session.store'
import {
  confirmUserRegistrationFn,
  forgotPasswordFn,
  loginFn,
  requestRegisterUserFn,
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

export function useRequestRegister() {
  return useMutation({
    mutationFn: (input: RegisterUserInput) => requestRegisterUserFn({ data: input }),
  })
}

export function useConfirmUserRegistration() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: ConfirmUserRegistrationInput) => confirmUserRegistrationFn({ data: input }),
    onSuccess: async (session) => {
      saveAuthSession(session)
      await useSessionStore.getState().loadSession()
      await navigate({ to: WEB_ROUTES.home() })
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
