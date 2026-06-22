import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { SESSION_STATUS } from '~/modules/common/constants/session-status'
import { SessionError } from '~/modules/common/components/session-error'
import { SessionLoading } from '~/modules/common/components/session-loading'
import { useSession } from '~/modules/common/hooks/use-session'

export function RequireSession({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { status, isLoading, isAuthenticated, error, refresh } = useSession()
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (status === SESSION_STATUS.UNAUTHENTICATED) {
      void navigate({ to: DASHBOARD_ROUTES.login(), replace: true })
    }
  }, [navigate, status])

  const handleRetry = () => {
    setIsRetrying(true)
    void refresh().finally(() => setIsRetrying(false))
  }

  if (isLoading && status !== SESSION_STATUS.ERROR) {
    return <SessionLoading />
  }

  if (status === SESSION_STATUS.ERROR) {
    return <SessionError message={error} onRetry={handleRetry} isRetrying={isRetrying} />
  }

  if (!isAuthenticated) {
    return null
  }

  return children
}
