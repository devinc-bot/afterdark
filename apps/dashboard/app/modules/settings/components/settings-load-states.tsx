import { useTranslation } from 'react-i18next'
import { Skeleton } from '@afterdark/ui'
import { LoadErrorBanner } from '~/modules/common/components/load-error-banner'
import { PageLayout } from '~/modules/common/components/page-layout'

function SettingsSectionSkeleton() {
  return (
    <div className="grid gap-x-12 gap-y-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-48 max-w-full" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    </div>
  )
}

export function SettingsFormSkeleton() {
  const { t } = useTranslation('settings')

  return (
    <PageLayout title={t('page.title')}>
      <div className="flex flex-col gap-12" aria-busy="true">
        <span className="sr-only">{t('messages.loading')}</span>
        <SettingsSectionSkeleton />
        <SettingsSectionSkeleton />
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
