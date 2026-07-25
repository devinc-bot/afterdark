import { createServerFn } from '@tanstack/react-start'
import {
  forgotPasswordSchema,
  loginSchema,
  registerOwnerSchema,
  resetPasswordSchema,
} from '@repo/validators'
import { translateSync } from '@repo/i18n'
import { API_ROUTES, api } from '~/config/api'
import { throwApiServiceError, buildApiPath } from '@repo/common'
import type { LoginResponse, RegisterResponse } from '@repo/types'

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

export const registerOwnerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerOwnerSchema)
  .handler(async ({ data }): Promise<RegisterResponse> => {
    return postAuth<RegisterResponse>(
      buildApiPath(API_ROUTES.auth, API_ROUTES.auth.path.registerOwner()),
      data,
      translateSync('auth:register.error.fallback')
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
