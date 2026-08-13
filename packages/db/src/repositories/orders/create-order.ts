import { db } from '../../client.ts'
import { orders, type OrderInsert, type OrderSelect } from '../../schema/orders.ts'

export async function createOrder(
  input: Pick<
    OrderInsert,
    | 'ticketId'
    | 'userId'
    | 'amount'
    | 'quantity'
    | 'status'
    | 'provider'
    | 'externalOrderId'
    | 'metadata'
  >
): Promise<OrderSelect> {
  const now = new Date()

  const [row] = await db
    .insert(orders)
    .values({
      ticketId: input.ticketId,
      userId: input.userId,
      amount: input.amount,
      quantity: input.quantity,
      status: input.status,
      provider: input.provider,
      externalOrderId: input.externalOrderId ?? null,
      metadata: input.metadata ?? null,
      updatedAt: now,
    })
    .returning()

  if (!row) {
    throw new Error('Order insert returned no row')
  }

  return row
}
