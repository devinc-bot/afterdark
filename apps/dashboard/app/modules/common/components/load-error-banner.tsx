import { AlertCircle, X } from 'lucide-react'
import { Button } from '@afterdark/ui'

type LoadErrorBannerProps = {
  message: string
  retryLabel: string
  onRetry: () => void
  isRetrying: boolean
  onDismiss?: () => void
}

export function LoadErrorBanner({
  message,
  retryLabel,
  onRetry,
  isRetrying,
  onDismiss,
}: LoadErrorBannerProps) {
  return (
    <div
      role="alert"
      className="my-6 flex items-start gap-3 rounded-lg border border-error/40 bg-error-container/15 px-4 py-4"
    >
      <AlertCircle className="mt-0.5 size-[16px] shrink-0 text-error" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{message}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onRetry}
          loading={isRetrying}
        >
          {retryLabel}
        </Button>
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
