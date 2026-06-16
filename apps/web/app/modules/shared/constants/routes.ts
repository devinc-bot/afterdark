export const WEB_ROUTES = {
  home: () => '/' as const,
  properties: () => '/properties' as const,
  property: (id: string) => `/properties/${id}` as const,
  login: () => '/login' as const,
  register: () => '/register' as const,
  forgotPassword: () => '/forgot-password' as const,
} as const

export const AUTH_ROUTE_PATHS = new Set<string>([
  WEB_ROUTES.login(),
  WEB_ROUTES.register(),
  WEB_ROUTES.forgotPassword(),
])
