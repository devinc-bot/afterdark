import { Loader } from '@repo/ui'
import { useTranslation } from 'react-i18next'

export function SessionLoading() {
  const { t, ready } = useTranslation('dashboard', { useSuspense: false })

  return (
    <div
      role="status"
      className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background"
    >
      <Loader size={24} />
      <p className="text-sm text-ink-muted">{ready ? t('shell.loading') : 'Cargando…'}</p>
    </div>
  )
}
