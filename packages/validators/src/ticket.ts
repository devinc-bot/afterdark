import { z } from 'zod'
import { TICKET_STATUS, TICKET_TYPE } from '@afterdark/types'
import { paginationSchema, uuidSchema } from './common.ts'

export const ticketStatusSchema = z.enum([TICKET_STATUS.ACTIVE, TICKET_STATUS.INACTIVE])

export const ticketTypeSchema = z.enum([TICKET_TYPE.GENERAL, TICKET_TYPE.VIP])

const ticketBaseSchema = z.object({
  name: z.string().trim().min(1, 'validation:field.ticket.name'),
  type: ticketTypeSchema.default(TICKET_TYPE.GENERAL),
  price: z.coerce.number().positive('validation:field.ticket.price'),
  quantity: z.coerce.number().int().positive('validation:field.ticket.quantity'),
  description: z.string().trim().min(1, 'validation:field.ticket.description'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: ticketStatusSchema.default(TICKET_STATUS.ACTIVE),
})

const ticketDateRangeRefine = {
  refine: (data: { startDate: string; endDate: string }) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return true
    }
    return end > start
  },
  message: 'validation:field.ticket.endDateAfterStart' as const,
  path: ['endDate'] as const,
}

const quantityStringSchema = z
  .string()
  .trim()
  .min(1, 'validation:field.ticket.quantity')
  .regex(/^\d+$/, 'validation:field.ticket.quantity')

const priceStringSchema = z.string().trim().min(1, 'validation:field.ticket.price')

export const ticketFormSchema = z
  .object({
    name: z.string().trim().min(1, 'validation:field.ticket.name'),
    clubId: z.string().min(1, 'validation:field.ticket.club').pipe(uuidSchema),
    type: ticketTypeSchema,
    price: priceStringSchema,
    quantity: quantityStringSchema,
    description: z.string().trim().min(1, 'validation:field.ticket.description'),
    startDate: z.string().min(1, 'validation:field.ticket.startDate'),
    endDate: z.string().min(1, 'validation:field.ticket.endDate'),
    status: ticketStatusSchema,
  })
  .refine(ticketDateRangeRefine.refine, {
    message: ticketDateRangeRefine.message,
    path: [...ticketDateRangeRefine.path],
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
    startDate: values.startDate,
    endDate: values.endDate,
    status: values.status,
  })
}

const ticketDateRangeRefineApi = {
  refine: (data: { startDate: Date; endDate: Date }) => data.endDate > data.startDate,
  message: 'validation:field.ticket.endDateAfterStart' as const,
  path: ['endDate'] as const,
}

export const createTicketSchema = ticketBaseSchema
  .extend({
    clubId: z.string().min(1, 'validation:field.ticket.club').pipe(uuidSchema),
  })
  .refine(ticketDateRangeRefineApi.refine, {
    message: ticketDateRangeRefineApi.message,
    path: [...ticketDateRangeRefineApi.path],
  })

export type CreateTicketInput = z.infer<typeof createTicketSchema>

export const updateTicketSchema = ticketBaseSchema.refine(ticketDateRangeRefineApi.refine, {
  message: ticketDateRangeRefineApi.message,
  path: [...ticketDateRangeRefineApi.path],
})

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>

export const listTicketsQuerySchema = paginationSchema.extend({
  status: ticketStatusSchema.optional(),
  clubId: uuidSchema.optional(),
})

export type ListTicketsQueryInput = z.infer<typeof listTicketsQuerySchema>
