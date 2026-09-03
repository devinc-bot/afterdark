import 'reflect-metadata'
import { Reflector } from '@nestjs/core'
import { expect, test } from 'vitest'
import { RATE_LIMIT_POLICY } from '../../../config/env.ts'
import { RATE_LIMIT_PROFILE, type RateLimitProfile } from '../../../config/rate-limit.policy.ts'
import { AuthController } from '../../auth/presentation/auth.controller.ts'
import { DashboardController } from '../../dashboard/dashboard.controller.ts'
import { ErrorsController } from '../../errors/presentation/errors.controller.ts'
import { EventsController } from '../../events/presentation/events.controller.ts'
import { GeoController } from '../../geo/presentation/geo.controller.ts'
import { InvitationsController } from '../../invitations/presentation/invitations.controller.ts'
import { LocationsController } from '../../locations/presentation/locations.controller.ts'
import { OrdersController } from '../../orders/presentation/orders.controller.ts'
import { OrganizationsController } from '../../organizations/presentation/organizations.controller.ts'
import { SessionController } from '../../session/presentation/session.controller.ts'
import { SettingsController } from '../../settings/presentation/settings.controller.ts'
import { StaffController } from '../../staff/presentation/staff.controller.ts'
import { TicketTypesController } from '../../ticket-types/presentation/ticket-types.controller.ts'
import { TicketsController } from '../../tickets/presentation/tickets.controller.ts'
import { UsersController } from '../../users/presentation/users.controller.ts'
import { UserRateLimit } from '../decorators/user-rate-limit.decorator.ts'
import { JwtAuthGuard } from './jwt-auth.guard.ts'
import { RolesGuard } from './roles.guard.ts'
import { UserRateLimitGuard } from './user-rate-limit.guard.ts'

const THROTTLE_LIMIT_DEFAULT = 'THROTTLER:LIMITdefault'
const THROTTLE_TTL_DEFAULT = 'THROTTLER:TTLdefault'
const GUARDS_METADATA = '__guards__'

const reflector = new Reflector()

type ControllerClass = abstract new (...args: never[]) => object

function handlerOf(Controller: ControllerClass, method: string) {
  const handler = Controller.prototype[method as keyof typeof Controller.prototype]
  if (typeof handler !== 'function') {
    throw new Error(`Missing handler ${Controller.name}.${method}`)
  }
  return handler as (...args: never[]) => unknown
}

function ipMetadata(handler: (...args: never[]) => unknown, classRef: ControllerClass) {
  const handlerLimit = reflector.get<number | undefined>(THROTTLE_LIMIT_DEFAULT, handler)
  const handlerTtl = reflector.get<number | undefined>(THROTTLE_TTL_DEFAULT, handler)
  const classLimit = reflector.get<number | undefined>(THROTTLE_LIMIT_DEFAULT, classRef)
  const classTtl = reflector.get<number | undefined>(THROTTLE_TTL_DEFAULT, classRef)

  return {
    handlerLimit,
    handlerTtl,
    classLimit,
    classTtl,
    effectiveLimit: handlerLimit ?? classLimit,
    effectiveTtl: handlerTtl ?? classTtl,
  }
}

function expectIpProfile(Controller: ControllerClass, method: string, profile: RateLimitProfile) {
  const budget = RATE_LIMIT_POLICY[profile]
  const meta = ipMetadata(handlerOf(Controller, method), Controller)
  expect(meta.effectiveLimit).toBe(budget.limit)
  expect(meta.effectiveTtl).toBe(budget.ttlMs)
}

function expectPublicDefault(Controller: ControllerClass, method: string) {
  const meta = ipMetadata(handlerOf(Controller, method), Controller)
  expect(meta.handlerLimit).toBeUndefined()
  expect(meta.handlerTtl).toBeUndefined()
  expect(meta.classLimit).toBeUndefined()
  expect(meta.classTtl).toBeUndefined()
}

function expectUserProfile(
  Controller: ControllerClass,
  method: string,
  profile: RateLimitProfile | undefined
) {
  expect(
    reflector.getAllAndOverride(UserRateLimit, [handlerOf(Controller, method), Controller])
  ).toBe(profile)
}

function guardList(Controller: ControllerClass, method: string) {
  const classGuards = (Reflect.getMetadata(GUARDS_METADATA, Controller) ?? []) as unknown[]
  const methodGuards = (Reflect.getMetadata(GUARDS_METADATA, handlerOf(Controller, method)) ??
    []) as unknown[]
  return [...classGuards, ...methodGuards]
}

