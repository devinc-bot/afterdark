import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { I18nResources } from '@afterdark/i18n'

export function usePageTitle(ns: keyof I18nResources, key: string) {
  const { t } = useTranslation(ns, { useSuspense: false })

  useEffect(() => {
    document.title = t(key as never)
  }, [t, key])
}
