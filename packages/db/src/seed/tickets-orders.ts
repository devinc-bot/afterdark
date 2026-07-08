import { eq } from 'drizzle-orm'
import {
  EVENT_STATUS,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  TICKET_STATUS,
  TICKET_TYPE,
} from '@afterdark/types/enums'
import { db } from '../client.ts'
import { clubs } from '../schema/club.ts'
import { events } from '../schema/event.ts'
import { orders } from '../schema/orders.ts'
import { owners } from '../schema/owner.ts'
import { tickets } from '../schema/ticket.ts'
import { users } from '../schema/user.ts'

const DAY_MS = 24 * 60 * 60 * 1000

const ORDER_STATUSES = [
  PAYMENT_STATUS.COMPLETED,
  PAYMENT_STATUS.PENDING,
  PAYMENT_STATUS.REJECTED,
  PAYMENT_STATUS.CANCELLED,
] as const

async function upsertOwner(
  documentId: string,
  values: typeof owners.$inferInsert
): Promise<number> {
  const [existing] = await db
    .select({ id: owners.id })
    .from(owners)
    .where(eq(owners.documentId, documentId))
    .limit(1)
  if (existing) return existing.id

  const [row] = await db
    .insert(owners)
    .values({ ...values, documentId })
    .returning({ id: owners.id })
  return row.id
}

async function upsertUser(documentId: string, values: typeof users.$inferInsert): Promise<number> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.documentId, documentId))
    .limit(1)
  if (existing) return existing.id

  const [row] = await db
    .insert(users)
    .values({ ...values, documentId })
    .returning({ id: users.id })
  return row.id
}

async function upsertClub(documentId: string, values: typeof clubs.$inferInsert): Promise<number> {
  const [existing] = await db
    .select({ id: clubs.id })
    .from(clubs)
    .where(eq(clubs.documentId, documentId))
    .limit(1)
  if (existing) return existing.id

  const [row] = await db
    .insert(clubs)
    .values({ ...values, documentId })
    .returning({ id: clubs.id })
  return row.id
}

async function upsertEvent(
  documentId: string,
  values: typeof events.$inferInsert
): Promise<number> {
  const [existing] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.documentId, documentId))
    .limit(1)
  if (existing) return existing.id

  const [row] = await db
    .insert(events)
    .values({ ...values, documentId })
    .returning({ id: events.id })
  return row.id
}

async function upsertTicket(
  documentId: string,
  values: typeof tickets.$inferInsert
): Promise<{ id: number; price: number }> {
  const [existing] = await db
    .select({ id: tickets.id, price: tickets.price })
    .from(tickets)
    .where(eq(tickets.documentId, documentId))
    .limit(1)
  if (existing) return existing

  const [row] = await db
    .insert(tickets)
    .values({ ...values, documentId })
    .returning({ id: tickets.id, price: tickets.price })
  return row
}

async function upsertOrder(documentId: string, values: typeof orders.$inferInsert): Promise<void> {
  const [existing] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.documentId, documentId))
    .limit(1)
  if (existing) return

  await db.insert(orders).values({ ...values, documentId })
}

export async function seedTicketsOrders(): Promise<void> {
  const ownerIds = await Promise.all([
    upsertOwner('seed-owner-1', {
      documentId: 'seed-owner-1',
      name: 'Ana',
      lastName: 'García',
      phone: '1130000001',
    }),
    upsertOwner('seed-owner-2', {
      documentId: 'seed-owner-2',
      name: 'Bruno',
      lastName: 'López',
      phone: '1130000002',
    }),
  ])

  const userIds = await Promise.all([
    upsertUser('seed-user-1', {
      documentId: 'seed-user-1',
      name: 'Carla',
      lastName: 'Méndez',
      phone: '1140000001',
    }),
    upsertUser('seed-user-2', {
      documentId: 'seed-user-2',
      name: 'Diego',
      lastName: 'Ruiz',
      phone: '1140000002',
    }),
  ])

  const clubIds = await Promise.all([
    upsertClub('seed-club-1', {
      documentId: 'seed-club-1',
      name: 'Club Nocturno Aurora',
      capacity: '500',
      description: 'Club de prueba 1',
      ownerId: ownerIds[0],
    }),
    upsertClub('seed-club-2', {
      documentId: 'seed-club-2',
      name: 'Club Nocturno Eclipse',
      capacity: '800',
      description: 'Club de prueba 2',
      ownerId: ownerIds[1],
    }),
  ])

  const now = Date.now()
  const eventClubIndexes = [0, 1, 0]
  const eventIds: number[] = []

  for (let i = 0; i < eventClubIndexes.length; i++) {
    const n = i + 1
    const id = await upsertEvent(`seed-event-${n}`, {
      documentId: `seed-event-${n}`,
      clubId: clubIds[eventClubIndexes[i]],
      name: `Evento ${n}`,
      description: `Evento de prueba número ${n}`,
      startsAt: new Date(now + n * DAY_MS),
      endsAt: new Date(now + n * DAY_MS + 4 * 60 * 60 * 1000),
      location: `Salón ${n}`,
      status: EVENT_STATUS.PUBLISHED,
    })
    eventIds.push(id)
  }

  const SEED_COUNT = 6
  const ticketRefs: { id: number; price: number }[] = []

  for (let i = 1; i <= SEED_COUNT; i++) {
    const eventId = eventIds[(i - 1) % eventIds.length]
    const ticket = await upsertTicket(`seed-ticket-${i}`, {
      documentId: `seed-ticket-${i}`,
      name: `Entrada ${i}`,
      price: 1000 * i,
      quantity: 100 * i,
      description: `Entrada de prueba número ${i}`,
      status: TICKET_STATUS.ACTIVE,
      type: i % 3 === 0 ? TICKET_TYPE.VIP : TICKET_TYPE.GENERAL,
      eventId,
    })
    ticketRefs.push(ticket)
  }

  for (let i = 1; i <= SEED_COUNT; i++) {
    const ticket = ticketRefs[i - 1]
    const quantity = (i % 4) + 1

    await upsertOrder(`seed-order-${i}`, {
      documentId: `seed-order-${i}`,
      ticketId: ticket.id,
      userId: userIds[(i - 1) % userIds.length],
      status: ORDER_STATUSES[i % ORDER_STATUSES.length],
      amount: ticket.price * quantity,
      quantity,
      provider: PAYMENT_PROVIDER.MERCADO_PAGO,
    })
  }
}
