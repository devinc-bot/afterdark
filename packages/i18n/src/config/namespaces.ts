export const NAMESPACE = {
  COMMON: 'common',
  AUTH: 'auth',
  VALIDATION: 'validation',
  ERRORS: 'errors',
  EMAILS: 'emails',
  DASHBOARD: 'dashboard',
  STAFF: 'staff',
  CLUBS: 'clubs',
  SETTINGS: 'settings',
  TICKETS: 'tickets',
  EVENTS: 'events',
  LANDING: 'landing',
} as const

export type Namespace = (typeof NAMESPACE)[keyof typeof NAMESPACE]

export const DEFAULT_NAMESPACE: Namespace = NAMESPACE.COMMON

export const ALL_NAMESPACES: Namespace[] = [
  NAMESPACE.COMMON,
  NAMESPACE.AUTH,
  NAMESPACE.VALIDATION,
  NAMESPACE.ERRORS,
  NAMESPACE.EMAILS,
  NAMESPACE.DASHBOARD,
  NAMESPACE.STAFF,
  NAMESPACE.CLUBS,
  NAMESPACE.SETTINGS,
  NAMESPACE.TICKETS,
  NAMESPACE.EVENTS,
  NAMESPACE.LANDING,
]
