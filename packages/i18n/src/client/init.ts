import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import ICU from 'i18next-icu'
import { BASE_I18N_OPTIONS, DEFAULT_LANGUAGE } from '../config/index.ts'
import { SERVER_RESOURCES } from '../loaders/server-loader.ts'
import { LANGUAGE, type Language } from '../config/languages.ts'
import '../types/index.ts'

let initPromise: Promise<void> | null = null

export function initI18n(language?: Language): Promise<void> {
  if (initPromise) return initPromise

  const detectedLanguage = language ?? detectLanguage()

  initPromise = i18next
    .use(ICU)
    .use(initReactI18next)
    .init({
      ...BASE_I18N_OPTIONS,
      lng: detectedLanguage,
      resources: {
        es: SERVER_RESOURCES.es,
        en: SERVER_RESOURCES.en,
      },
    })
    .then(() => undefined)

  return initPromise
}

function detectLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  // Explicit user choice only. Product is Spanish-first; do not follow
  // browser locale (would flip the public web to English without a switcher).
  const stored = localStorage.getItem('afterdark:language')
  if (stored === LANGUAGE.ES || stored === LANGUAGE.EN) return stored as Language

  return DEFAULT_LANGUAGE
}

export { i18next as i18n }
