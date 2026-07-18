import { USER_ROLE, type UserRole } from '@afterdark/types'
import { DASHBOARD_ROUTES } from './routes'

/** Rutas accesibles por staff (prefijos; incluye subrutas). */
export const STAFF_ALLOWED_PATH_PREFIXES = [
  DASHBOARD_ROUTES.home(),
  DASHBOARD_ROUTES.settings(),
] as const

/** Rutas accesibles por owner (prefijos; incluye subrutas). */
export const OWNER_ALLOWED_PATH_PREFIXES = [
  DASHBOARD_ROUTES.home(),
  DASHBOARD_ROUTES.locations(),
  DASHBOARD_ROUTES.tickets(),
  DASHBOARD_ROUTES.events(),
  DASHBOARD_ROUTES.sales(),
  DASHBOARD_ROUTES.staff(),
  DASHBOARD_ROUTES.settings(),
] as const

const ROLE_ALLOWED_PATH_PREFIXES: Partial<Record<UserRole, readonly string[]>> = {
  [USER_ROLE.STAFF]: STAFF_ALLOWED_PATH_PREFIXES,
  [USER_ROLE.OWNER]: OWNER_ALLOWED_PATH_PREFIXES,
}

const FALLBACK_ALLOWED_PATH_PREFIXES = [
  DASHBOARD_ROUTES.home(),
  DASHBOARD_ROUTES.settings(),
] as const

function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function matchesAnyPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => matchesPathPrefix(pathname, prefix))
}

export function isRouteAllowedForRole(role: UserRole, pathname: string): boolean {
  const allowedPrefixes = ROLE_ALLOWED_PATH_PREFIXES[role] ?? FALLBACK_ALLOWED_PATH_PREFIXES
  return matchesAnyPrefix(pathname, allowedPrefixes)
}
