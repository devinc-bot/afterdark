import i18next from 'i18next'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE } from '../config/index.ts'
import type { Language } from '../config/languages.ts'

const LANGUAGE_STORAGE_KEY = 'afterdark:language'
const LANGUAGE_COOKIE = 'afterdark_lang'

export function getCurrentLanguage(): Language {
  return (i18next.language as Language) ?? DEFAULT_LANGUAGE
}

export async function setLanguage(language: Language): Promise<void> {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    console.warn(`[i18n] Unsupported language: ${language}. Using fallback.`)
    return
  }

  await i18next.changeLanguage(language)
  persistLanguage(language)
}

function persistLanguage(language: Language): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)

  document.cookie = [
    `${LANGUAGE_COOKIE}=${language}`,
    'path=/',
    'max-age=31536000',
    'SameSite=Lax',
  ].join('; ')
}

export function readLanguageCookie(): Language | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LANGUAGE_COOKIE}=([^;]+)`))
  const value = match?.[1]

  if (value === LANGUAGE.ES || value === LANGUAGE.EN) return value as Language
  return null
}

export function readLanguageFromCookieString(cookieString: string): Language | null {
  const match = cookieString.match(new RegExp(`(?:^|;\\s*)${LANGUAGE_COOKIE}=([^;]+)`))
  const value = match?.[1]

  if (value === LANGUAGE.ES || value === LANGUAGE.EN) return value as Language
  return null
}
