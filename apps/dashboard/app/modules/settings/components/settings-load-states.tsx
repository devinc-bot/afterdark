import { useTranslation } from 'react-i18next'
import { Loader } from '@afterdark/ui'
import { LoadErrorBanner } from '~/modules/common/components/load-error-banner'
import { PageLayout } from '~/modules/common/components/page-layout'

export function SettingsFormSkeleton() {
  const { t } = useTranslation('settings')

  return (
    <PageLayout title={t('page.title')} narrow>
      <div className="flex items-center justify-center py-16">
        <Loader size={24} />
        <span className="sr-only">{t('messages.loading')}</span>
      </div>
    </PageLayout>
  )
}

export function SettingsLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation('settings')

  return (
    <PageLayout title={t('page.title')} narrow>
      <LoadErrorBanner
        title={t('messages.loadErrorTitle')}
        message={message}
        retryLabel={t('actions.retryLoad')}
        onRetry={onRetry}
      />
    </PageLayout>
  )
}
