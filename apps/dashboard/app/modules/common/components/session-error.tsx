import { Button } from '@afterdark/ui'
import { APP_SHELL_COPY } from '~/modules/common/constants/app-shell.copy'

type SessionErrorProps = {
  message: string | null
  onRetry: () => void
  isRetrying?: boolean
}

export function SessionError({ message, onRetry, isRetrying = false }: SessionErrorProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="max-w-sm space-y-2">
        <p className="text-sm font-medium text-ink">{APP_SHELL_COPY.session.errorTitle}</p>
        <p className="text-sm text-ink-muted">{message ?? APP_SHELL_COPY.session.errorFallback}</p>
      </div>
      <Button type="button" variant="outline" loading={isRetrying} onClick={onRetry}>
        {APP_SHELL_COPY.session.retry}
      </Button>
    </div>
  )
}