function expectUserRateLimitAfterJwt(Controller: ControllerClass, method: string) {
  const guards = guardList(Controller, method)
  const jwtIndex = guards.indexOf(JwtAuthGuard)
  const userIndex = guards.indexOf(UserRateLimitGuard)
  expect(jwtIndex).toBeGreaterThanOrEqual(0)
  expect(userIndex).toBeGreaterThan(jwtIndex)

  const sensitiveGuards = guards.filter(
    (guard) => guard === JwtAuthGuard || guard === RolesGuard || guard === UserRateLimitGuard
  )
  expect(sensitiveGuards[0]).toBe(JwtAuthGuard)
  expect(sensitiveGuards.at(-1)).toBe(UserRateLimitGuard)
}

test.each([
  ['login', AuthController, 'login'],
  ['googleStart', AuthController, 'googleStart'],
  ['googleCallback', AuthController, 'googleCallback'],
] as const)('auth %s uses the login IP profile', (_name, Controller, method) => {
  expectIpProfile(Controller, method, RATE_LIMIT_PROFILE.LOGIN)
  expectUserProfile(Controller, method, undefined)
})

test.each([
  ['registerUser', AuthController, 'registerUser'],
  ['registerOwner', AuthController, 'registerOwner'],
  ['requestUserRegistration', AuthController, 'requestUserRegistration'],
  ['requestOwnerRegistration', AuthController, 'requestOwnerRegistration'],
  ['forgotPassword', AuthController, 'forgotPassword'],
] as const)('auth %s uses the authSensitive IP profile', (_name, Controller, method) => {
  expectIpProfile(Controller, method, RATE_LIMIT_PROFILE.AUTH_SENSITIVE)
  expectUserProfile(Controller, method, undefined)
})

test.each([
  ['confirmUserRegistration', AuthController, 'confirmUserRegistration'],
  ['confirmOwnerRegistration', AuthController, 'confirmOwnerRegistration'],
  ['resetPassword', AuthController, 'resetPassword'],
] as const)('auth %s uses the authConfirm IP profile', (_name, Controller, method) => {
  expectIpProfile(Controller, method, RATE_LIMIT_PROFILE.AUTH_CONFIRM)
  expectUserProfile(Controller, method, undefined)
})

test('refresh uses the refresh IP profile', () => {
  expectIpProfile(AuthController, 'refresh', RATE_LIMIT_PROFILE.REFRESH)
  expectUserProfile(AuthController, 'refresh', undefined)
})

test('logout stays on the default public IP profile', () => {
  expectPublicDefault(AuthController, 'logout')
  expectUserProfile(AuthController, 'logout', undefined)

  const loginBudget = RATE_LIMIT_POLICY[RATE_LIMIT_PROFILE.LOGIN]
  const sensitiveBudget = RATE_LIMIT_POLICY[RATE_LIMIT_PROFILE.AUTH_SENSITIVE]
  const meta = ipMetadata(handlerOf(AuthController, 'logout'), AuthController)
  expect(meta.effectiveLimit).not.toBe(loginBudget.limit)
  expect(meta.effectiveLimit).not.toBe(sensitiveBudget.limit)
})

test.each([
  ['EventsController.listPublic', EventsController, 'listPublic'],
  ['EventsController.getPublicBySlug', EventsController, 'getPublicBySlug'],
  ['OrganizationsController.getPublicBySlug', OrganizationsController, 'getPublicBySlug'],
] as const)('%s has no Throttle override', (_name, Controller, method) => {
  expectPublicDefault(Controller, method)
  expectUserProfile(Controller, method, undefined)
})

test.each([
  ['EventsController.streamPublishedAvailability', EventsController, 'streamPublishedAvailability'],
  ['OrdersController.stream', OrdersController, 'stream'],
] as const)('%s uses the sse IP profile', (_name, Controller, method) => {
  expectIpProfile(Controller, method, RATE_LIMIT_PROFILE.SSE)
  expectUserProfile(Controller, method, undefined)
  expect(guardList(Controller, method)).not.toContain(UserRateLimitGuard)
})

test('orders.create uses purchase IP and user limits after JWT', () => {
  expectIpProfile(OrdersController, 'create', RATE_LIMIT_PROFILE.PURCHASE)
  expectUserProfile(OrdersController, 'create', RATE_LIMIT_PROFILE.PURCHASE)
  expectUserRateLimitAfterJwt(OrdersController, 'create')
})

test('tickets.issuePurchasedTicketQr uses qr IP and user limits after JWT', () => {
  expectIpProfile(TicketsController, 'issuePurchasedTicketQr', RATE_LIMIT_PROFILE.QR)
  expectUserProfile(TicketsController, 'issuePurchasedTicketQr', RATE_LIMIT_PROFILE.QR)
  expectUserRateLimitAfterJwt(TicketsController, 'issuePurchasedTicketQr')
})

