import { Injectable } from '@nestjs/common'
import i18next from 'i18next'
import ICU from 'i18next-icu'
import { BASE_I18N_OPTIONS } from '../config/i18next.ts'
import { getServerResources } from '../loaders/server-loader.ts'
import { getCurrentRequestLanguage } from './language.context.ts'
import { LANGUAGE, type Language } from '../config/languages.ts'
import type { Namespace } from '../config/namespaces.ts'
import '../types/index.ts'

@Injectable()
export class TranslationService {
  private ready = false

  async onModuleInit(): Promise<void> {
    if (this.ready) return
    this.ready = true

    const esResources = getServerResources(LANGUAGE.ES)
    const enResources = getServerResources(LANGUAGE.EN)

    await i18next.use(ICU).init({
      ...BASE_I18N_OPTIONS,
      lng: LANGUAGE.ES,
      resources: {
        es: esResources,
        en: enResources,
      },
    })
  }

  translate(key: string, vars?: Record<string, unknown>, language?: Language): string {
    const lang = language ?? getCurrentRequestLanguage()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return i18next.t(key as any, { lng: lang, ...(vars ?? {}) }) as string
  }

  translateNs(
    namespace: Namespace,
    key: string,
    vars?: Record<string, unknown>,
    language?: Language
  ): string {
    return this.translate(`${namespace}:${key}`, vars, language)
  }

  translateError(code: string, vars?: Record<string, unknown>, language?: Language): string {
    return this.translateNs('errors', code, vars, language)
  }

  translateEmail(key: string, vars?: Record<string, unknown>, language?: Language): string {
    return this.translateNs('emails', key, vars, language)
  }
}
