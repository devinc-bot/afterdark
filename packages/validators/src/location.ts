import { z } from 'zod'
import { LOCATION_TYPE } from '@afterdark/types'
import { uuidSchema } from './common.ts'
import { LOCATION_IMAGE_MAX_COUNT } from './upload.ts'

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

export const locationTypeSchema = z.enum([LOCATION_TYPE.PERMANENT, LOCATION_TYPE.TEMPORARY])

export const createLocationSchema = z.object({
  name: z.string().min(1, 'validation:field.location.name'),
  address: z.string().min(1, 'validation:field.location.address'),
  capacity: nonNegativeDigitsField(
    'validation:field.location.capacity.required',
    'validation:field.location.capacity.invalid'
  ),
  description: z.string().min(1, 'validation:field.location.description'),
  state: z.string().min(1, 'validation:field.location.state'),
  street_number: nonNegativeDigitsField(
    'validation:field.location.streetNumber.required',
    'validation:field.location.streetNumber.invalid'
  ),
  city: z.string().min(1, 'validation:field.location.city'),
  latitude: coordinateField(
    'validation:field.location.latitude.required',
    'validation:field.location.latitude.invalid',
    -90,
    90
  ),
  longitude: coordinateField(
    'validation:field.location.longitude.required',
    'validation:field.location.longitude.invalid',
    -180,
    180
  ),
})
export type CreateLocationInput = z.infer<typeof createLocationSchema>

export const updateLocationSchema = createLocationSchema
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>

export const updateLocationMultipartSchema = createLocationSchema.extend({
  keepImageIds: multipartUuidListSchema(),
})
export type UpdateLocationMultipartInput = z.infer<typeof updateLocationMultipartSchema>

export { LOCATION_IMAGE_MAX_COUNT }
