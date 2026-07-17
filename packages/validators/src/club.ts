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

function coordinateField(requiredKey: string, invalidKey: string, min: number, max: number) {
  return z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined
      }

      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined
      }

      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) {
          return undefined
        }

        const parsed = Number(trimmed)
        return Number.isFinite(parsed) ? parsed : undefined
      }

      return undefined
    },
    z.number({ error: requiredKey }).min(min, invalidKey).max(max, invalidKey)
  )
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
  latitude: coordinateField(
    'validation:field.club.latitude.required',
    'validation:field.club.latitude.invalid',
    -90,
    90
  ),
  longitude: coordinateField(
    'validation:field.club.longitude.required',
    'validation:field.club.longitude.invalid',
    -180,
    180
  ),
})
export type CreateClubInput = z.infer<typeof createClubSchema>

export const updateClubSchema = createClubSchema
export type UpdateClubInput = z.infer<typeof updateClubSchema>

export const updateClubMultipartSchema = createClubSchema.extend({
  keepImageIds: multipartUuidListSchema(),
})
export type UpdateClubMultipartInput = z.infer<typeof updateClubMultipartSchema>

export { CLUB_IMAGE_MAX_COUNT }
