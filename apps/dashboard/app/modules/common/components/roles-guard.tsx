import { useTranslation } from 'react-i18next'
import { Link } from '@repo/ui'
import { useRouterState } from '@tanstack/react-router'
import { isRouteAllowedForRole } from '~/modules/common/constants/role-routes'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'

function RouteNotFoundView() {
  const { t } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation('common')

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <p className="font-mono text-xs font-semibold tracking-widest text-ink-muted uppercase">
        {tCommon('appNameUpper')}
      </p>
      <div className="mt-6 max-w-sm space-y-2">
        <p className="font-heading text-xl font-semibold text-ink">{t('notFound.title')}</p>
        <p className="text-sm text-ink-muted">{t('notFound.description')}</p>
      </div>
      <div className="mt-8">
        <Link
          to={DASHBOARD_ROUTES.home()}
          className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-5 text-[15px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          {t('notFound.goHome')}
        </Link>
      </div>
    </main>
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
