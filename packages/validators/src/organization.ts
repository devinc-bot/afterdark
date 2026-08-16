import { z } from 'zod'

const optionalTaxIdSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d{11}$/.test(value), 'validation:field.taxId.invalid')

export const organizationSettingsFields = {
  organizationName: z.string().trim().max(255),
  taxId: optionalTaxIdSchema,
}

export function refineOrganizationSettings(
  data: { organizationName: string; taxId: string },
  ctx: z.RefinementCtx
) {
  if (data.taxId.length > 0 && data.organizationName.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'validation:field.organizationName.required',
      path: ['organizationName'],
    })
  }
}

export const organizationSettingsSchema = z
  .object(organizationSettingsFields)
  .superRefine(refineOrganizationSettings)

export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>
