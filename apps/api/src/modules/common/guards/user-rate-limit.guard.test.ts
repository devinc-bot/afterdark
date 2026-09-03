import 'reflect-metadata'
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { ThrottlerModule } from '@nestjs/throttler'
import { RATE_LIMIT_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { RATE_LIMIT_POLICY } from '../../../config/env.ts'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy.ts'
import { ApiRateLimit } from '../decorators/api-rate-limit.decorator.ts'
import { UserRateLimit } from '../decorators/user-rate-limit.decorator.ts'
import { ApiThrottlerGuard } from './api-throttler.guard.ts'
import { UserRateLimitGuard } from './user-rate-limit.guard.ts'

type HeaderBag = Record<string, string | number>

type FakeResponse = {
  headers: HeaderBag
  header: (name: string, value: string | number) => FakeResponse
}

const USER_PROFILE = RATE_LIMIT_PROFILE.AUTH_SENSITIVE
const USER_BUDGET = RATE_LIMIT_POLICY[USER_PROFILE]
const LOGIN_BUDGET = RATE_LIMIT_POLICY[RATE_LIMIT_PROFILE.LOGIN]
const PUBLIC_BUDGET = RATE_LIMIT_POLICY[RATE_LIMIT_PROFILE.PUBLIC]
const PURCHASE_BUDGET = RATE_LIMIT_POLICY[RATE_LIMIT_PROFILE.PURCHASE]

@Controller()
class UserRateLimitProbeController {
  @Get('purchase')
  @UserRateLimit(USER_PROFILE)
  purchase() {
    return { ok: true }
  }

  @Get('qr')
  @UserRateLimit(USER_PROFILE)
  qr() {
    return { ok: true }
  }

  @Get('open')
  open() {
    return { ok: true }
  }

  @Get('purchase-window')
  @UserRateLimit(RATE_LIMIT_PROFILE.PURCHASE)
  purchaseWindow() {
    return { ok: true }
  }
}

@Controller()
class ApiRateLimitProbeController {
  @Get('login')
  @ApiRateLimit(RATE_LIMIT_PROFILE.LOGIN)
  login() {
    return { ok: true }
  }
}

function createResponse(): FakeResponse {
  const headers: HeaderBag = {}
  return {
    headers,
    header(name: string, value: string | number) {
      this.headers[name] = value
      return this
    },
  }
}

function createUserContext(input: {
  user?: { sub?: string } | null
  handler?: (...args: never[]) => unknown
  classRef?: new (...args: never[]) => unknown
  response?: FakeResponse
}): ExecutionContext {
  const request = {
    user: 'user' in input ? (input.user ?? undefined) : { sub: 'user-a' },
  }
  const response = input.response ?? createResponse()
  const handler = input.handler ?? UserRateLimitProbeController.prototype.purchase
  const classRef = input.classRef ?? UserRateLimitProbeController

  return {
    getHandler: () => handler,
    getClass: () => classRef,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext
}

function createIpContext(input: {
  ip: string
  handler?: (...args: never[]) => unknown
  classRef?: new (...args: never[]) => unknown
  response?: FakeResponse
}): ExecutionContext {
  const request = { ip: input.ip, headers: {} }
  const response = input.response ?? createResponse()
  const handler = input.handler ?? ApiRateLimitProbeController.prototype.login
  const classRef = input.classRef ?? ApiRateLimitProbeController

  return {
    getHandler: () => handler,
    getClass: () => classRef,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext
}

async function createUserGuard() {
  const translateError = vi.fn((code: string) => code)
  const verifyAsync = vi.fn()
  const verify = vi.fn()
  const module = await Test.createTestingModule({
    imports: [
      ThrottlerModule.forRoot([
        {
          name: 'default',
          limit: PUBLIC_BUDGET.limit,
          ttl: PUBLIC_BUDGET.ttlMs,
        },
      ]),
    ],
    providers: [
      UserRateLimitGuard,
      Reflector,
      {
        provide: TranslationService,
        useValue: { translateError },
      },
      {
        provide: JwtService,
        useValue: { verifyAsync, verify },
      },
    ],
  }).compile()

  await module.init()
  return {
    module,
    guard: module.get(UserRateLimitGuard),
    translateError,
    jwtService: module.get(JwtService) as {
      verifyAsync: ReturnType<typeof vi.fn>
      verify: ReturnType<typeof vi.fn>
    },
  }
}

async function createIpGuard(options: { limit: number; ttl: number }) {
  const translateError = vi.fn((code: string) => code)
  const module = await Test.createTestingModule({
    imports: [
      ThrottlerModule.forRoot([
        {
          name: 'default',
          limit: options.limit,
          ttl: options.ttl,
        },
      ]),
    ],
    providers: [
      ApiThrottlerGuard,
      {
        provide: TranslationService,
        useValue: { translateError },
      },
    ],
  }).compile()

  await module.init()
  return {
    module,
    guard: module.get(ApiThrottlerGuard),
  }
}

let closeModule: (() => Promise<void>) | undefined

beforeEach(() => {
  closeModule = undefined
})

afterEach(async () => {
  vi.useRealTimers()
  if (closeModule) {
    await closeModule()
    closeModule = undefined
  }
})

test('tracks by user.sub so two users are isolated on the same handler', async () => {
  const { module, guard } = await createUserGuard()
  closeModule = () => module.close()

  const responseA = createResponse()
  const responseB = createResponse()

  for (let attempt = 0; attempt < USER_BUDGET.limit; attempt += 1) {
    await expect(
      guard.canActivate(
        createUserContext({
          user: { sub: 'user-a' },
          handler: UserRateLimitProbeController.prototype.purchase,
          response: responseA,
        })
      )
    ).resolves.toBe(true)
  }

  await expect(
    guard.canActivate(
      createUserContext({
        user: { sub: 'user-a' },
        handler: UserRateLimitProbeController.prototype.purchase,
        response: responseA,
      })
    )
  ).rejects.toBeInstanceOf(HttpException)

  await expect(
    guard.canActivate(
      createUserContext({
        user: { sub: 'user-b' },
        handler: UserRateLimitProbeController.prototype.purchase,
        response: responseB,
      })
    )
  ).resolves.toBe(true)
})

test('isolates counters by handler for the same user.sub', async () => {
  const { module, guard } = await createUserGuard()
  closeModule = () => module.close()

  const purchaseResponse = createResponse()
  const qrResponse = createResponse()

  for (let attempt = 0; attempt < USER_BUDGET.limit; attempt += 1) {
    await expect(
      guard.canActivate(
        createUserContext({
          user: { sub: 'user-shared' },
          handler: UserRateLimitProbeController.prototype.purchase,
          response: purchaseResponse,
        })
      )
    ).resolves.toBe(true)
  }

  await expect(
    guard.canActivate(
      createUserContext({
        user: { sub: 'user-shared' },
        handler: UserRateLimitProbeController.prototype.purchase,
        response: purchaseResponse,
      })
    )
  ).rejects.toBeInstanceOf(HttpException)

  await expect(
    guard.canActivate(
      createUserContext({
        user: { sub: 'user-shared' },
        handler: UserRateLimitProbeController.prototype.qr,
        response: qrResponse,
      })
    )
  ).resolves.toBe(true)
})

test('missing or empty user.sub allows without consuming the user budget', async () => {
  const { module, guard } = await createUserGuard()
  closeModule = () => module.close()

  for (let attempt = 0; attempt < USER_BUDGET.limit + 2; attempt += 1) {
    await expect(
      guard.canActivate(
        createUserContext({
          user: undefined,
          handler: UserRateLimitProbeController.prototype.purchase,
          response: createResponse(),
        })
      )
    ).resolves.toBe(true)

    await expect(
      guard.canActivate(
        createUserContext({
          user: { sub: '' },
          handler: UserRateLimitProbeController.prototype.purchase,
          response: createResponse(),
        })
      )
    ).resolves.toBe(true)
  }

  for (let attempt = 0; attempt < USER_BUDGET.limit; attempt += 1) {
    await expect(
      guard.canActivate(
        createUserContext({
          user: { sub: 'user-after-missing' },
          handler: UserRateLimitProbeController.prototype.purchase,
          response: createResponse(),
        })
      )
    ).resolves.toBe(true)
  }

  await expect(
    guard.canActivate(
      createUserContext({
        user: { sub: 'user-after-missing' },
        handler: UserRateLimitProbeController.prototype.purchase,
        response: createResponse(),
      })
    )
  ).rejects.toBeInstanceOf(HttpException)
})

test('allows when @UserRateLimit metadata is absent', async () => {
  const { module, guard } = await createUserGuard()
  closeModule = () => module.close()

  for (let attempt = 0; attempt < USER_BUDGET.limit + 3; attempt += 1) {
    await expect(
      guard.canActivate(
        createUserContext({
          user: { sub: 'user-open' },
          handler: UserRateLimitProbeController.prototype.open,
          response: createResponse(),
        })
      )
    ).resolves.toBe(true)
  }
})

test('never calls JwtService verify or verifyAsync', async () => {
  const { module, guard, jwtService } = await createUserGuard()
  closeModule = () => module.close()

  await expect(
    guard.canActivate(
      createUserContext({
        user: { sub: 'user-jwt' },
        handler: UserRateLimitProbeController.prototype.purchase,
        response: createResponse(),
      })
    )
  ).resolves.toBe(true)

  await expect(
    guard.canActivate(
      createUserContext({
        user: undefined,
        handler: UserRateLimitProbeController.prototype.purchase,
        response: createResponse(),
      })
    )
  ).resolves.toBe(true)

  expect(jwtService.verifyAsync).not.toHaveBeenCalled()
  expect(jwtService.verify).not.toHaveBeenCalled()
})

test('rejects exhausted user budgets with 429 unsuffixed headers and localized message', async () => {
  const { module, guard, translateError, jwtService } = await createUserGuard()
  closeModule = () => module.close()

  const allowedResponse = createResponse()
  for (let attempt = 0; attempt < USER_BUDGET.limit; attempt += 1) {
    await expect(
      guard.canActivate(
        createUserContext({
          user: { sub: 'user-exhaust' },
          handler: UserRateLimitProbeController.prototype.purchase,
          response: allowedResponse,
        })
      )
    ).resolves.toBe(true)
  }

  const blockedResponse = createResponse()
  let caught: unknown
  try {
    await guard.canActivate(
      createUserContext({
        user: { sub: 'user-exhaust' },
        handler: UserRateLimitProbeController.prototype.purchase,
        response: blockedResponse,
      })
    )
  } catch (error) {
    caught = error
  }

  expect(caught).toBeInstanceOf(HttpException)
  const exception = caught as HttpException
  expect(exception.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS)
  expect(exception.message).toBe(RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS)
  expect(translateError).toHaveBeenCalledWith(RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS)
  expect(blockedResponse.headers['Retry-After']).toEqual(expect.any(Number))
  expect(blockedResponse.headers['X-RateLimit-Limit']).toBe(USER_BUDGET.limit)
  expect(blockedResponse.headers['X-RateLimit-Remaining']).toBe(0)
  expect(blockedResponse.headers['X-RateLimit-Reset']).toEqual(expect.any(Number))
  expect(blockedResponse.headers['Retry-After-default']).toBeUndefined()
  expect(blockedResponse.headers['X-RateLimit-Limit-default']).toBeUndefined()
  expect(blockedResponse.headers['X-RateLimit-Remaining-default']).toBeUndefined()
  expect(blockedResponse.headers['X-RateLimit-Reset-default']).toBeUndefined()
  expect(jwtService.verifyAsync).not.toHaveBeenCalled()
  expect(jwtService.verify).not.toHaveBeenCalled()
})

test('restores user budget after the window expires', async () => {
  vi.useFakeTimers()
  const { module, guard } = await createUserGuard()
  closeModule = () => module.close()

  const response = createResponse()
  for (let attempt = 0; attempt < PURCHASE_BUDGET.limit; attempt += 1) {
    await expect(
      guard.canActivate(
        createUserContext({
          user: { sub: 'user-window' },
          handler: UserRateLimitProbeController.prototype.purchaseWindow,
          response,
        })
      )
    ).resolves.toBe(true)
  }

  await expect(
    guard.canActivate(
      createUserContext({
        user: { sub: 'user-window' },
        handler: UserRateLimitProbeController.prototype.purchaseWindow,
        response,
      })
    )
  ).rejects.toBeInstanceOf(HttpException)

  await vi.advanceTimersByTimeAsync(PURCHASE_BUDGET.ttlMs + 1)

  await expect(
    guard.canActivate(
      createUserContext({
        user: { sub: 'user-window' },
        handler: UserRateLimitProbeController.prototype.purchaseWindow,
        response: createResponse(),
      })
    )
  ).resolves.toBe(true)
})

test('@ApiRateLimit overrides the IP-layer profile for ApiThrottlerGuard', async () => {
  const { module, guard } = await createIpGuard({
    limit: PUBLIC_BUDGET.limit,
    ttl: PUBLIC_BUDGET.ttlMs,
  })
  closeModule = () => module.close()

  const response = createResponse()
  await expect(
    guard.canActivate(
      createIpContext({
        ip: '203.0.113.80',
        handler: ApiRateLimitProbeController.prototype.login,
        classRef: ApiRateLimitProbeController,
        response,
      })
    )
  ).resolves.toBe(true)

  expect(response.headers['X-RateLimit-Limit']).toBe(LOGIN_BUDGET.limit)
  expect(response.headers['X-RateLimit-Remaining']).toBe(LOGIN_BUDGET.limit - 1)
  expect(response.headers['X-RateLimit-Limit']).not.toBe(PUBLIC_BUDGET.limit)

  for (let attempt = 1; attempt < LOGIN_BUDGET.limit; attempt += 1) {
    await expect(
      guard.canActivate(
        createIpContext({
          ip: '203.0.113.80',
          handler: ApiRateLimitProbeController.prototype.login,
          classRef: ApiRateLimitProbeController,
          response: createResponse(),
        })
      )
    ).resolves.toBe(true)
  }

  await expect(
    guard.canActivate(
      createIpContext({
        ip: '203.0.113.80',
        handler: ApiRateLimitProbeController.prototype.login,
        classRef: ApiRateLimitProbeController,
        response: createResponse(),
      })
    )
  ).rejects.toBeInstanceOf(HttpException)
})

test('user and IP layers keep independent counters in shared storage', async () => {
  const translateError = vi.fn((code: string) => code)
  const module = await Test.createTestingModule({
    imports: [
      ThrottlerModule.forRoot([
        {
          name: 'default',
          limit: PUBLIC_BUDGET.limit,
          ttl: PUBLIC_BUDGET.ttlMs,
        },
      ]),
    ],
    providers: [
      UserRateLimitGuard,
      ApiThrottlerGuard,
      Reflector,
      {
        provide: TranslationService,
        useValue: { translateError },
      },
    ],
  }).compile()
  await module.init()
  closeModule = () => module.close()

  const userGuard = module.get(UserRateLimitGuard)
  const ipGuard = module.get(ApiThrottlerGuard)
  const ip = '203.0.113.90'
  const sub = 'user-cross-layer'

  for (let attempt = 0; attempt < USER_BUDGET.limit; attempt += 1) {
    await expect(
      userGuard.canActivate(
        createUserContext({
          user: { sub },
          handler: UserRateLimitProbeController.prototype.purchase,
          response: createResponse(),
        })
      )
    ).resolves.toBe(true)
  }

  await expect(
    userGuard.canActivate(
      createUserContext({
        user: { sub },
        handler: UserRateLimitProbeController.prototype.purchase,
        response: createResponse(),
      })
    )
  ).rejects.toBeInstanceOf(HttpException)

  await expect(
    ipGuard.canActivate(
      createIpContext({
        ip,
        handler: ApiRateLimitProbeController.prototype.login,
        classRef: ApiRateLimitProbeController,
        response: createResponse(),
      })
    )
  ).resolves.toBe(true)
})
