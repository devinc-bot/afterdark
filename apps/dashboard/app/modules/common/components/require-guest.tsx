import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { SessionLoading } from '~/modules/common/components/session-loading'
import { useSession } from '~/modules/common/hooks/use-session'

// component to redirect to home if user is authenticated
export function RequireGuest({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { isLoading, isAuthenticated } = useSession()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      void navigate({ to: DASHBOARD_ROUTES.home(), replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return <SessionLoading />
  }

  if (isAuthenticated) {
    return null
  }

  return children
}
