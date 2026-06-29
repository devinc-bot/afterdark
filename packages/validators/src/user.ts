import { z } from 'zod'
import { USER_ROLE } from '@afterdark/types'

const optionalDigitsField = (invalidKey: string, pattern: RegExp) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || pattern.test(value), invalidKey)

export const userAddressSchema = z
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

export const updateCurrentUserSchema = z.object({
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
  address: userAddressSchema,
})

export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum([USER_ROLE.USER, USER_ROLE.OWNER, USER_ROLE.STAFF]).default(USER_ROLE.STAFF),
})

export const createStaffUserSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.email('validation:field.invitation.email'),
  password: z.string().min(8),
  clubId: z.string().min(1, 'validation:field.invitation.club'),
})

export const createStaffInvitationSchema = z.object({
  email: z.email('validation:field.invitation.email'),
  clubId: z.string().min(1, 'validation:field.invitation.club'),
  securityWord: z
    .string()
    .trim()
    .refine((value) => value === '' || value.length >= 4, 'validation:field.securityWord.min'),
})

export const verifyStaffInvitationSecurityWordSchema = z.object({
  securityWord: z.string().min(1, 'validation:field.securityWord.required'),
})

export const acceptStaffInvitationBaseSchema = z.object({
  name: z.string().trim().min(2).max(255),
  lastName: z.string().trim().min(2).max(255),
  phone: z
    .string()
    .trim()
    .min(8, 'validation:field.phone.invalid')
    .max(30, 'validation:field.phone.tooLong'),
  securityWord: z.string().trim(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
})

export const acceptStaffInvitationSchema = acceptStaffInvitationBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  { message: 'validation:field.password.noMatch', path: ['confirmPassword'] }
)

export const updateUserSchema = createUserSchema.partial().omit({ password: true })

export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreateStaffUserInput = z.infer<typeof createStaffUserSchema>
export type CreateStaffInvitationInput = z.infer<typeof createStaffInvitationSchema>
export type VerifyStaffInvitationSecurityWordInput = z.infer<
  typeof verifyStaffInvitationSecurityWordSchema
>
export type AcceptStaffInvitationInput = z.infer<typeof acceptStaffInvitationSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdateCurrentUserInput = z.infer<typeof updateCurrentUserSchema>
export type UserAddressInput = z.infer<typeof userAddressSchema>
