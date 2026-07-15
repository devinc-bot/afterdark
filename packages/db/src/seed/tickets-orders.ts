import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { USER_ROLE } from '@afterdark/types'
import {
  EVENT_STATUS,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  TICKET_STATUS,
  TICKET_TYPE,
} from '@afterdark/types/enums'
import { db } from '../client.ts'
import { seedEnv } from '../config/seed.env.ts'
import { accounts } from '../schema/account.ts'
import { accountRolesLnk } from '../schema/account-role-lnk.ts'
import { addresses } from '../schema/address.ts'
import { clubAddressesLnk } from '../schema/club-address-lnk.ts'
import { clubs } from '../schema/club.ts'
import { events } from '../schema/event.ts'
import { orders } from '../schema/orders.ts'
import { ownerAccountsLnk } from '../schema/owner-account-lnk.ts'
import { owners } from '../schema/owner.ts'
import { roles } from '../schema/role.ts'
import { tickets } from '../schema/ticket.ts'
import { ticketsSold } from '../schema/tickets_sold.ts'
import { userAccountsLnk } from '../schema/user-account-lnk.ts'
import { users } from '../schema/user.ts'

const DAY_MS = 24 * 60 * 60 * 1000
const BCRYPT_SALT_ROUNDS = 10

const ORDER_STATUSES = [
  PAYMENT_STATUS.COMPLETED,
  PAYMENT_STATUS.PENDING,
  PAYMENT_STATUS.REJECTED,
  PAYMENT_STATUS.CANCELLED,
] as const

async function getRoleIdByName(name: string): Promise<number> {
  const [row] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, name)).limit(1)
  if (!row) throw new Error(`Role not found: ${name}`)
  return row.id
}

async function upsertAccountByEmail(
  documentId: string,
  email: string,
  plainPassword: string
): Promise<number> {
  const hashedPassword = await hash(plainPassword, BCRYPT_SALT_ROUNDS)
  const [existing] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.email, email))
    .limit(1)

  if (existing) {
    await db
      .update(accounts)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(accounts.id, existing.id))
    return existing.id
  }

  const [row] = await db
    .insert(accounts)
    .values({ documentId, email, password: hashedPassword })
    .returning({ id: accounts.id })
  return row.id
}

async function upsertOwnerAccountLink(
  documentId: string,
  ownerId: number,
  accountId: number
): Promise<void> {
  const [existing] = await db
    .select({ id: ownerAccountsLnk.id })
    .from(ownerAccountsLnk)
    .where(eq(ownerAccountsLnk.accountId, accountId))
    .limit(1)
  if (existing) return

  await db.insert(ownerAccountsLnk).values({ documentId, ownerId, accountId })
}

async function upsertAccountRoleLink(
  documentId: string,
  accountId: number,
  roleId: number
): Promise<void> {
  const [existing] = await db
    .select({ id: accountRolesLnk.id })
    .from(accountRolesLnk)
    .where(eq(accountRolesLnk.accountId, accountId))
    .limit(1)
  if (existing) return

  await db.insert(accountRolesLnk).values({ documentId, accountId, roleId })
}

async function upsertUserAccountLink(
  documentId: string,
  userId: number,
  accountId: number
): Promise<void> {
  const [existing] = await db
    .select({ id: userAccountsLnk.id })
    .from(userAccountsLnk)
    .where(eq(userAccountsLnk.accountId, accountId))
    .limit(1)
  if (existing) return

  await db.insert(userAccountsLnk).values({ documentId, userId, accountId })
}

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

async function upsertClubAddress(
  clubId: number,
  documentId: string,
  values: Omit<typeof addresses.$inferInsert, 'documentId'>
): Promise<void> {
  const [existingLink] = await db
    .select({ id: clubAddressesLnk.id })
    .from(clubAddressesLnk)
    .where(eq(clubAddressesLnk.clubId, clubId))
    .limit(1)
  if (existingLink) return

  const [existingAddress] = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(eq(addresses.documentId, documentId))
    .limit(1)

  const addressId =
    existingAddress?.id ??
    (
      await db
        .insert(addresses)
        .values({ documentId, ...values })
        .returning({ id: addresses.id })
    )[0].id

  await db.insert(clubAddressesLnk).values({
    documentId: `${documentId}-lnk`,
    clubId,
    addressId,
  })
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

async function upsertOrder(
  documentId: string,
  values: typeof orders.$inferInsert
): Promise<number> {
  const [existing] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.documentId, documentId))
    .limit(1)
  if (existing) return existing.id

  const [row] = await db
    .insert(orders)
    .values({ ...values, documentId })
    .returning({ id: orders.id })
  return row.id
}

