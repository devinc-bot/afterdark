import { useTranslation } from 'react-i18next'
import { Skeleton } from '@afterdark/ui'

export function StaffInvitationsTabSkeleton() {
  const { t } = useTranslation('staff')

  return (
    <section aria-busy="true" aria-label={t('invitationsTable.title')} className="py-4">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 overflow-hidden rounded-xl bg-surface-container-low p-6">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </section>
  )
}

export function StaffInvitationsEmptyState() {
  const { t } = useTranslation('staff')

  return (
    <div className="px-6 py-12 text-center">
      <p className="font-heading text-base font-semibold text-ink">
        {t('invitationsTable.emptyTitle')}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
        {t('invitationsTable.emptyDescription')}
      </p>
    </div>
  )
}
