import { z } from 'zod'
import { CLUB_STATUS } from '@afterdark/types'
import { uuidSchema } from './common.ts'
import { CLUB_IMAGE_MAX_COUNT } from './upload.ts'

function multipartUuidListSchema() {
  return z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return []
      }

      return Array.isArray(value) ? value : [value]
    })
    .pipe(z.array(uuidSchema))
}

function nonNegativeDigitsField(requiredMessage: string, invalidMessage: string) {
  return z.string().min(1, requiredMessage).regex(/^\d+$/, invalidMessage)
}

export const clubStatusSchema = z.enum([CLUB_STATUS.ACTIVE, CLUB_STATUS.INACTIVE])

export const createClubSchema = z.object({
  name: z.string().min(1, 'El nombre del club es requerido'),
  address: z.string().min(1, 'La dirección del club es requerida'),
  capacity: nonNegativeDigitsField(
    'La capacidad es requerida',
    'La capacidad solo puede contener números'
  ),
  description: z.string().min(1, 'La información adicional es requerida'),
  status: clubStatusSchema.default(CLUB_STATUS.ACTIVE),
  state: z.string().min(1, 'El estado es requerido'),
  street_number: nonNegativeDigitsField(
    'El número de calle es requerido',
    'El número de calle solo puede contener números'
  ),
  city: z.string().min(1, 'La ciudad es requerida'),
})
export type CreateClubInput = z.infer<typeof createClubSchema>

export const updateClubSchema = createClubSchema
export type UpdateClubInput = z.infer<typeof updateClubSchema>

export const updateClubMultipartSchema = createClubSchema.extend({
  keepImageIds: multipartUuidListSchema(),
})
export type UpdateClubMultipartInput = z.infer<typeof updateClubMultipartSchema>

export { CLUB_IMAGE_MAX_COUNT }
