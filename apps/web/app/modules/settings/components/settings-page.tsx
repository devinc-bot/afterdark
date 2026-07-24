import { useTranslation } from 'react-i18next'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button, Skeleton } from '@afterdark/ui'
import { LANDING_SHELL } from '~/modules/landing/constants/layout'
import { ProfileForm } from '~/modules/settings/components/profile-form'
import { useProfile } from '~/modules/settings/queries/use-profile'

const SETTINGS_HEADING =
  'font-display text-2xl font-semibold leading-8 tracking-[-0.02em] text-balance sm:text-[1.75rem] sm:leading-9'

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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-6 -top-8 h-40 bg-[radial-gradient(ellipse_at_top,oklch(0.72_0.08_320_/_0.07),transparent_70%)] sm:-inset-x-10"
        />

        <header className="relative mb-8 max-w-prose border-b border-outline-variant/35 pb-6 sm:mb-10 sm:pb-8">
          <h1 className={SETTINGS_HEADING}>{t('web.page.title')}</h1>
          <p className="mt-2 max-w-[42ch] text-pretty font-body text-base leading-relaxed text-on-surface-variant sm:mt-3">
            {t('web.page.description')}
          </p>
        </header>

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
