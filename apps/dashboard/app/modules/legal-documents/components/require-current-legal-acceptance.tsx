import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { USER_ROLE } from '@repo/types'
import { AppErrorBoundaryView } from '../../common/components/error-boundary-view'
import { SessionLoading } from '../../common/components/session-loading'
import { QUERY_KEYS } from '../../common/constants/query-keys'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'
import { useSession } from '../../common/hooks/use-session'
import { getPendingLegalAcceptance } from '../services/legal-documents.service'

export function RequireCurrentLegalAcceptance({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { user } = useSession()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isAcceptancePage = pathname === DASHBOARD_ROUTES.legalAcceptance()
  const shouldGate = user?.role === USER_ROLE.OWNER
  const pending = useQuery({
    queryKey: QUERY_KEYS.pendingLegalAcceptance,
    queryFn: getPendingLegalAcceptance,
    enabled: shouldGate,
  })

  useEffect(() => {
    if (!shouldGate || !pending.isSuccess) {
      return
    }

    const isStale = pending.data.staleTypes.length > 0
    if (isStale && !isAcceptancePage) {
      void navigate({ to: DASHBOARD_ROUTES.legalAcceptance(), replace: true })
    }
    if (!isStale && isAcceptancePage) {
      void navigate({ to: DASHBOARD_ROUTES.home(), replace: true })
    }
  }, [isAcceptancePage, navigate, pending.data, pending.isSuccess, shouldGate])

  if (!shouldGate) {
    return children
  }

  if (pending.isPending) {
    return <SessionLoading />
  }

  if (pending.isError) {
    return (
      <AppErrorBoundaryView
        error={pending.error instanceof Error ? pending.error : new Error(String(pending.error))}
        reset={() => {
          void pending.refetch()
        }}
      />
    )
  }

  if (pending.data.staleTypes.length > 0 && !isAcceptancePage) {
    return <SessionLoading />
  }

  return children
}
