import { z } from 'zod'

const optionalDigitsField = (invalidKey: string, pattern: RegExp) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || pattern.test(value), invalidKey)

export const updateCurrentOwnerSchema = z.object({
  name: z.string().trim().min(2).max(255),
  lastName: z.string().trim().min(2).max(255),
  phone: z
    .string()
    .trim()
    .min(8, 'validation:field.phone.invalid')
    .max(30, 'validation:field.phone.tooLong'),
  birthday: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value),
      'validation:field.birthday.format'
    ),
  nationalId: optionalDigitsField('validation:field.nationalId.invalid', /^\d{7,11}$/),
  taxId: optionalDigitsField('validation:field.taxId.invalid', /^\d{11}$/),
})

export type UpdateCurrentOwnerInput = z.infer<typeof updateCurrentOwnerSchema>
