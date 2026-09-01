import { and, eq, sql } from 'drizzle-orm'
import {
  INVENTORY_RESERVATION_STATUS,
  PAYMENT_ATTEMPT_STATUS,
  PAYMENT_PROVIDER,
  PURCHASE_STATUS,
} from '@repo/types'
import { db } from '../../client.ts'
import { payments, type PaymentSelect } from '../../schema/payment.ts'

export type AttachProviderPreferenceInput = {
  purchaseDocumentId: string
  provider: typeof PAYMENT_PROVIDER.MERCADO_PAGO
  providerPreferenceId: string
  metadata?: Record<string, unknown> | null
  now: Date
}

export type ProviderPreferenceAttachmentResult =
  | { outcome: 'attached'; payment: PaymentSelect }
  | { outcome: 'already_attached'; payment: PaymentSelect }
  | { outcome: 'not_attachable' }

export async function attachProviderPreference(
  input: AttachProviderPreferenceInput
): Promise<ProviderPreferenceAttachmentResult> {
  return db.transaction(async (tx) => {
    const locked = await tx.execute<{
      paymentId: number
      providerPreferenceId: string | null
    }>(sql`
      select pay.id as "paymentId", pay.provider_preference_id as "providerPreferenceId"
      from purchases p
      join purchase_items pi on pi.purchase_id = p.id
      join inventory_reservations r on r.purchase_item_id = pi.id
      join payments pay on pay.purchase_id = p.id
      where p.document_id = ${input.purchaseDocumentId}
        and p.status = ${PURCHASE_STATUS.PENDING}
        and r.status = ${INVENTORY_RESERVATION_STATUS.ACTIVE}
        and r.expires_at > ${input.now}
        and pay.provider = ${input.provider}
        and pay.status = ${PAYMENT_ATTEMPT_STATUS.PENDING}
      for update of p, pi, r, pay
    `)
    const payment = locked.rows[0]
    if (!payment) return { outcome: 'not_attachable' }

    if (payment.providerPreferenceId) {
      if (payment.providerPreferenceId !== input.providerPreferenceId) {
        return { outcome: 'not_attachable' }
      }

      const [existingPayment] = await tx
        .select()
        .from(payments)
        .where(eq(payments.id, payment.paymentId))
        .limit(1)
      if (!existingPayment) throw new Error('Attached payment returned no row')
      return { outcome: 'already_attached', payment: existingPayment }
    }

    const [updatedPayment] = await tx
      .update(payments)
      .set({
        providerPreferenceId: input.providerPreferenceId,
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
        updatedAt: input.now,
      })
      .where(
        and(eq(payments.id, payment.paymentId), eq(payments.status, PAYMENT_ATTEMPT_STATUS.PENDING))
      )
      .returning()
    if (!updatedPayment) return { outcome: 'not_attachable' }

    return { outcome: 'attached', payment: updatedPayment }
  })
}
