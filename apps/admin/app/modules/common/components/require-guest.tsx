import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { clearAuthenticatedState } from '~/modules/auth/utils/sign-out.utils'
import { ADMIN_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import { isAdminSession } from '~/modules/common/utils/session.utils'
import { SessionLoading } from './session-loading'

export function RequireGuest({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isLoading, isAuthenticated } = useSession()
  const hasAdminSession = isAdminSession(user)

  useEffect(() => {
    if (!isLoading && isAuthenticated && hasAdminSession) {
      void navigate({ to: ADMIN_ROUTES.home(), replace: true })
      return
    }

    if (!isLoading && isAuthenticated) {
      clearAuthenticatedState(queryClient)
    }
  }, [hasAdminSession, isAuthenticated, isLoading, navigate, queryClient])

  if (isLoading) {
    return <SessionLoading />
  }

  if (isAuthenticated && hasAdminSession) {
    return null
  }

  return children
}
