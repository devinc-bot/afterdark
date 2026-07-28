import { useTranslation } from 'react-i18next'
import { ErrorBoundaryView } from '@repo/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

export function AppErrorBoundaryView({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation('common')

  return (
    <ErrorBoundaryView
      error={error}
      reset={reset}
      brandLabel={tCommon('appNameUpper')}
      homeTo={DASHBOARD_ROUTES.home()}
      showErrorDetails={import.meta.env.DEV}
      strings={{
        title: t('error.title'),
        description: t('error.description'),
        retry: t('error.retry'),
        goHome: t('error.goHome'),
        details: t('error.details'),
      }}
    />
  )
}
