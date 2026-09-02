import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { PAYMENT_PROVIDER, PAYMENT_WEBHOOK_EVENT_STATUS } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { payments } from './payment.ts'

export const paymentWebhookEvents = pgTable(
  'payment_webhook_events',
  {
    ...createBaseColumns('payment_webhook_events'),
    provider: text('provider', { enum: [PAYMENT_PROVIDER.MERCADO_PAGO] }).notNull(),
    providerEventId: text('provider_event_id'),
    providerPaymentId: text('provider_payment_id'),
    paymentId: integer('payment_id').references(() => payments.id),
    status: text('status', {
      enum: [
        PAYMENT_WEBHOOK_EVENT_STATUS.RECEIVED,
        PAYMENT_WEBHOOK_EVENT_STATUS.PROCESSING,
        PAYMENT_WEBHOOK_EVENT_STATUS.PROCESSED,
        PAYMENT_WEBHOOK_EVENT_STATUS.FAILED,
      ],
    })
      .notNull()
      .default(PAYMENT_WEBHOOK_EVENT_STATUS.RECEIVED),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    processingAttempts: integer('processing_attempts').notNull().default(0),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    lastError: text('last_error'),
  },
  (table) => [
    check(
      'payment_webhook_events_provider_valid',
      sql`${table.provider} = ${PAYMENT_PROVIDER.MERCADO_PAGO}`
    ),
    check(
      'payment_webhook_events_status_valid',
      sql`${table.status} in (${PAYMENT_WEBHOOK_EVENT_STATUS.RECEIVED}, ${PAYMENT_WEBHOOK_EVENT_STATUS.PROCESSING}, ${PAYMENT_WEBHOOK_EVENT_STATUS.PROCESSED}, ${PAYMENT_WEBHOOK_EVENT_STATUS.FAILED})`
    ),
    uniqueIndex('payment_webhook_events_provider_event_unique')
      .on(table.provider, table.providerEventId)
      .where(sql`${table.providerEventId} is not null`),
    uniqueIndex('payment_webhook_events_provider_payment_unique')
      .on(table.provider, table.providerPaymentId)
      .where(sql`${table.providerPaymentId} is not null`),
    index('payment_webhook_events_provider_payment_idx').on(
      table.provider,
      table.providerPaymentId
    ),
    index('payment_webhook_events_pending_idx')
      .on(table.status, table.createdAt)
      .where(
        sql`${table.status} in (${PAYMENT_WEBHOOK_EVENT_STATUS.RECEIVED}, ${PAYMENT_WEBHOOK_EVENT_STATUS.FAILED})`
      ),
  ]
)

export type PaymentWebhookEventSelect = typeof paymentWebhookEvents.$inferSelect
export type PaymentWebhookEventInsert = typeof paymentWebhookEvents.$inferInsert
