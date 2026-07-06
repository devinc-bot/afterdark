import { z } from 'zod'

const optionalDigitsField = (invalidKey: string, pattern: RegExp) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || pattern.test(value), invalidKey)

export const baseProfileSchema = z.object({
  name: z.string().trim().min(2).max(255),
  lastName: z.string().trim().min(2).max(255),
  phone: z
    .string()
    .trim()
    .min(8, 'validation:field.phone.invalid')
    .max(30, 'validation:field.phone.tooLong'),
})

export const ownerAddressSchema = z
  .object({
    address: z.string().trim().max(255),
    streetNumber: z.string().trim().max(20),
    state: z.string().trim().max(100),
    city: z.string().trim().max(100),
  })
  .superRefine((data, ctx) => {
    const values = [data.address, data.streetNumber, data.state, data.city]
    const anyFilled = values.some((value) => value.length > 0)
    const allFilled = values.every((value) => value.length > 0)

    if (anyFilled && !allFilled) {
      ctx.addIssue({
        code: 'custom',
        message: 'validation:field.address.allOrNone',
        path: ['address'],
      })
    }
  })

export const updateCurrentOwnerSchema = baseProfileSchema.extend({
  birthday: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value),
      'validation:field.birthday.format'
    ),
  nationalId: optionalDigitsField('validation:field.nationalId.invalid', /^\d{7,11}$/),
  taxId: optionalDigitsField('validation:field.taxId.invalid', /^\d{11}$/),
  address: ownerAddressSchema,
})

export type OwnerAddressInput = z.infer<typeof ownerAddressSchema>
export type UpdateCurrentOwnerInput = z.infer<typeof updateCurrentOwnerSchema>
