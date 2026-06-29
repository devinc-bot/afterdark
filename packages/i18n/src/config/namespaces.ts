export const NAMESPACE = {
  COMMON: 'common',
  AUTH: 'auth',
  VALIDATION: 'validation',
  ERRORS: 'errors',
  EMAILS: 'emails',
} as const

export type Namespace = (typeof NAMESPACE)[keyof typeof NAMESPACE]

export const DEFAULT_NAMESPACE: Namespace = NAMESPACE.COMMON

export const ALL_NAMESPACES: Namespace[] = [
  NAMESPACE.COMMON,
  NAMESPACE.AUTH,
  NAMESPACE.VALIDATION,
  NAMESPACE.ERRORS,
  NAMESPACE.EMAILS,
]
