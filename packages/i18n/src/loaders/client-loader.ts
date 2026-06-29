import type { BackendModule, ReadCallback } from 'i18next'

type LoadFn = (language: string, namespace: string) => Promise<Record<string, unknown>>

const localeImports: Record<
  string,
  Record<string, () => Promise<{ default: Record<string, unknown> }>>
> = {
  common: {
    es: () => import('../locales/common/es.json'),
    en: () => import('../locales/common/en.json'),
  },
  auth: {
    es: () => import('../locales/auth/es.json'),
    en: () => import('../locales/auth/en.json'),
  },
  validation: {
    es: () => import('../locales/validation/es.json'),
    en: () => import('../locales/validation/en.json'),
  },
  errors: {
    es: () => import('../locales/errors/es.json'),
    en: () => import('../locales/errors/en.json'),
  },
  emails: {
    es: () => import('../locales/emails/es.json'),
    en: () => import('../locales/emails/en.json'),
  },
}

export const defaultLoad: LoadFn = async (language, namespace) => {
  const nsLoaders = localeImports[namespace]
  if (!nsLoaders) return {}

  const loader = nsLoaders[language] ?? nsLoaders['es']
  if (!loader) return {}

  const mod = await loader()
  return mod.default
}

export function createViteI18nBackend(load: LoadFn = defaultLoad): BackendModule {
  return {
    type: 'backend',
    init() {},
    read(language: string, namespace: string, callback: ReadCallback) {
      load(language, namespace)
        .then((data) => callback(null, data))
        .catch((err: unknown) => callback(err as Error, null))
    },
    create() {},
  }
}
