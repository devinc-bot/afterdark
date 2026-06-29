import { AsyncLocalStorage } from 'node:async_hooks'
import { DEFAULT_LANGUAGE } from '../config/languages.ts'
import type { Language } from '../config/languages.ts'

const languageStorage = new AsyncLocalStorage<Language>()

export function runWithLanguage<T>(language: Language, fn: () => T): T {
  return languageStorage.run(language, fn)
}

export function getCurrentRequestLanguage(): Language {
  return languageStorage.getStore() ?? DEFAULT_LANGUAGE
}
