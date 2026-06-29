import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../config/languages.ts'
import type { Language } from '../config/languages.ts'

export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE

  const candidates = [
    localStorage.getItem('afterdark:language'),
    navigator.language.split('-')[0],
    ...navigator.languages.map((l) => l.split('-')[0]),
  ]

  for (const candidate of candidates) {
    if (candidate && isSupported(candidate)) {
      return candidate as Language
    }
  }

  return DEFAULT_LANGUAGE
}

export function detectLanguageFromHeaders(headers: Record<string, string | undefined>): Language {
  const acceptLanguage = headers['accept-language']
  if (!acceptLanguage) return DEFAULT_LANGUAGE

  const parts = acceptLanguage.split(',').map((p) => p.trim().split(';')[0]?.split('-')[0]?.trim())

  for (const lang of parts) {
    if (lang && isSupported(lang)) return lang as Language
  }

  return DEFAULT_LANGUAGE
}

function isSupported(lang: string): lang is Language {
  return SUPPORTED_LANGUAGES.includes(lang as Language)
}
