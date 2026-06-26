import { Button, Skeleton } from '@afterdark/ui'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'

export function StaffInvitationsTabSkeleton() {
  const copy = STAFF_COPY.invitationsTable

  return (
    <section aria-busy="true" aria-label={copy.title} className="py-4">
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

type StaffInvitationsLoadErrorBannerProps = {
  onRetry: () => void
  isRetrying: boolean
}

export function StaffInvitationsLoadErrorBanner({
  onRetry,
  isRetrying,
}: StaffInvitationsLoadErrorBannerProps) {
  const copy = STAFF_COPY.invitationsTable

  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4 sm:px-6"
    >
      <p className="text-sm text-ink">{copy.loadError}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {copy.retry}
      </Button>
    </div>
  )
}

export function StaffInvitationsEmptyState() {
  const copy = STAFF_COPY.invitationsTable

  return (
    <div className="px-6 py-12 text-center">
      <p className="font-heading text-base font-semibold text-ink">{copy.emptyTitle}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">{copy.emptyDescription}</p>
    </div>
  )
}
