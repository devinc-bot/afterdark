import { useTranslation } from 'react-i18next'
import { Loader } from '@repo/ui'

export function SessionLoading() {
  const { t } = useTranslation('common', { useSuspense: false })

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
      <Loader size={24} />
      <p className="text-sm text-muted-foreground">{t('loading')}</p>
    </div>
  )
}
