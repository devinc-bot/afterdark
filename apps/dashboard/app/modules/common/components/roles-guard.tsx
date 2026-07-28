import { useTranslation } from 'react-i18next'
import { NotFoundView } from '@repo/ui'
import { useRouterState } from '@tanstack/react-router'
import { isRouteAllowedForRole } from '~/modules/common/constants/role-routes'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'

function RouteNotFoundView() {
  const { t } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation('common')

  return (
    <NotFoundView
      brandLabel={tCommon('appNameUpper')}
      title={t('notFound.title')}
      description={t('notFound.description')}
      actionLabel={t('notFound.goHome')}
      actionTo={DASHBOARD_ROUTES.home()}
      className="min-h-full py-16"
    />
  )
}

export function RolesGuard({ children }: { children: React.ReactNode }) {
  const { user } = useSession()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  if (!user || !isRouteAllowedForRole(user.role, pathname)) {
    return <RouteNotFoundView />
  }

  return children
}
