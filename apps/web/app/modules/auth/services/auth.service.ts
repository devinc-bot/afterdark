import { createServerFn } from '@tanstack/react-start'
import {
  confirmUserRegistrationSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@repo/validators'
import { translateSync } from '@repo/i18n'
import { throwApiServiceError, buildApiPath } from '@repo/common'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/api'
import type { LoginResponse } from '@repo/types'

async function postAuth<T>(path: string, data: unknown, fallback: string): Promise<T> {
  try {
    return await api.post<T>(path, data)
  } catch (error) {
    throwApiServiceError(error, fallback)
  }
}

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }): Promise<LoginResponse> => {
    return postAuth<LoginResponse>(
      buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.login()),
      data,
      translateSync('auth:login.error.fallback')
    )
  })

export const requestRegisterUserFn = createServerFn({ method: 'POST' })
  .inputValidator(registerSchema)
  .handler(async ({ data }): Promise<void> => {
    return postAuth<void>(
      buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.registerUserRequest()),
      data,
      translateSync('auth:register.error.fallback')
    )
  })

export const confirmUserRegistrationFn = createServerFn({ method: 'POST' })
  .inputValidator(confirmUserRegistrationSchema)
  .handler(async ({ data }): Promise<LoginResponse> => {
    return postAuth<LoginResponse>(
      buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.registerUserConfirm()),
      data,
      translateSync('auth:register.confirm.error.fallback')
    )
  })

export const forgotPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(forgotPasswordSchema)
  .handler(async ({ data }): Promise<void> => {
    return postAuth<void>(
      buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.forgotPassword()),
      data,
      translateSync('auth:forgotPassword.error.fallback')
    )
  })

export const resetPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(resetPasswordSchema)
  .handler(async ({ data }): Promise<void> => {
    return postAuth<void>(
      buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.resetPassword()),
      data,
      translateSync('auth:resetPassword.error.fallback')
    )
  })
