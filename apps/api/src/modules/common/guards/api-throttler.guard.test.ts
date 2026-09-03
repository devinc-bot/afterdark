import 'reflect-metadata'
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { SkipThrottle, ThrottlerModule } from '@nestjs/throttler'
import { RATE_LIMIT_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { RATE_LIMIT_POLICY } from '../../../config/env.ts'
import { RATE_LIMIT_PROFILE } from '../../../config/rate-limit.policy.ts'
import { HealthController } from '../../health/presentation/health.controller.ts'
import { MercadoPagoController } from '../../mercado-pago/presentation/mercado-pago.controller.ts'
import { ApiThrottlerGuard } from './api-throttler.guard.ts'

type HeaderBag = Record<string, string | number>

type FakeResponse = {
  headers: HeaderBag
  header: (name: string, value: string | number) => FakeResponse
}

@Controller()
class CatalogProbeController {
  @Get('list')
  list() {
    return { ok: true }
  }

  @Get('detail')
  detail() {
    return { ok: true }
  }
}

@Controller()
@SkipThrottle()
class SkippedProbeController {
  @Get()
  ping() {
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

function createContext(input: {
  ip?: string
  headers?: Record<string, string>
  handler?: (...args: never[]) => unknown
  classRef?: new (...args: never[]) => unknown
  response?: FakeResponse
}): ExecutionContext {
  const request = {
    ip: input.ip,
    headers: input.headers ?? {},
  }
  const response = input.response ?? createResponse()
  const handler = input.handler ?? CatalogProbeController.prototype.list
  const classRef = input.classRef ?? CatalogProbeController

  return {
    getHandler: () => handler,
    getClass: () => classRef,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext
}

async function createGuard(options: { limit: number; ttl: number }) {
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
    translateError,
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

test('tracks clients by request.ip and ignores X-Forwarded-For', async () => {
  const { module, guard } = await createGuard({ limit: 2, ttl: 60_000 })
  closeModule = () => module.close()

  const sharedIp = '203.0.113.10'
  const response = createResponse()

  await expect(
    guard.canActivate(
      createContext({
        ip: sharedIp,
        headers: { 'x-forwarded-for': '198.51.100.1' },
        response,
      })
    )
  ).resolves.toBe(true)
  await expect(
    guard.canActivate(
      createContext({
        ip: sharedIp,
        headers: { 'x-forwarded-for': '198.51.100.2' },
        response,
      })
    )
  ).resolves.toBe(true)

  await expect(
    guard.canActivate(
      createContext({
        ip: sharedIp,
        headers: { 'x-forwarded-for': '198.51.100.3' },
        response,
      })
    )
  ).rejects.toBeInstanceOf(HttpException)

  await expect(
    guard.canActivate(
      createContext({
        ip: '198.51.100.1',
        headers: { 'x-forwarded-for': sharedIp },
        response: createResponse(),
      })
    )
  ).resolves.toBe(true)
})

test('isolates counters by handler for the same tracker key', async () => {
  const { module, guard } = await createGuard({ limit: 2, ttl: 60_000 })
  closeModule = () => module.close()

  const ip = '203.0.113.20'
  const listResponse = createResponse()
  const detailResponse = createResponse()

  await expect(
    guard.canActivate(
      createContext({
        ip,
        handler: CatalogProbeController.prototype.list,
        classRef: CatalogProbeController,
        response: listResponse,
      })
    )
  ).resolves.toBe(true)
  await expect(
    guard.canActivate(
      createContext({
        ip,
        handler: CatalogProbeController.prototype.list,
        classRef: CatalogProbeController,
        response: listResponse,
      })
    )
  ).resolves.toBe(true)
  await expect(
    guard.canActivate(
      createContext({
        ip,
        handler: CatalogProbeController.prototype.list,
        classRef: CatalogProbeController,
        response: listResponse,
      })
    )
  ).rejects.toBeInstanceOf(HttpException)

  await expect(
    guard.canActivate(
      createContext({
        ip,
        handler: CatalogProbeController.prototype.detail,
        classRef: CatalogProbeController,
        response: detailResponse,
      })
    )
  ).resolves.toBe(true)
})

test('restores budget after the window expires', async () => {
  vi.useFakeTimers()
  const ttl = 1_000
  const { module, guard } = await createGuard({ limit: 1, ttl })
  closeModule = () => module.close()

  const ip = '203.0.113.30'
  const response = createResponse()

  await expect(guard.canActivate(createContext({ ip, response }))).resolves.toBe(true)
  await expect(guard.canActivate(createContext({ ip, response }))).rejects.toBeInstanceOf(
    HttpException
  )

  await vi.advanceTimersByTimeAsync(ttl + 1)

  await expect(guard.canActivate(createContext({ ip, response: createResponse() }))).resolves.toBe(
    true
  )
})

test('rejects exhausted budgets with 429 headers and localized message', async () => {
  const { module, guard, translateError } = await createGuard({ limit: 1, ttl: 60_000 })
  closeModule = () => module.close()

  const ip = '203.0.113.40'
  const allowedResponse = createResponse()
  await expect(guard.canActivate(createContext({ ip, response: allowedResponse }))).resolves.toBe(
    true
  )
  expect(allowedResponse.headers['X-RateLimit-Limit']).toBe(1)
  expect(allowedResponse.headers['X-RateLimit-Remaining']).toBe(0)
  expect(allowedResponse.headers['X-RateLimit-Reset']).toEqual(expect.any(Number))
  expect(allowedResponse.headers['X-RateLimit-Limit-default']).toBeUndefined()

  const blockedResponse = createResponse()
  let caught: unknown
  try {
    await guard.canActivate(createContext({ ip, response: blockedResponse }))
  } catch (error) {
    caught = error
  }

  expect(caught).toBeInstanceOf(HttpException)
  const exception = caught as HttpException
  expect(exception.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS)
  expect(exception.message).toBe(RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS)
  expect(translateError).toHaveBeenCalledWith(RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS)
  expect(blockedResponse.headers['Retry-After']).toEqual(expect.any(Number))
  expect(blockedResponse.headers['X-RateLimit-Limit']).toBe(1)
  expect(blockedResponse.headers['X-RateLimit-Remaining']).toBe(0)
  expect(blockedResponse.headers['X-RateLimit-Reset']).toEqual(expect.any(Number))
  expect(blockedResponse.headers['Retry-After-default']).toBeUndefined()
  expect(blockedResponse.headers['X-RateLimit-Limit-default']).toBeUndefined()
})

test('uses the public profile budget from RATE_LIMIT_POLICY by default', async () => {
  const publicBudget = RATE_LIMIT_POLICY[RATE_LIMIT_PROFILE.PUBLIC]
  const { module, guard } = await createGuard({
    limit: publicBudget.limit,
    ttl: publicBudget.ttlMs,
  })
  closeModule = () => module.close()

  const response = createResponse()
  await expect(guard.canActivate(createContext({ ip: '203.0.113.50', response }))).resolves.toBe(
    true
  )

  expect(response.headers['X-RateLimit-Limit']).toBe(publicBudget.limit)
  expect(response.headers['X-RateLimit-Remaining']).toBe(publicBudget.limit - 1)
})

test('fails closed when request.ip is missing and does not fall back to X-Forwarded-For', async () => {
  const { module, guard, translateError } = await createGuard({ limit: 2, ttl: 60_000 })
  closeModule = () => module.close()

  let caught: unknown
  try {
    await guard.canActivate(
      createContext({
        ip: undefined,
        headers: { 'x-forwarded-for': '198.51.100.9' },
        response: createResponse(),
      })
    )
  } catch (error) {
    caught = error
  }

  expect(caught).toBeInstanceOf(HttpException)
  const exception = caught as HttpException
  expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST)
  expect(exception.message).toBe(RATE_LIMIT_ERROR_CODE.CLIENT_IP_REQUIRED)
  expect(translateError).toHaveBeenCalledWith(RATE_LIMIT_ERROR_CODE.CLIENT_IP_REQUIRED)

  await expect(
    guard.canActivate(
      createContext({
        ip: '',
        headers: { 'x-forwarded-for': '198.51.100.9' },
        response: createResponse(),
      })
    )
  ).rejects.toBeInstanceOf(HttpException)

  await expect(
    guard.canActivate(
      createContext({
        ip: '198.51.100.9',
        response: createResponse(),
      })
    )
  ).resolves.toBe(true)
})

test('honors SkipThrottle metadata on a probe controller', async () => {
  const { module, guard } = await createGuard({ limit: 1, ttl: 60_000 })
  closeModule = () => module.close()

  const ip = '203.0.113.60'
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(
      guard.canActivate(
        createContext({
          ip,
          handler: SkippedProbeController.prototype.ping,
          classRef: SkippedProbeController,
          response: createResponse(),
        })
      )
    ).resolves.toBe(true)
  }
})

test('skips HealthController.check once SkipThrottle is applied', async () => {
  const { module, guard } = await createGuard({ limit: 1, ttl: 60_000 })
  closeModule = () => module.close()

  const ip = '203.0.113.71'
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(
      guard.canActivate(
        createContext({
          ip,
          handler: HealthController.prototype.check,
          classRef: HealthController,
          response: createResponse(),
        })
      )
    ).resolves.toBe(true)
  }
})

test('skips HealthController.ready once SkipThrottle is applied', async () => {
  const { module, guard } = await createGuard({ limit: 1, ttl: 60_000 })
  closeModule = () => module.close()

  const ip = '203.0.113.72'
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(
      guard.canActivate(
        createContext({
          ip,
          handler: HealthController.prototype.ready,
          classRef: HealthController,
          response: createResponse(),
        })
      )
    ).resolves.toBe(true)
  }
})

test('skips MercadoPagoController.webhook once SkipThrottle is applied', async () => {
  const { module, guard } = await createGuard({ limit: 1, ttl: 60_000 })
  closeModule = () => module.close()

  const ip = '203.0.113.73'
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(
      guard.canActivate(
        createContext({
          ip,
          handler: MercadoPagoController.prototype.webhook,
          classRef: MercadoPagoController,
          response: createResponse(),
        })
      )
    ).resolves.toBe(true)
  }
})
