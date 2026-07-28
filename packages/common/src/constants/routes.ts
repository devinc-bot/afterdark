export const CLIENT_ROUTES = {
  resetPassword: () => '/reset-password' as const,
  registerConfirm: () => '/register/confirm' as const,
  authCallback: () => '/auth/callback' as const,
  login: () => '/login' as const,
} as const
