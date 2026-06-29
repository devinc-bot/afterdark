import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import ICU from 'i18next-icu'
import { BASE_I18N_OPTIONS, DEFAULT_LANGUAGE } from '../config/index.ts'
import { createViteI18nBackend } from '../loaders/client-loader.ts'
import { LANGUAGE, type Language } from '../config/languages.ts'
import '../types/index.ts'

let initialized = false

export async function initI18n(language?: Language): Promise<void> {
  if (initialized) return
  initialized = true

  const detectedLanguage = language ?? detectLanguage()

  await i18next
    .use(ICU)
    .use(createViteI18nBackend())
    .use(initReactI18next)
    .init({
      ...BASE_I18N_OPTIONS,
      lng: detectedLanguage,
    })
}

function detectLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  const stored = localStorage.getItem('afterdark:language')
  if (stored === LANGUAGE.ES || stored === LANGUAGE.EN) return stored as Language

  const browser = navigator.language.split('-')[0]
  if (browser === LANGUAGE.ES || browser === LANGUAGE.EN) return browser as Language

  return DEFAULT_LANGUAGE
}

export { i18next as i18n }
