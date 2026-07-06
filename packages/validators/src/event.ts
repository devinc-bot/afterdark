import { z } from 'zod'
import { EVENT_STATUS } from '@afterdark/types'
import { paginationSchema, uuidSchema } from './common.ts'

export const eventStatusSchema = z.enum([
  EVENT_STATUS.DRAFT,
  EVENT_STATUS.PUBLISHED,
  EVENT_STATUS.FINISHED,
])

const eventDateRangeRefineForm = {
  refine: (data: { startsAt: string; endsAt: string }) => {
    const start = new Date(data.startsAt)
    const end = new Date(data.endsAt)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return true
    }

    return end > start
  },
  message: 'validation:field.event.endDateAfterStart' as const,
  path: ['endsAt'] as const,
}

const eventDateRangeRefineApi = {
  refine: (data: { startsAt: Date; endsAt: Date }) => data.endsAt > data.startsAt,
  message: 'validation:field.event.endDateAfterStart' as const,
  path: ['endsAt'] as const,
}

export const createEventSchema = z
  .object({
    clubId: uuidSchema,
    name: z.string().trim().min(1, 'validation:field.event.name'),
    description: z.string().trim().min(1, 'validation:field.event.description'),
    startsAt: z.coerce.date({ message: 'validation:field.event.startDate' }),
    endsAt: z.coerce.date({ message: 'validation:field.event.endDate' }),
    status: eventStatusSchema.default(EVENT_STATUS.PUBLISHED),
  })
  .refine(eventDateRangeRefineApi.refine, {
    message: eventDateRangeRefineApi.message,
    path: [...eventDateRangeRefineApi.path],
  })

export type CreateEventInput = z.infer<typeof createEventSchema>

export const updateEventSchema = createEventSchema

export type UpdateEventInput = z.infer<typeof updateEventSchema>

export const eventFormSchema = z
  .object({
    clubId: z.string().min(1, 'validation:field.event.club'),
    name: z.string().trim().min(1, 'validation:field.event.name'),
    description: z.string().trim().min(1, 'validation:field.event.description'),
    startsAt: z.string().trim().min(1, 'validation:field.event.startDate'),
    endsAt: z.string().trim().min(1, 'validation:field.event.endDate'),
    status: eventStatusSchema,
  })
  .refine(eventDateRangeRefineForm.refine, {
    message: eventDateRangeRefineForm.message,
    path: [...eventDateRangeRefineForm.path],
  })

export type EventFormValues = z.infer<typeof eventFormSchema>

export function parseEventFormToCreateInput(values: EventFormValues): CreateEventInput {
  return createEventSchema.parse(values)
}

export function parseEventFormToUpdateInput(values: EventFormValues): UpdateEventInput {
  return updateEventSchema.parse(values)
}

export const listEventsQuerySchema = paginationSchema

export type ListEventsQueryInput = z.infer<typeof listEventsQuerySchema>
