import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

export function LandingHeader() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <header className="sticky top-0 z-40 border-b border-hairline/60 bg-background/80 backdrop-blur-md">
      <nav
        aria-label={t('header.navAria')}
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-margin-mobile md:px-margin-desktop"
      >
        <Link to={DASHBOARD_ROUTES.home()} className="flex items-center">
          <span className="font-display text-lg font-bold tracking-tight text-on-surface">
            {t('header.brand', { appName: 'afterdark' })}
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to={DASHBOARD_ROUTES.login()}>{t('header.login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to={DASHBOARD_ROUTES.register()}>{t('header.register')}</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
