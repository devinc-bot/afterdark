import { z } from 'zod'
import { USER_ROLE } from '@afterdark/types'

const optionalDigitsField = (invalidMessage: string, pattern: RegExp) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || pattern.test(value), invalidMessage)

export const userAddressSchema = z
  .object({
    address: z.string().trim().max(255, 'La dirección admite hasta 255 caracteres.'),
    streetNumber: z.string().trim().max(20, 'El número admite hasta 20 caracteres.'),
    state: z.string().trim().max(100, 'La provincia admite hasta 100 caracteres.'),
    city: z.string().trim().max(100, 'La ciudad admite hasta 100 caracteres.'),
  })
  .superRefine((data, ctx) => {
    const values = [data.address, data.streetNumber, data.state, data.city]
    const anyFilled = values.some((value) => value.length > 0)
    const allFilled = values.every((value) => value.length > 0)

    if (anyFilled && !allFilled) {
      ctx.addIssue({
        code: 'custom',
        message: 'Completá todos los campos de domicilio o dejalos vacíos.',
        path: ['address'],
      })
    }
  })

export const updateCurrentUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresá al menos 2 caracteres para el nombre.')
    .max(255, 'El nombre admite hasta 255 caracteres.'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Ingresá al menos 2 caracteres para el apellido.')
    .max(255, 'El apellido admite hasta 255 caracteres.'),
  phone: z
    .string()
    .trim()
    .min(8, 'Ingresá un teléfono válido.')
    .max(30, 'El teléfono admite hasta 30 caracteres.'),
  birthday: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value),
      'Usá el formato AAAA-MM-DD.'
    ),
  nationalId: optionalDigitsField(
    'El DNI solo puede contener números (7 a 11 dígitos).',
    /^\d{7,11}$/
  ),
  address: userAddressSchema,
})

export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum([USER_ROLE.USER, USER_ROLE.OWNER, USER_ROLE.STAFF]).default(USER_ROLE.STAFF),
})

export const createStaffUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresá al menos 2 caracteres para el nombre.')
    .max(255, 'El nombre admite hasta 255 caracteres.'),
  email: z.email('Ingresá un email válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  clubId: z.string().min(1, 'Seleccioná un club.'),
})

export const createStaffInvitationSchema = z.object({
  email: z.email('Ingresá un email válido.'),
  clubId: z.string().min(1, 'Seleccioná un club.'),
  securityWord: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || value.length >= 4,
      'La palabra de seguridad debe tener al menos 4 caracteres.'
    ),
})

export const verifyStaffInvitationSecurityWordSchema = z.object({
  securityWord: z.string().min(1, 'Ingresá la palabra de seguridad.'),
})

export const acceptStaffInvitationSchema = z
  .object({
    securityWord: z.string().trim(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string().min(8, 'Confirmá la contraseña.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

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
