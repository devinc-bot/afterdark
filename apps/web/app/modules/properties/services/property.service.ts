import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { filterPropertySchema, paginationSchema } from '@afterdark/validators'
import { db, properties } from '@afterdark/db'

const getPropertiesInput = z.object({
  ...filterPropertySchema.shape,
  ...paginationSchema.shape,
})

export const getPropertiesFn = createServerFn({ method: 'GET' })
  .inputValidator(getPropertiesInput)
  .handler(async ({ data: _data }) => {
    return db.select().from(properties)
  })

export const getPropertyFn = createServerFn({ method: 'GET' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: _id }) => {
    return null
  })
