import type esCommon from '../locales/common/es.json'
import type esAuth from '../locales/auth/es.json'
import type esValidation from '../locales/validation/es.json'
import type esErrors from '../locales/errors/es.json'
import type esEmails from '../locales/emails/es.json'

export type I18nResources = {
  common: typeof esCommon
  auth: typeof esAuth
  validation: typeof esValidation
  errors: typeof esErrors
  emails: typeof esEmails
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: I18nResources
  }
}
