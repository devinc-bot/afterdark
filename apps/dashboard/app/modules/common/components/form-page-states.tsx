import type { ReactNode } from 'react'
import { Button, LoadErrorBanner, Skeleton } from '@repo/ui'
import { FormPageLayout } from '~/modules/common/components/form-page-layout'

type FormPageChromeProps = {
  title: string
  description: string
  backLabel: string
  onBack: () => void
}

type FormPageLoadingStateProps = FormPageChromeProps & {
  loadingLabel: string
  children?: ReactNode
}

type FormPageErrorStateProps = FormPageChromeProps & {
  errorTitle: string
  message: string
  retryLabel: string
  onRetry: () => void
  isRetrying?: boolean
}

type FormPageNotFoundStateProps = FormPageChromeProps & {
  actionLabel: string
}

/** Default skeleton matching the two-column section form used by events/locations. */
export function FormPageSectionSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-hidden="true">
      {[0, 1].map((row) => (
        <div
          key={row}
          className="grid gap-x-12 gap-y-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52 max-w-full" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Compact field-grid skeleton for denser single-column forms. */
export function FormPageFieldsSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

export function FormPageLoadingState({
  title,
  description,
  backLabel,
  onBack,
  loadingLabel,
  children,
}: FormPageLoadingStateProps) {
  return (
    <FormPageLayout title={title} description={description} backLabel={backLabel} onBack={onBack}>
      <div aria-busy="true">
        <span className="sr-only">{loadingLabel}</span>
        {children ?? <FormPageSectionSkeleton />}
      </div>
    </FormPageLayout>
  )
}

export function FormPageErrorState({
  title,
  description,
  backLabel,
  onBack,
  errorTitle,
  message,
  retryLabel,
  onRetry,
  isRetrying = false,
}: FormPageErrorStateProps) {
  return (
    <FormPageLayout title={title} description={description} backLabel={backLabel} onBack={onBack}>
      <LoadErrorBanner
        title={errorTitle}
        message={message}
        retryLabel={retryLabel}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    </FormPageLayout>
  )
}

export function FormPageNotFoundState({
  title,
  description,
  backLabel,
  onBack,
  actionLabel,
}: FormPageNotFoundStateProps) {
  return (
    <FormPageLayout title={title} description={description} backLabel={backLabel} onBack={onBack}>
      <div className="rounded-xl border border-dashed border-hairline bg-surface-container-low/60 px-6 py-10 text-center sm:px-8">
        <Button type="button" variant="outline" onClick={onBack}>
          {actionLabel}
        </Button>
      </div>
    </FormPageLayout>
  )
}
