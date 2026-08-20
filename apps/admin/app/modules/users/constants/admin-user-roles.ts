export const ADMIN_USER_ROLES = ['user', 'owner', 'staff', 'admin'] as const

export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number]