async function upsertTicketSold(
  documentId: string,
  values: typeof ticketsSold.$inferInsert
): Promise<void> {
  const [existing] = await db
    .select({ id: ticketsSold.id })
    .from(ticketsSold)
    .where(eq(ticketsSold.documentId, documentId))
    .limit(1)
  if (existing) return

  await db.insert(ticketsSold).values({ ...values, documentId })
}

export async function seedTicketsOrders(): Promise<void> {
  const [ownerRoleId, userRoleId] = await Promise.all([
    getRoleIdByName(USER_ROLE.OWNER),
    getRoleIdByName(USER_ROLE.USER),
  ])

  const accountId = await upsertAccountByEmail(
    seedEnv.SEED_ACCOUNT_DOCUMENT_ID,
    seedEnv.SEED_OWNER_EMAIL,
    seedEnv.SEED_OWNER_PASSWORD
  )

  const ownerId = await upsertOwner(seedEnv.SEED_OWNER_DOCUMENT_ID, {
    documentId: seedEnv.SEED_OWNER_DOCUMENT_ID,
    name: 'Test',
    lastName: 'Owner',
    phone: '1130000001',
  })

  await upsertOwnerAccountLink(`${seedEnv.SEED_OWNER_DOCUMENT_ID}-account-lnk`, ownerId, accountId)
  await upsertAccountRoleLink(
    `${seedEnv.SEED_ACCOUNT_DOCUMENT_ID}-role-lnk`,
    accountId,
    ownerRoleId
  )

  const buyerAccountId = await upsertAccountByEmail(
    seedEnv.SEED_BUYER_ACCOUNT_DOCUMENT_ID,
    seedEnv.SEED_BUYER_EMAIL,
    seedEnv.SEED_BUYER_PASSWORD
  )

  const buyerUserId = await upsertUser(seedEnv.SEED_BUYER_DOCUMENT_ID, {
    documentId: seedEnv.SEED_BUYER_DOCUMENT_ID,
    name: seedEnv.SEED_BUYER_NAME,
    lastName: seedEnv.SEED_BUYER_LAST_NAME,
    phone: seedEnv.SEED_BUYER_PHONE,
  })

  await upsertUserAccountLink(
    `${seedEnv.SEED_BUYER_DOCUMENT_ID}-account-lnk`,
    buyerUserId,
    buyerAccountId
  )
  await upsertAccountRoleLink(
    `${seedEnv.SEED_BUYER_ACCOUNT_DOCUMENT_ID}-role-lnk`,
    buyerAccountId,
    userRoleId
  )

  const clubIds = await Promise.all([
    upsertClub('seed-club-1', {
      documentId: 'seed-club-1',
      name: 'Club Nocturno Aurora',
      capacity: '500',
      description: 'Club de prueba 1',
      ownerId,
    }),
    upsertClub('seed-club-2', {
      documentId: 'seed-club-2',
      name: 'Club Nocturno Eclipse',
      capacity: '800',
      description: 'Club de prueba 2',
      ownerId,
    }),
  ])

  await upsertClubAddress(clubIds[0], 'seed-club-1-address', {
    address: 'Av. Corrientes',
    streetNumber: '1234',
    city: 'Buenos Aires',
    state: 'CABA',
  })
  await upsertClubAddress(clubIds[1], 'seed-club-2-address', {
    address: 'Av. Santa Fe',
    streetNumber: '5678',
    city: 'Buenos Aires',
    state: 'CABA',
  })

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
    const status = ORDER_STATUSES[i % ORDER_STATUSES.length]
    const paidAt =
      status === PAYMENT_STATUS.COMPLETED
        ? new Date(now - i * 4 * DAY_MS - (i % 5) * 60 * 60 * 1000)
        : null

    const orderId = await upsertOrder(`seed-order-${i}`, {
      documentId: `seed-order-${i}`,
      ticketId: ticket.id,
      userId: buyerUserId,
      status,
      amount: ticket.price * quantity,
      quantity,
      provider: PAYMENT_PROVIDER.MERCADO_PAGO,
      paidAt,
      metadata:
        status === PAYMENT_STATUS.COMPLETED
          ? {
              providerPaymentId: `mp-seed-${i}`,
              preferenceId: `pref-seed-${i}`,
            }
          : null,
    })

    if (status !== PAYMENT_STATUS.COMPLETED) continue

    for (let unit = 1; unit <= quantity; unit++) {
      const checkedIn = i % 2 === 0 && unit === 1

      await upsertTicketSold(`seed-ticket-sold-${i}-${unit}`, {
        documentId: `seed-ticket-sold-${i}-${unit}`,
        orderId,
        qrCode: `seed-qr-${i}-${unit}`,
        checkedIn,
        usedAt: checkedIn ? new Date(now - unit * 30 * 60 * 1000) : null,
      })
    }
  }
}
