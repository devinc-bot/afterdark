import type { I18nResources } from '../types/index.ts'

import esCommon from '../locales/common/es.json'
import enCommon from '../locales/common/en.json'
import esAuth from '../locales/auth/es.json'
import enAuth from '../locales/auth/en.json'
import esValidation from '../locales/validation/es.json'
import enValidation from '../locales/validation/en.json'
import esErrors from '../locales/errors/es.json'
import enErrors from '../locales/errors/en.json'
import esEmails from '../locales/emails/es.json'
import enEmails from '../locales/emails/en.json'

export type ServerResources = {
  es: I18nResources
  en: I18nResources
}

export const SERVER_RESOURCES: ServerResources = {
  es: {
    common: esCommon,
    auth: esAuth,
    validation: esValidation,
    errors: esErrors,
    emails: esEmails,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    validation: enValidation,
    errors: enErrors,
    emails: enEmails,
  },
}

export function getServerResources(language: string): I18nResources {
  return SERVER_RESOURCES[language as keyof ServerResources] ?? SERVER_RESOURCES.es
}
