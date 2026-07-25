import { useTranslation } from 'react-i18next'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button, Skeleton } from '@repo/ui'
import { PageAtmosphereWash } from '~/modules/common/components/page-atmosphere-wash'
import { PageHeader } from '~/modules/common/components/page-header'
import { LANDING_SHELL } from '~/modules/landing/constants/layout'
import { ProfileForm } from '~/modules/settings/components/profile-form'
import { useProfile } from '~/modules/settings/queries/use-profile'

function SettingsFormSkeleton() {
  const { t } = useTranslation('settings')

  return (
    <div className="space-y-8" aria-busy="true">
      <span className="sr-only">{t('web.loading')}</span>
      <div className="flex items-center gap-4 border-b border-outline-variant/35 pb-8 sm:gap-5">
        <Skeleton className="size-16 shrink-0 rounded-full sm:size-20" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-44 max-w-full" />
          <Skeleton className="h-3.5 w-52 max-w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-56 max-w-full" />
          <Skeleton className="h-3 w-3/4 max-w-sm" />
        </div>
        <div className="flex flex-col gap-2 border-t border-outline-variant/35 pt-5 sm:flex-row sm:justify-end sm:gap-3">
          <Skeleton className="h-11 w-full sm:w-36" />
          <Skeleton className="h-11 w-full sm:w-40" />
        </div>
      </div>
    </div>
  )
}

function SettingsLoadError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string
  onRetry: () => void
  isRetrying: boolean
}) {
  const { t } = useTranslation('settings')

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex w-full items-start gap-3 border border-error/40 bg-error-container/15 px-4 py-4"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-semibold leading-none text-error">
          {t('web.messages.loadErrorTitle')}
        </p>
        <p className="text-pretty text-sm leading-relaxed text-on-surface-variant">{message}</p>
        <div className="pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRetry}
            loading={isRetrying}
            iconLeft={!isRetrying ? <RefreshCw aria-hidden="true" /> : undefined}
          >
            {t('web.actions.retry')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const profileQuery = useProfile()

  return (
    <div className={LANDING_SHELL}>
      <div className="relative mx-auto w-full max-w-xl">
        <PageAtmosphereWash className="h-40" />

        <PageHeader title={t('web.page.title')} description={t('web.page.description')} />

        <div className="relative">
          {profileQuery.isLoading ? <SettingsFormSkeleton /> : null}

          {profileQuery.isError ? (
            <SettingsLoadError
              message={profileQuery.error.message || t('web.messages.loadError')}
              onRetry={() => void profileQuery.refetch()}
              isRetrying={profileQuery.isFetching}
            />
          ) : null}

          {profileQuery.data ? (
            <ProfileForm key={profileQuery.data.sub} profile={profileQuery.data} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
