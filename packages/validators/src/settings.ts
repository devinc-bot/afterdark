import { z } from 'zod'
import { updateCurrentUserSchema } from './user.ts'

export const SETTINGS_LANGUAGE = {
  ES: 'es',
  EN: 'en',
  DE: 'de',
} as const

export const settingsLanguageSchema = z.enum([
  SETTINGS_LANGUAGE.ES,
  SETTINGS_LANGUAGE.EN,
  SETTINGS_LANGUAGE.DE,
])

export const settingsNotificationsSchema = z.object({
  ticketSales: z.boolean(),
  inventory: z.boolean(),
  registration: z.boolean(),
  securityLog: z.boolean(),
})

export const settingsProfileSchema = updateCurrentUserSchema

export const settingsOrganizationSchema = z.object({
  brandName: z
    .string()
    .trim()
    .min(1, 'Ingresá el nombre comercial.')
    .max(100, 'El nombre comercial admite hasta 100 caracteres.'),
  location: z.string().trim().max(200, 'La ubicación admite hasta 200 caracteres.'),
})

export const settingsSecuritySchema = z.object({
  twoFactorEnabled: z.boolean(),
})

export const settingsPreferencesSchema = z.object({
  language: settingsLanguageSchema,
  notifications: settingsNotificationsSchema,
})

export const settingsFormSchema = z.object({
  profile: settingsProfileSchema,
  organization: settingsOrganizationSchema,
  security: settingsSecuritySchema,
  preferences: settingsPreferencesSchema,
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>
export type SettingsStoredValues = Pick<
  SettingsFormValues,
  'organization' | 'security' | 'preferences'
>

export const settingsStoredValuesSchema = z.object({
  organization: settingsOrganizationSchema,
  security: settingsSecuritySchema,
  preferences: settingsPreferencesSchema,
})
