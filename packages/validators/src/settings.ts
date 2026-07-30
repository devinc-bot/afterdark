import { z } from 'zod'
import { ownerSettingsProfileSchema, updateCurrentOwnerSchema } from './owner.ts'
import { updateCurrentStaffSchema } from './user.ts'

export const settingsProfileSchema = updateCurrentOwnerSchema

export const settingsFormSchema = z.object({
  profile: settingsProfileSchema,
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>

export const ownerSettingsFormSchema = z.object({
  profile: ownerSettingsProfileSchema,
})

export type OwnerSettingsFormValues = z.infer<typeof ownerSettingsFormSchema>

export const staffSettingsFormSchema = z.object({
  profile: updateCurrentStaffSchema,
})

export type StaffSettingsFormValues = z.infer<typeof staffSettingsFormSchema>