test('tickets.checkInTicket uses checkIn IP and user limits after JWT', () => {
  expectIpProfile(TicketsController, 'checkInTicket', RATE_LIMIT_PROFILE.CHECK_IN)
  expectUserProfile(TicketsController, 'checkInTicket', RATE_LIMIT_PROFILE.CHECK_IN)
  expectUserRateLimitAfterJwt(TicketsController, 'checkInTicket')
})

test('geo.ipLocate uses authenticated IP and geo user limits after JWT', () => {
  expectIpProfile(GeoController, 'ipLocate', RATE_LIMIT_PROFILE.AUTHENTICATED)
  expectUserProfile(GeoController, 'ipLocate', RATE_LIMIT_PROFILE.GEO)
  expectUserRateLimitAfterJwt(GeoController, 'ipLocate')
})

test.each([
  ['SessionController.getMe', SessionController, 'getMe'],
  ['SessionController.list', SessionController, 'list'],
  ['SessionController.revoke', SessionController, 'revoke'],
  ['SettingsController.get', SettingsController, 'get'],
  ['SettingsController.update', SettingsController, 'update'],
  ['StaffController.listMyPersonnel', StaffController, 'listMyPersonnel'],
  ['StaffController.updateStatus', StaffController, 'updateStatus'],
  ['StaffController.delete', StaffController, 'delete'],
  ['LocationsController.listMyLocations', LocationsController, 'listMyLocations'],
  ['LocationsController.create', LocationsController, 'create'],
  ['LocationsController.update', LocationsController, 'update'],
  ['LocationsController.delete', LocationsController, 'delete'],
  ['DashboardController.getKpiDashboard', DashboardController, 'getKpiDashboard'],
  ['DashboardController.listSales', DashboardController, 'listSales'],
  ['DashboardController.getSalesAnalytics', DashboardController, 'getSalesAnalytics'],
  ['UsersController.list', UsersController, 'list'],
  ['UsersController.get', UsersController, 'get'],
  ['UsersController.updateStatus', UsersController, 'updateStatus'],
  ['ErrorsController.list', ErrorsController, 'list'],
  ['ErrorsController.delete', ErrorsController, 'delete'],
  ['TicketTypesController.list', TicketTypesController, 'list'],
  ['TicketTypesController.create', TicketTypesController, 'create'],
  ['InvitationsController.createStaffInvitation', InvitationsController, 'createStaffInvitation'],
  ['InvitationsController.listStaffInvitations', InvitationsController, 'listStaffInvitations'],
  ['InvitationsController.deleteStaffInvitation', InvitationsController, 'deleteStaffInvitation'],
  ['EventsController.listMyEvents', EventsController, 'listMyEvents'],
  ['EventsController.getByDocumentId', EventsController, 'getByDocumentId'],
  ['EventsController.create', EventsController, 'create'],
  ['EventsController.update', EventsController, 'update'],
  ['EventsController.delete', EventsController, 'delete'],
  ['OrdersController.list', OrdersController, 'list'],
  ['OrdersController.get', OrdersController, 'get'],
  ['OrdersController.delete', OrdersController, 'delete'],
  ['TicketsController.listMyTickets', TicketsController, 'listMyTickets'],
  ['TicketsController.listPurchasedTickets', TicketsController, 'listPurchasedTickets'],
  ['TicketsController.listScannedTicketsHistory', TicketsController, 'listScannedTicketsHistory'],
  ['TicketsController.getByDocumentId', TicketsController, 'getByDocumentId'],
  ['TicketsController.create', TicketsController, 'create'],
  ['TicketsController.update', TicketsController, 'update'],
  ['TicketsController.delete', TicketsController, 'delete'],
] as const)(
  '%s uses the authenticated IP profile without a user limiter',
  (_name, Controller, method) => {
    expectIpProfile(Controller, method, RATE_LIMIT_PROFILE.AUTHENTICATED)
    expectUserProfile(Controller, method, undefined)
    expect(guardList(Controller, method)).toContain(JwtAuthGuard)
    expect(guardList(Controller, method)).not.toContain(UserRateLimitGuard)
  }
)

test.each([
  ['acceptStaffInvitation', InvitationsController],
  ['getStaffInvitationByLink', InvitationsController],
] as const)('invitation %s stays on the default public IP profile', (method, Controller) => {
  expectPublicDefault(Controller, method)
  expectUserProfile(Controller, method, undefined)
})
