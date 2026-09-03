import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { HttpException, HttpStatus } from '@nestjs/common'
import { GEO_ERROR_CODE } from '@repo/i18n'
import type { GeoIpLocateResult } from '@repo/types'
import { expect, test, vi } from 'vitest'
import { LocateByIpUseCase } from './locate-by-ip.use-case.ts'

const LOCATED: GeoIpLocateResult = {
  latitude: -34.6037,
  longitude: -58.3816,
  city: 'Buenos Aires',
  country: 'AR',
}

function geoRateLimitServiceRemoved() {
  const relativePath = join(
    'src',
    'modules',
    'geo',
    'application',
    'services',
    'geo-rate-limit.service.ts'
  )

  return [
    join(process.cwd(), relativePath),
    join(process.cwd(), 'apps', 'api', relativePath),
  ].every((candidate) => !existsSync(candidate))
}

test('GeoRateLimitService file is removed', () => {
  expect(geoRateLimitServiceRemoved()).toBe(true)
})

test('locate-by-ip still calls the locator and does not 429 from an in-use-case limiter', async () => {
  const locateByIp = vi.fn().mockResolvedValue(LOCATED)
  const translateError = vi.fn((code: string) => code)
  const useCase = new LocateByIpUseCase({ locateByIp } as never, { translateError } as never)

  const accountDocumentId = 'owner-document-id'
  const clientIp = '203.0.113.40'

  for (let attempt = 0; attempt < 40; attempt += 1) {
    await expect(useCase.execute(accountDocumentId, clientIp)).resolves.toEqual(LOCATED)
  }

  expect(locateByIp).toHaveBeenCalledTimes(40)
  expect(locateByIp).toHaveBeenCalledWith(clientIp)
  expect(translateError).not.toHaveBeenCalledWith(GEO_ERROR_CODE.RATE_LIMITED)
})

test('maps locator failures to the provider error without a rate-limit 429', async () => {
  const locateByIp = vi.fn().mockRejectedValue(new Error('provider down'))
  const translateError = vi.fn((code: string) => code)
  const useCase = new LocateByIpUseCase({ locateByIp } as never, { translateError } as never)

  let caught: unknown
  try {
    await useCase.execute('owner-document-id', '203.0.113.41')
  } catch (error) {
    caught = error
  }

  expect(caught).toBeInstanceOf(HttpException)
  const exception = caught as HttpException
  expect(exception.getStatus()).toBe(HttpStatus.BAD_GATEWAY)
  expect(exception.message).toBe(GEO_ERROR_CODE.PROVIDER_FAILED)
  expect(translateError).toHaveBeenCalledWith(GEO_ERROR_CODE.PROVIDER_FAILED)
  expect(translateError).not.toHaveBeenCalledWith(GEO_ERROR_CODE.RATE_LIMITED)
})
