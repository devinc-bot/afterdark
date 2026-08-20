import { Button } from '@repo/ui'
import { useTranslation } from 'react-i18next'

type SessionErrorProps = {
  message: string | null
  onRetry: () => void
  isRetrying?: boolean
}

export function SessionError({ message, onRetry, isRetrying = false }: SessionErrorProps) {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="max-w-sm space-y-2">
        <p className="text-sm font-medium text-ink">{t('pageError.title')}</p>
        <p className="text-sm text-ink-muted">{message ?? t('pageError.description')}</p>
      </div>
      <Button type="button" variant="outline" loading={isRetrying} onClick={onRetry}>
        {t('retry')}
      </Button>
    </div>
  )
}
