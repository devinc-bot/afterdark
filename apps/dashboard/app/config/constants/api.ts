import { clientEnv } from '~/config/env'

export const API_BASE_URL = clientEnv.VITE_API_URL

export const API_AUTH_PREFIX = '/api/auth' as const

export const API_ROUTES = {
  auth: {
    prefix: API_AUTH_PREFIX,
    path: {
      login: () => '/login' as const,
      register: () => '/register' as const,
      refreshToken: () => '/refresh' as const,
    },
  },
  login: () => `${API_BASE_URL}${API_AUTH_PREFIX}/login` as const,
  register: () => `${API_BASE_URL}${API_AUTH_PREFIX}/register` as const,
} as const
