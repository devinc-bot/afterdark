import { clientEnv } from '~/config/env'

export const API_BASE_URL = clientEnv.VITE_API_URL

export const API_AUTH_PREFIX = '/api/auth' as const
export const API_USERS_PREFIX = '/api/users' as const
export const API_CLUBS_PREFIX = '/api/clubs' as const

export const API_ROUTES = {
  auth: {
    prefix: API_AUTH_PREFIX,
    path: {
      login: () => '/login' as const,
      register: () => '/register' as const,
      refreshToken: () => '/refresh' as const,
    },
  },
  users: {
    prefix: API_USERS_PREFIX,
    path: {
      me: () => '/me' as const,
    },
  },
  clubs: {
    prefix: API_CLUBS_PREFIX,
    path: {
      list: () => '' as const,
      create: () => '/create' as const,
      update: (documentId: string) => `/${documentId}` as const,
    },
  },
  login: () => `${API_BASE_URL}${API_AUTH_PREFIX}/login` as const,
  register: () => `${API_BASE_URL}${API_AUTH_PREFIX}/register` as const,
  currentUser: () => `${API_BASE_URL}${API_USERS_PREFIX}/me` as const,
} as const
