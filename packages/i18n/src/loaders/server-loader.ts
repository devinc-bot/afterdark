import type { I18nResources } from '../types/index.ts'

import esCommon from '../locales/common/es.json' with { type: 'json' }
import enCommon from '../locales/common/en.json' with { type: 'json' }
import esAuth from '../locales/auth/es.json' with { type: 'json' }
import enAuth from '../locales/auth/en.json' with { type: 'json' }
import esValidation from '../locales/validation/es.json' with { type: 'json' }
import enValidation from '../locales/validation/en.json' with { type: 'json' }
import esErrors from '../locales/errors/es.json' with { type: 'json' }
import enErrors from '../locales/errors/en.json' with { type: 'json' }
import esEmails from '../locales/emails/es.json' with { type: 'json' }
import enEmails from '../locales/emails/en.json' with { type: 'json' }
import esDashboard from '../locales/dashboard/es.json' with { type: 'json' }
import enDashboard from '../locales/dashboard/en.json' with { type: 'json' }
import esStaff from '../locales/staff/es.json' with { type: 'json' }
import enStaff from '../locales/staff/en.json' with { type: 'json' }
import esClubs from '../locales/clubs/es.json' with { type: 'json' }
import enClubs from '../locales/clubs/en.json' with { type: 'json' }
import esSettings from '../locales/settings/es.json' with { type: 'json' }
import enSettings from '../locales/settings/en.json' with { type: 'json' }
import esTickets from '../locales/tickets/es.json' with { type: 'json' }
import enTickets from '../locales/tickets/en.json' with { type: 'json' }

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
    dashboard: esDashboard,
    staff: esStaff,
    clubs: esClubs,
    settings: esSettings,
    tickets: esTickets,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    validation: enValidation,
    errors: enErrors,
    emails: enEmails,
    dashboard: enDashboard,
    staff: enStaff,
    clubs: enClubs,
    settings: enSettings,
    tickets: enTickets,
  },
}

export function getServerResources(language: string): I18nResources {
  return SERVER_RESOURCES[language as keyof ServerResources] ?? SERVER_RESOURCES.es
}
