import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from './button'
import { Link, type LinkProps } from './link'

export type ErrorBoundaryStrings = {
  title: string
  description: string
  retry: string
  goHome: string
  details: string
}

export type ErrorBoundaryViewProps = {
  error: Error
  reset: () => void
  strings: ErrorBoundaryStrings
  /** Router path for the primary escape action. */
  homeTo: LinkProps['to']
  brandLabel: string
  /** When true, shows expandable stack trace (typically DEV only). */
  showErrorDetails?: boolean
  className?: string
}

export function ErrorBoundaryView({
  error,
  reset,
  strings,
  homeTo,
  brandLabel,
  showErrorDetails = false,
  className,
}: ErrorBoundaryViewProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div
      className={
        className ??
        'flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center'
      }
    >
      <p className="font-mono text-xs font-semibold tracking-widest text-ink-muted uppercase">
        {brandLabel}
      </p>

      <div className="mt-6 max-w-sm space-y-2">
        <p className="font-heading text-xl font-semibold text-ink">{strings.title}</p>
        <p className="text-sm text-ink-muted">{strings.description}</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="outline" onClick={reset}>
          {strings.retry}
        </Button>
        <Link to={homeTo} variant="button">
          {strings.goHome}
        </Link>
      </div>

      {showErrorDetails ? (
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
