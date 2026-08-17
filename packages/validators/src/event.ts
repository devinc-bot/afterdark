import { z } from 'zod'
import { EVENT_STATUS } from '@repo/types'
import { optionalCoercedDateSchema, paginationSchema, uuidSchema } from './common.ts'
import { EVENT_IMAGE_MAX_COUNT } from './upload.ts'

export const EVENT_FAQ_MAX_COUNT = 20
export const EVENT_FAQ_QUESTION_MAX_LENGTH = 200
export const EVENT_FAQ_ANSWER_MAX_LENGTH = 2000

export const EVENT_DURATION_MIN_HOURS = 1
export const EVENT_DURATION_MAX_HOURS = 72
export const EVENT_DURATION_HOURS_STEP = 0.5

export const eventDurationHoursSchema = z.coerce
  .number({ message: 'validation:field.event.durationHours' })
  .min(EVENT_DURATION_MIN_HOURS, 'validation:field.event.durationHours')
  .max(EVENT_DURATION_MAX_HOURS, 'validation:field.event.durationHours')
  .multipleOf(EVENT_DURATION_HOURS_STEP, 'validation:field.event.durationHours')

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

export const eventFaqItemSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'validation:field.event.faq.question')
    .max(EVENT_FAQ_QUESTION_MAX_LENGTH, 'validation:field.event.faq.questionMax'),
  answer: z
    .string()
    .trim()
    .min(1, 'validation:field.event.faq.answer')
    .max(EVENT_FAQ_ANSWER_MAX_LENGTH, 'validation:field.event.faq.answerMax'),
})

/** Accepts an array (JSON body) or a JSON string (multipart FormData). */
export const eventFaqsSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === '') {
      return []
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }

    return value
  },
  z.array(eventFaqItemSchema).max(EVENT_FAQ_MAX_COUNT, 'validation:field.event.faq.max')
)

export const eventStatusSchema = z.enum([
  EVENT_STATUS.DRAFT,
  EVENT_STATUS.PUBLISHED,
  EVENT_STATUS.FINISHED,
])

const createEventFieldsSchema = z.object({
  locationId: uuidSchema,
  name: z.string().trim().min(1, 'validation:field.event.name'),
  description: z.string().trim().min(1, 'validation:field.event.description'),
  startsAt: z.coerce.date({ message: 'validation:field.event.startDate' }),
  durationHours: eventDurationHoursSchema,
  status: eventStatusSchema.default(EVENT_STATUS.PUBLISHED),
  faqs: eventFaqsSchema.default([]),
})

export const createEventSchema = createEventFieldsSchema

export type CreateEventInput = z.infer<typeof createEventSchema>

export const updateEventSchema = createEventSchema

export type UpdateEventInput = z.infer<typeof updateEventSchema>

export const updateEventMultipartSchema = createEventFieldsSchema.extend({
  keepImageIds: multipartUuidListSchema(),
})

export type UpdateEventMultipartInput = z.infer<typeof updateEventMultipartSchema>

export { EVENT_IMAGE_MAX_COUNT }

export const eventFieldSchemas = {
  locationId: z.string().min(1, 'validation:field.event.location'),
  name: z.string().trim().min(1, 'validation:field.event.name'),
  description: z.string().trim().min(1, 'validation:field.event.description'),
  startsAt: z.string().trim().min(1, 'validation:field.event.startDate'),
  durationHours: z
    .string()
    .trim()
    .min(1, 'validation:field.event.durationHours')
    .refine((value) => eventDurationHoursSchema.safeParse(value).success, {
      message: 'validation:field.event.durationHours',
    }),
  status: eventStatusSchema,
  faqs: z.array(eventFaqItemSchema).max(EVENT_FAQ_MAX_COUNT, 'validation:field.event.faq.max'),
}

export const eventFormSchema = z.object(eventFieldSchemas)

export type EventFormValues = z.infer<typeof eventFormSchema>

export const eventDetailsFormSchema = z.object({
  name: eventFieldSchemas.name,
  description: eventFieldSchemas.description,
  startsAt: eventFieldSchemas.startsAt,
  durationHours: eventFieldSchemas.durationHours,
  status: eventFieldSchemas.status,
})

export type EventDetailsFormValues = z.infer<typeof eventDetailsFormSchema>

export function parseEventFormToCreateInput(values: EventFormValues): CreateEventInput {
  return createEventSchema.parse(values)
}

export function parseEventFormToUpdateInput(values: EventFormValues): UpdateEventInput {
  return updateEventSchema.parse(values)
}

export const listEventsQuerySchema = paginationSchema

export type ListEventsQueryInput = z.infer<typeof listEventsQuerySchema>

const optionalTrimmedQueryStringSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length === 0 ? undefined : trimmed
  }

  return value
}, z.string().max(100).optional())

export const listPublicEventsQuerySchema = paginationSchema
  .extend({
    limit: z.coerce.number().int().min(1).max(100).default(5),
    startsFrom: optionalCoercedDateSchema,
    startsTo: optionalCoercedDateSchema,
    city: optionalTrimmedQueryStringSchema,
    state: optionalTrimmedQueryStringSchema,
  })
  .refine(
    (data) => {
      if (!data.startsFrom || !data.startsTo) {
        return true
      }

      return data.startsTo >= data.startsFrom
    },
    {
      message: 'validation:field.event.endDateAfterStart' as const,
      path: ['startsTo'],
    }
  )

export type ListPublicEventsQueryInput = z.infer<typeof listPublicEventsQuerySchema>
