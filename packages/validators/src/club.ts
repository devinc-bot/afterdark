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

function nonNegativeDigitsField(requiredKey: string, invalidKey: string) {
  return z.string().min(1, requiredKey).regex(/^\d+$/, invalidKey)
}

export const clubStatusSchema = z.enum([CLUB_STATUS.ACTIVE, CLUB_STATUS.INACTIVE])

export const createClubSchema = z.object({
  name: z.string().min(1, 'validation:field.club.name'),
  address: z.string().min(1, 'validation:field.club.address'),
  capacity: nonNegativeDigitsField(
    'validation:field.club.capacity.required',
    'validation:field.club.capacity.invalid'
  ),
  description: z.string().min(1, 'validation:field.club.description'),
  status: clubStatusSchema.default(CLUB_STATUS.ACTIVE),
  state: z.string().min(1, 'validation:field.club.state'),
  street_number: nonNegativeDigitsField(
    'validation:field.club.streetNumber.required',
    'validation:field.club.streetNumber.invalid'
  ),
  city: z.string().min(1, 'validation:field.club.city'),
})
export type CreateClubInput = z.infer<typeof createClubSchema>

export const updateClubSchema = createClubSchema
export type UpdateClubInput = z.infer<typeof updateClubSchema>

export const updateClubMultipartSchema = createClubSchema.extend({
  keepImageIds: multipartUuidListSchema(),
})
export type UpdateClubMultipartInput = z.infer<typeof updateClubMultipartSchema>

export { CLUB_IMAGE_MAX_COUNT }
