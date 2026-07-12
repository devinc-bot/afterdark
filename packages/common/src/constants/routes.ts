export const CLIENT_ROUTES = {
  resetPassword: () => '/reset-password' as const,
  authCallback: () => '/auth/callback' as const,
  login: () => '/login' as const,
} as const
