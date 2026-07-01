import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { Button, cn } from '@afterdark/ui'

type LoadErrorBannerVariant = 'error' | 'warning'

type LoadErrorBannerProps = {
  title?: string
  message: string | Error
  variant?: LoadErrorBannerVariant
  code?: string | number
  retryLabel?: string
  onRetry?: () => void
  isRetrying?: boolean
  onDismiss?: () => void
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

export function LoadErrorBanner({
  title,
  message,
  variant = 'error',
  code,
  retryLabel,
  onRetry,
  isRetrying = false,
  onDismiss,
  className,
}: LoadErrorBannerProps) {
  const styles = variantStyles[variant]
  const description = message instanceof Error ? message.message : message

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'my-6 flex w-full items-start gap-3 rounded-lg border p-4',
        styles.container,
        className
      )}
    >
      <AlertTriangle
        className={cn('mt-0.5 size-[16px] shrink-0', styles.icon)}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1 space-y-2">
        {title !== null && (
          <div className="flex items-center gap-2">
            <p className={cn('text-sm font-semibold leading-none', styles.title)}>{title}</p>
            {code !== null && (
              <span className="rounded border border-hairline bg-surface-container-lowest px-2 py-1 font-mono text-xs text-ink-muted-soft">
                {code}
              </span>
            )}
          </div>
        )}
        <p
          className={cn(
            'text-pretty text-sm',
            title !== null ? 'leading-relaxed text-ink-muted' : 'font-medium leading-snug text-ink'
          )}
        >
          {description}
        </p>

        {onRetry !== null && retryLabel !== null && (
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
        )}
      </div>

      {onDismiss !== null && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-mr-1 -mt-1 shrink-0 text-ink-muted hover:text-ink"
          onClick={onDismiss}
          aria-label="Cerrar"
        >
          <X aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}
