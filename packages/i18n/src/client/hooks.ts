import { useCallback } from 'react'
import { resolveFieldError } from '../utils/translate-validation-message.ts'
import { useTranslation as useI18nextTranslation } from 'react-i18next'
import type { Namespace } from '../config/namespaces.ts'
import type { Language } from '../config/languages.ts'
import { getCurrentLanguage, setLanguage } from './language.ts'

export function useTranslation(namespace: Namespace) {
  return useI18nextTranslation(namespace)
}

export function useLanguage() {
  const { i18n } = useI18nextTranslation()

  return {
    language: i18n.language as Language,
    setLanguage: (lang: Language) => setLanguage(lang),
    getCurrentLanguage,
    isRTL: false,
  }
}

export function useCommonTranslation() {
  return useTranslation('common')
}

export function useAuthTranslation() {
  return useTranslation('auth')
}

export function useValidationTranslation() {
  return useTranslation('validation')
}

export function useResolveFieldError() {
  const { t } = useI18nextTranslation('validation')

  return useCallback((errors: ReadonlyArray<unknown>) => resolveFieldError(errors, t), [t])
}

export function useErrorsTranslation() {
  return useTranslation('errors')
}
