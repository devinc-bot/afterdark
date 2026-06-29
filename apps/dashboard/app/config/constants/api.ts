import { clientEnv } from '~/config/env'

export const API_BASE_URL = clientEnv.VITE_API_URL

export const API_AUTH_PREFIX = '/api/auth' as const
export const API_OWNERS_PREFIX = '/api/owners' as const
export const API_SESSION_PREFIX = '/api/session' as const
export const API_CLUBS_PREFIX = '/api/clubs' as const
export const API_STAFF_PREFIX = '/api/staff' as const
export const API_INVITATIONS_PREFIX = '/api/invitations' as const

export const API_ROUTES = {
  auth: {
    prefix: API_AUTH_PREFIX,
    path: {
      login: () => '/login' as const,
      registerUser: () => '/register/user' as const,
      registerOwner: () => '/register/owner' as const,
      refreshToken: () => '/refresh' as const,
    },
  },
  owners: {
    prefix: API_OWNERS_PREFIX,
    path: {
      details: () => '/details' as const,
      me: () => '/me' as const,
    },
  },
  session: {
    prefix: API_SESSION_PREFIX,
    path: {
      me: () => '/me' as const,
    },
  },
  clubs: {
    prefix: API_CLUBS_PREFIX,
    path: {
      list: () => '/my-clubs' as const,
      create: () => '/create' as const,
      update: (documentId: string) => `/${documentId}` as const,
      delete: (documentId: string) => `/${documentId}` as const,
    },
  },
  staff: {
    prefix: API_STAFF_PREFIX,
    path: {
      listMyPersonnel: () => '/my-personnel' as const,
    },
  },
  invitations: {
    prefix: API_INVITATIONS_PREFIX,
    path: {
      staff: () => '/staff' as const,
      staffByLink: (slug: string, token: string) =>
        `/staff/${encodeURIComponent(slug)}/${encodeURIComponent(token)}` as const,
      acceptStaff: (slug: string, token: string) =>
        `/staff/${encodeURIComponent(slug)}/${encodeURIComponent(token)}/accept` as const,
      deleteStaff: (documentId: string) => `/staff/${documentId}` as const,
    },
  },
  login: () => `${API_BASE_URL}${API_AUTH_PREFIX}/login` as const,
  registerOwner: () => `${API_BASE_URL}${API_AUTH_PREFIX}/register/owner` as const,
  currentOwner: () => `${API_BASE_URL}${API_OWNERS_PREFIX}/details` as const,
} as const
