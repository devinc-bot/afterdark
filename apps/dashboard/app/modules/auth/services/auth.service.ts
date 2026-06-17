import { createServerFn } from '@tanstack/react-start'
import { loginSchema, registerSchema } from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { QueryFactoryError } from '~/modules/shared/utils/query-factory'
import type { LoginResponse } from '@afterdark/types'

const LOGIN_FALLBACK_ERROR = 'No pudimos iniciar sesión. Intentá de nuevo en unos minutos.'
const REGISTER_FALLBACK_ERROR = 'No pudimos crear tu cuenta. Intentá de nuevo en unos minutos.'

function authApiPath(path: string) {
  return `${API_ROUTES.auth.prefix}${path}`
}

function throwAuthError(error: unknown, fallback: string): never {
  if (error instanceof QueryFactoryError) {
    const apiMessage = error.body?.message
    throw new Error(typeof apiMessage === 'string' ? apiMessage : fallback)
  }

  throw new Error(fallback)
}

async function postAuth<T>(path: string, data: unknown, fallback: string): Promise<T> {
  try {
    return await api.post<T>(path, data)
  } catch (error) {
    throwAuthError(error, fallback)
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

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerSchema)
  .handler(async ({ data }): Promise<LoginResponse> => {
    return postAuth<LoginResponse>(
      authApiPath(API_ROUTES.auth.path.register()),
      data,
      REGISTER_FALLBACK_ERROR
    )
  })
