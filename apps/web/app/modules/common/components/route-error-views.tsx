import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorBoundaryView, NotFoundView } from '@repo/ui'
import { WEB_ROUTES } from '~/modules/common/constants/routes'

export function WebErrorBoundaryView({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation('common')

  return (
    <ErrorBoundaryView
      error={error}
      reset={reset}
      brandLabel={t('appNameUpper')}
      homeTo={WEB_ROUTES.home()}
      showErrorDetails={import.meta.env.DEV}
      strings={{
        title: t('pageError.title'),
        description: t('pageError.description'),
        retry: t('pageError.retry'),
        goHome: t('pageError.goHome'),
        details: t('pageError.details'),
      }}
    />
  )
}

export function WebNotFoundView({ className }: { className?: string } = {}) {
  const { t } = useTranslation('common')

  useEffect(() => {
    document.title = `${t('pageNotFound.title')} · ${t('appName')}`
  }, [t])

  return (
    <NotFoundView
      brandLabel={t('appNameUpper')}
      title={t('pageNotFound.title')}
      description={t('pageNotFound.description')}
      actionLabel={t('pageNotFound.goHome')}
      actionTo={WEB_ROUTES.home()}
      className={className}
    />
  )
}
