export const ADMIN_ROUTES = {
  home: () => '/users' as const,
  users: () => '/users' as const,
  errors: () => '/errors' as const,
  legalDocuments: () => '/legal-documents' as const,
  settings: () => '/settings' as const,
  login: () => '/login' as const,
} as const
