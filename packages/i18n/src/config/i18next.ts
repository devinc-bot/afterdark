import type { InitOptions } from 'i18next'
import { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE, LANGUAGE } from './languages.ts'
import { ALL_NAMESPACES, DEFAULT_NAMESPACE } from './namespaces.ts'

export const BASE_I18N_OPTIONS: InitOptions = {
  fallbackLng: FALLBACK_LANGUAGE,
  defaultNS: DEFAULT_NAMESPACE,
  ns: ALL_NAMESPACES,
  supportedLngs: [LANGUAGE.ES, LANGUAGE.EN],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: true,
  },
  missingKeyHandler: (lngs, ns, key) => {
    /* TODO: Use MODE.DEVELOPMENT from @afterdark/validators and serverEnv from @afterdark/db */
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] Missing key: ${ns}:${key} (${lngs.join(', ')})`)
    }
  },
  parseMissingKeyHandler: (key) => {
    return key
  },
}

export { DEFAULT_LANGUAGE }
