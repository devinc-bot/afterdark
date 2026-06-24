import { Button, Loader } from '@afterdark/ui'
import { SETTINGS_COPY } from '~/modules/owner/constants/settings.copy'

export function SettingsFormSkeleton() {
  return (
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div className="h-8 w-48 animate-pulse rounded-md bg-surface-container-low motion-reduce:animate-none" />
          <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-surface-container-low motion-reduce:animate-none" />
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader size={24} />
          <span className="sr-only">{SETTINGS_COPY.messages.loading}</span>
        </div>
      </div>
    </main>
  )
}

export function SettingsLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div
        role="alert"
        className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-xl border border-hairline/60 p-6"
      >
        <h1 className="font-heading text-lg font-medium text-ink">
          {SETTINGS_COPY.messages.loadErrorTitle}
        </h1>
        <p className="text-sm text-ink-muted">{message}</p>
        <Button type="button" variant="outline" onClick={() => void onRetry()}>
          {SETTINGS_COPY.actions.retryLoad}
        </Button>
      </div>
    </main>
  )
}
