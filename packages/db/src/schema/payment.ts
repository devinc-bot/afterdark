import {
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { PAYMENT_ATTEMPT_STATUS, PAYMENT_PROVIDER } from '@repo/types/enums'
import { createBaseColumns } from './base.ts'
import { purchases } from './purchase.ts'

export const payments = pgTable(
  'payments',
  {
    ...createBaseColumns('payments'),
    purchaseId: integer('purchase_id')
      .notNull()
      .references(() => purchases.id),
    provider: text('provider', { enum: [PAYMENT_PROVIDER.MERCADO_PAGO] }).notNull(),
    status: text('status', {
      enum: [
        PAYMENT_ATTEMPT_STATUS.PENDING,
        PAYMENT_ATTEMPT_STATUS.APPROVED,
        PAYMENT_ATTEMPT_STATUS.REJECTED,
        PAYMENT_ATTEMPT_STATUS.CANCELLED,
      ],
    })
      .notNull()
      .default(PAYMENT_ATTEMPT_STATUS.PENDING),
    amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    providerPreferenceId: text('provider_preference_id'),
    providerPaymentId: text('provider_payment_id'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    reconciledAt: timestamp('reconciled_at', { withTimezone: true }),
    reconciliationError: text('reconciliation_error'),
  },
  (table) => [
    check('payments_amount_non_negative', sql`${table.amount} >= 0`),
    check('payments_provider_valid', sql`${table.provider} = ${PAYMENT_PROVIDER.MERCADO_PAGO}`),
    check(
      'payments_status_valid',
      sql`${table.status} in (${PAYMENT_ATTEMPT_STATUS.PENDING}, ${PAYMENT_ATTEMPT_STATUS.APPROVED}, ${PAYMENT_ATTEMPT_STATUS.REJECTED}, ${PAYMENT_ATTEMPT_STATUS.CANCELLED})`
    ),
    index('payments_purchase_created_at_idx').on(table.purchaseId, table.createdAt),
    uniqueIndex('payments_provider_preference_unique')
      .on(table.provider, table.providerPreferenceId)
      .where(sql`${table.providerPreferenceId} is not null`),
    uniqueIndex('payments_provider_payment_unique')
      .on(table.provider, table.providerPaymentId)
      .where(sql`${table.providerPaymentId} is not null`),
  ]
)

export type PaymentSelect = typeof payments.$inferSelect
export type PaymentInsert = typeof payments.$inferInsert
