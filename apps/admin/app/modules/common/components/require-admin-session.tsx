import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { SESSION_STATUS } from '@repo/common'
import { clearAuthenticatedState } from '~/modules/auth/utils/sign-out.utils'
import { ADMIN_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import { isAdminSession } from '~/modules/common/utils/session.utils'
import { SessionError } from './session-error'
import { SessionLoading } from './session-loading'

export function RequireAdminSession({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, status, isLoading, isAuthenticated, error, refresh } = useSession()
  const [isRetrying, setIsRetrying] = useState(false)
  const hasAdminSession = isAdminSession(user)

  useEffect(() => {
    if (status === SESSION_STATUS.UNAUTHENTICATED) {
      void navigate({ to: ADMIN_ROUTES.login() as never, replace: true })
      return
    }

    if (isAuthenticated && !hasAdminSession) {
      clearAuthenticatedState(queryClient)
      void navigate({ to: ADMIN_ROUTES.login() as never, replace: true })
    }
  }, [hasAdminSession, isAuthenticated, navigate, queryClient, status])

  const handleRetry = () => {
    setIsRetrying(true)
    void refresh().finally(() => setIsRetrying(false))
  }

  if (isLoading) {
    return <SessionLoading />
  }

  if (status === SESSION_STATUS.ERROR) {
    return <SessionError message={error} onRetry={handleRetry} isRetrying={isRetrying} />
  }

  if (!isAuthenticated || !hasAdminSession) {
    return null
  }

  return children
}
