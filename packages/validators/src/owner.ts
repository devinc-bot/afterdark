import { z } from 'zod'

const optionalDigitsField = (invalidMessage: string, pattern: RegExp) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || pattern.test(value), invalidMessage)

export const updateCurrentOwnerSchema = z.object({
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
  taxId: optionalDigitsField('El CUIT/CUIL debe tener 11 dígitos, sin guiones.', /^\d{11}$/),
})

export type UpdateCurrentOwnerInput = z.infer<typeof updateCurrentOwnerSchema>
