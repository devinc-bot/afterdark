import { useTranslation } from 'react-i18next'
import { Card, Skeleton } from '@afterdark/ui'
import { LoadErrorBanner } from '~/modules/common/components/load-error-banner'

export function StaffPersonnelTabSkeleton() {
  const { t } = useTranslation('staff')

  return (
    <section aria-busy="true" aria-label={t('table.title')} className="py-4">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />
      <Skeleton className="mt-6 h-10 w-full max-w-sm" />
      <Card variant="gradient" className="mt-6 p-6">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      </Card>
    </section>
  )
}

type StaffPersonnelLoadErrorBannerProps = {
  onRetry: () => void
  isRetrying: boolean
}

export function StaffPersonnelLoadErrorBanner({
  onRetry,
  isRetrying,
}: StaffPersonnelLoadErrorBannerProps) {
  const { t } = useTranslation('staff')

  return (
    <LoadErrorBanner
      message={t('table.loadError')}
      retryLabel={t('table.retry')}
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  )
}

type StaffPersonnelEmptyStateProps = {
  className?: string
}

export function StaffPersonnelEmptyState({ className }: StaffPersonnelEmptyStateProps) {
  const { t } = useTranslation('staff')

  return (
    <div className={className ?? 'px-6 py-12 text-center'}>
      <p className="font-heading text-base font-semibold text-ink">{t('table.emptyTitle')}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">{t('table.emptyDescription')}</p>
    </div>
  )
}
