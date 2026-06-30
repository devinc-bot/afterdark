import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@afterdark/ui'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

type ErrorBoundaryStrings = {
  title: string
  description: string
  retry: string
  goHome: string
  details: string
}

type ErrorBoundaryViewProps = {
  error: Error
  reset: () => void
  strings: ErrorBoundaryStrings
}

export function ErrorBoundaryView({ error, reset, strings }: ErrorBoundaryViewProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <p className="font-mono text-xs font-semibold tracking-widest text-ink-muted uppercase">
        AFTERDARK
      </p>

      <div className="mt-6 max-w-sm space-y-2">
        <p className="font-heading text-xl font-semibold text-ink">{strings.title}</p>
        <p className="text-sm text-ink-muted">{strings.description}</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="outline" onClick={reset}>
          {strings.retry}
        </Button>
        <Button type="button" asChild>
          <a href={DASHBOARD_ROUTES.home()}>{strings.goHome}</a>
        </Button>
      </div>

      {import.meta.env.DEV ? (
        <div className="mt-10 w-full max-w-xl text-left">
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? (
              <ChevronUp className="size-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden="true" />
            )}
            {strings.details}
          </button>
          {showDetails ? (
            <pre className="mt-3 overflow-x-auto rounded-lg border border-hairline-strong bg-surface-container p-4 text-xs text-error">
              {error.message}
              {error.stack ? `\n\n${error.stack}` : ''}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function AppErrorBoundaryView({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation('dashboard')

  return (
    <ErrorBoundaryView
      error={error}
      reset={reset}
      strings={{
        title: t('error.title'),
        description: t('error.description'),
        retry: t('error.retry'),
        goHome: t('error.goHome'),
        details: t('error.details'),
      }}
    />
  )
}
