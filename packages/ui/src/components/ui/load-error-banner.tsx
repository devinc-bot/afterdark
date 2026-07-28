import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

type LoadErrorBannerVariant = 'error' | 'warning'

export type LoadErrorBannerProps = {
  title?: string
  message: string | Error
  variant?: LoadErrorBannerVariant
  code?: string | number
  retryLabel?: string
  onRetry?: () => void
  isRetrying?: boolean
  onDismiss?: () => void
  dismissLabel?: string
  className?: string
}

const variantStyles: Record<
  LoadErrorBannerVariant,
  { container: string; icon: string; title: string }
> = {
  error: {
    container: 'border-error/40 bg-error-container/15',
    icon: 'text-error',
    title: 'text-error',
  },
  warning: {
    container: 'border-hairline-strong bg-surface-container',
    icon: 'text-ink-muted',
    title: 'text-ink',
  },
}

/** Presentational load-failure banner. Callers own i18n for title / retry / message. */
export function LoadErrorBanner({
  title,
  message,
  variant = 'error',
  code,
  retryLabel,
  onRetry,
  isRetrying = false,
  onDismiss,
  dismissLabel = 'Cerrar',
  className,
}: LoadErrorBannerProps) {
  const styles = variantStyles[variant]
  const description = message instanceof Error ? message.message : message
  const showRetry = Boolean(onRetry && retryLabel)

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'mx-auto my-20 flex w-lg items-start gap-3 rounded-lg border p-4',
        styles.container,
        className
      )}
    >
      <AlertTriangle
        className={cn('mt-0.5 size-[16px] shrink-0', styles.icon)}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1 space-y-2">
        {title ? (
          <div className="flex items-center gap-2">
            <p className={cn('text-sm leading-none font-semibold', styles.title)}>{title}</p>
            {code !== undefined ? (
              <span className="rounded border border-hairline bg-surface-container-lowest px-2 py-1 font-mono text-xs text-ink-muted-soft">
                {code}
              </span>
            ) : null}
          </div>
        ) : null}
        <p
          className={cn(
            'text-pretty text-sm',
            title ? 'leading-relaxed text-ink-muted' : 'leading-snug font-medium text-ink'
          )}
        >
          {description}
        </p>

        {showRetry ? (
          <div className="pt-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRetry}
              loading={isRetrying}
              iconLeft={!isRetrying ? <RefreshCw aria-hidden="true" /> : undefined}
            >
              {retryLabel}
            </Button>
          </div>
        ) : null}
      </div>

      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-mt-1 -mr-1 shrink-0 text-ink-muted hover:text-ink"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}
