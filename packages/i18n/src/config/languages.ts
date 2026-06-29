export const LANGUAGE = {
  ES: 'es',
  EN: 'en',
} as const

export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE]

export const DEFAULT_LANGUAGE: Language = LANGUAGE.ES
export const FALLBACK_LANGUAGE: Language = LANGUAGE.ES

export const SUPPORTED_LANGUAGES: Language[] = [LANGUAGE.ES, LANGUAGE.EN]

export const LANGUAGE_NAMES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
}
