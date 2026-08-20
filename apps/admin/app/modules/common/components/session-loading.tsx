import { Loader } from '@repo/ui'
import { useTranslation } from 'react-i18next'

export function SessionLoading() {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
      <Loader size={24} />
      <p className="text-sm text-ink-muted">{t('loading')}</p>
    </div>
  )
}
