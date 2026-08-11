export const CLIENT_ROUTES = {
  resetPassword: () => '/reset-password' as const,
  registerConfirm: () => '/register/confirm' as const,
  authCallback: () => '/auth/callback' as const,
  login: () => '/login' as const,
  checkoutSuccess: (orderId: string) => `/checkout/${orderId}/success` as const,
  checkoutError: (orderId: string) => `/checkout/${orderId}/error` as const,
  checkoutPending: (orderId: string) => `/checkout/${orderId}/pending` as const,
} as const
