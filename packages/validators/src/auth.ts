import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Ingresá un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

const registerProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(255),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(255),
  email: z.email('Ingresá un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export const registerUserSchema = registerProfileSchema
export const registerOwnerSchema = registerProfileSchema

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type RegisterOwnerInput = z.infer<typeof registerOwnerSchema>
