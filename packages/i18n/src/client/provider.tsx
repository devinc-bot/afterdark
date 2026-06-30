import { type ReactNode, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18next from 'i18next'
import { initI18n } from './init.ts'
import type { Language } from '../config/languages.ts'

type I18nProviderProps = {
  children: ReactNode
  language?: Language
}

export function I18nProvider({ children, language }: I18nProviderProps) {
  useEffect(() => {
    if (!i18next.isInitialized) {
      // eslint-disable-next-line no-console
      initI18n(language).catch(console.error)
    }
  }, [language])

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
}
