export const WEB_ROUTES = {
  home: () => '/' as const,
  properties: () => '/properties' as const,
  property: (id: string) => `/properties/${id}` as const,
  login: () => '/login' as const,
  register: () => '/register' as const,
  forgotPassword: () => '/forgot-password' as const,
} as const
