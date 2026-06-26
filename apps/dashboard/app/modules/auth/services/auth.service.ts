import { createServerFn } from '@tanstack/react-start'
import { loginSchema, registerOwnerSchema } from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { throwApiServiceError } from '~/modules/common/utils/api-service-error.utils'
import type { LoginResponse, RegisterResponse } from '@afterdark/types'

const LOGIN_FALLBACK_ERROR = 'No pudimos iniciar sesión. Intentá de nuevo en unos minutos.'
const REGISTER_FALLBACK_ERROR = 'No pudimos crear tu cuenta. Intentá de nuevo en unos minutos.'

function authApiPath(path: string) {
  return `${API_ROUTES.auth.prefix}${path}`
}

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
      authApiPath(API_ROUTES.auth.path.login()),
      data,
      LOGIN_FALLBACK_ERROR
    )
  })

export const registerOwnerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerOwnerSchema)
  .handler(async ({ data }): Promise<RegisterResponse> => {
    return postAuth<RegisterResponse>(
      authApiPath(API_ROUTES.auth.path.registerOwner()),
      data,
      REGISTER_FALLBACK_ERROR
    )
  })
