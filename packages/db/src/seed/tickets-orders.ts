import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { USER_ROLE } from '@repo/types'
import {
  EVENT_STATUS,
  OWNER_STATUS,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  TICKET_STATUS,
  TICKET_TYPE,
} from '@repo/types/enums'
import { db } from '../client.ts'
import { seedEnv } from '../config/seed.env.ts'
import { accounts } from '../schema/account.ts'
import { accountRolesLnk } from '../schema/account-role-lnk.ts'
import { addresses } from '../schema/address.ts'
import { locationAddressesLnk } from '../schema/location-address-lnk.ts'
import { locations } from '../schema/location.ts'
import { events } from '../schema/event.ts'
import { orders } from '../schema/orders.ts'
import { organizationAccountsLnk } from '../schema/organization-account-lnk.ts'
import { organizations } from '../schema/organization.ts'
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

async function ensureOrganizationMembership(accountId: number): Promise<number> {
  const [existing] = await db
    .select({ organizationId: organizationAccountsLnk.organizationId })
    .from(organizationAccountsLnk)
    .where(eq(organizationAccountsLnk.accountId, accountId))
    .limit(1)
  if (existing) return existing.organizationId

  const [organization] = await db
    .insert(organizations)
    .values({ documentId: 'seed-organization', name: 'Test Owner' })
    .returning({ id: organizations.id })

  await db.insert(organizationAccountsLnk).values({
    documentId: 'seed-organization-account-lnk',
    organizationId: organization.id,
    accountId,
  })

  return organization.id
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

async function upsertLocation(
  documentId: string,
  values: typeof locations.$inferInsert
): Promise<number> {
  const [existing] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.documentId, documentId))
    .limit(1)
  if (existing) return existing.id

  const [row] = await db
    .insert(locations)
    .values({ ...values, documentId })
    .returning({ id: locations.id })
  return row.id
}

async function upsertLocationAddress(
  locationId: number,
  documentId: string,
  values: Omit<typeof addresses.$inferInsert, 'documentId'>
): Promise<void> {
  const [existingLink] = await db
    .select({ id: locationAddressesLnk.id })
    .from(locationAddressesLnk)
    .where(eq(locationAddressesLnk.locationId, locationId))
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

  await db.insert(locationAddressesLnk).values({
    documentId: `${documentId}-lnk`,
    locationId,
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

  if (existing) {
    await db
      .update(orders)
      .set({
        ticketId: values.ticketId,
        userId: values.userId,
        status: values.status,
        amount: values.amount,
        quantity: values.quantity,
        provider: values.provider,
        paidAt: values.paidAt,
        externalOrderId: values.externalOrderId,
        metadata: values.metadata,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, existing.id))
    return existing.id
  }

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
    status: OWNER_STATUS.ACTIVE,
  })

  await upsertOwnerAccountLink(`${seedEnv.SEED_OWNER_DOCUMENT_ID}-account-lnk`, ownerId, accountId)
  await upsertAccountRoleLink(
    `${seedEnv.SEED_ACCOUNT_DOCUMENT_ID}-role-lnk`,
    accountId,
    ownerRoleId
  )
  const organizationId = await ensureOrganizationMembership(accountId)

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

  const locationIds = await Promise.all([
    upsertLocation('seed-location-1', {
      documentId: 'seed-location-1',
      name: 'Location Nocturno Aurora',
      capacity: '500',
      description: 'Location de prueba 1',
      ownerId,
    }),
    upsertLocation('seed-location-2', {
      documentId: 'seed-location-2',
      name: 'Location Nocturno Eclipse',
      capacity: '800',
      description: 'Location de prueba 2',
      ownerId,
    }),
  ])

  await upsertLocationAddress(locationIds[0], 'seed-location-1-address', {
    address: 'Av. Corrientes',
    streetNumber: '1234',
    city: 'Buenos Aires',
    state: 'CABA',
  })
  await upsertLocationAddress(locationIds[1], 'seed-location-2-address', {
    address: 'Av. Santa Fe',
    streetNumber: '5678',
    city: 'Buenos Aires',
    state: 'CABA',
  })

  const now = Date.now()
  const eventLocationIndexes = [0, 1, 0]
  const eventIds: number[] = []

  for (let i = 0; i < eventLocationIndexes.length; i++) {
    const n = i + 1
    const id = await upsertEvent(`seed-event-${n}`, {
      documentId: `seed-event-${n}`,
      locationId: locationIds[eventLocationIndexes[i]],
      organizationId,
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
  /** First N orders are completed purchases on distinct past days. */
  const COMPLETED_ORDER_COUNT = 4
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
    const isCompleted = i <= COMPLETED_ORDER_COUNT
    const status = isCompleted
      ? PAYMENT_STATUS.COMPLETED
      : ORDER_STATUSES[((i - COMPLETED_ORDER_COUNT) % (ORDER_STATUSES.length - 1)) + 1]
    // Spread completed sales across the last ~2 weeks (distinct days + hour offsets).
    const paidAt = isCompleted
      ? new Date(now - i * 3 * DAY_MS - (i % 4) * 2 * 60 * 60 * 1000)
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
      externalOrderId: isCompleted ? `mp-seed-${i}` : null,
      metadata: isCompleted
        ? {
            preferenceId: `pref-seed-${i}`,
          }
        : null,
    })

    if (!isCompleted) continue

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
