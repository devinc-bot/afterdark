import { z } from 'zod'
import { TICKET_STATUS, TICKET_TYPE } from '@afterdark/types'
import { paginationSchema, uuidSchema } from './common.ts'

export const ticketStatusSchema = z.enum([TICKET_STATUS.ACTIVE, TICKET_STATUS.INACTIVE])

export const ticketTypeSchema = z.enum([TICKET_TYPE.GENERAL, TICKET_TYPE.VIP])

const optionalEventIdSchema = z
  .union([z.string(), z.undefined()])
  .transform((value) => {
    const trimmed = value?.trim() ?? ''
    return trimmed.length === 0 ? undefined : trimmed
  })
  .pipe(z.union([uuidSchema, z.undefined()]))

const optionalDateTimeStringSchema = z.union([z.string(), z.undefined()]).transform((value) => {
  const trimmed = value?.trim() ?? ''
  return trimmed.length === 0 ? undefined : trimmed
})

const ticketSaleDateRangeRefine = {
  refine: (data: { saleStartsAt?: string; saleEndsAt?: string }) => {
    if (!data.saleStartsAt || !data.saleEndsAt) {
      return true
    }

    const start = new Date(data.saleStartsAt)
    const end = new Date(data.saleEndsAt)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return true
    }

    return end > start
  },
  message: 'validation:field.ticket.endDateAfterStart' as const,
  path: ['saleEndsAt'] as const,
}

const ticketSaleDateRangeRefineApi = {
  refine: (data: { saleStartsAt?: Date; saleEndsAt?: Date }) => {
    if (!data.saleStartsAt || !data.saleEndsAt) {
      return true
    }

    return data.saleEndsAt > data.saleStartsAt
  },
  message: 'validation:field.ticket.endDateAfterStart' as const,
  path: ['saleEndsAt'] as const,
}

const ticketBaseSchema = z
  .object({
    name: z.string().trim().min(1, 'validation:field.ticket.name'),
    type: ticketTypeSchema.default(TICKET_TYPE.GENERAL),
    price: z.coerce.number().positive('validation:field.ticket.price'),
    quantity: z.coerce.number().int().positive('validation:field.ticket.quantity'),
    description: z.string().trim().min(1, 'validation:field.ticket.description'),
    saleStartsAt: z.coerce.date().optional(),
    saleEndsAt: z.coerce.date().optional(),
    status: ticketStatusSchema.default(TICKET_STATUS.ACTIVE),
    eventId: optionalEventIdSchema,
  })
  .refine(ticketSaleDateRangeRefineApi.refine, {
    message: ticketSaleDateRangeRefineApi.message,
    path: [...ticketSaleDateRangeRefineApi.path],
  })

const quantityStringSchema = z
  .string()
  .trim()
  .min(1, 'validation:field.ticket.quantity')
  .regex(/^\d+$/, 'validation:field.ticket.quantity')

const priceStringSchema = z.string().trim().min(1, 'validation:field.ticket.price')

export const ticketFormSchema = z
  .object({
    name: z.string().trim().min(1, 'validation:field.ticket.name'),
    eventId: optionalEventIdSchema,
    type: ticketTypeSchema,
    price: priceStringSchema,
    quantity: quantityStringSchema,
    description: z.string().trim().min(1, 'validation:field.ticket.description'),
    saleStartsAt: optionalDateTimeStringSchema,
    saleEndsAt: optionalDateTimeStringSchema,
    status: ticketStatusSchema,
  })
  .refine(ticketSaleDateRangeRefine.refine, {
    message: ticketSaleDateRangeRefine.message,
    path: [...ticketSaleDateRangeRefine.path],
  })

export type TicketFormValues = z.infer<typeof ticketFormSchema>

export function parseTicketFormToCreateInput(values: TicketFormValues): CreateTicketInput {
  return createTicketSchema.parse(values)
}

export function parseTicketFormToUpdateInput(values: TicketFormValues): UpdateTicketInput {
  return updateTicketSchema.parse({
    name: values.name,
    type: values.type,
    price: values.price,
    quantity: values.quantity,
    description: values.description,
    saleStartsAt: values.saleStartsAt,
    saleEndsAt: values.saleEndsAt,
    status: values.status,
    eventId: values.eventId,
  })
}

export const createTicketSchema = ticketBaseSchema

export type CreateTicketInput = z.infer<typeof createTicketSchema>

export const updateTicketSchema = ticketBaseSchema

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>

export const listTicketsQuerySchema = paginationSchema.extend({
  status: ticketStatusSchema.optional(),
  clubId: uuidSchema.optional(),
})

export type ListTicketsQueryInput = z.infer<typeof listTicketsQuerySchema>
