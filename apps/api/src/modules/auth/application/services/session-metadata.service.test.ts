import { describe, expect, test, vi } from 'vitest'
import type { GeoIpLocator } from '../../../geo/geo-ip-locator.port.ts'
import { getSessionLocationLabel, SessionMetadataService } from './session-metadata.service.ts'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'

describe('SessionMetadataService', () => {
  test('returns bounded device metadata and available geographic fields', async () => {
    const locator: GeoIpLocator = {
      locateByIp: vi.fn().mockResolvedValue({
        latitude: -34.6037,
        longitude: -58.3816,
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        country: 'Argentina',
      }),
    }
    const service = new SessionMetadataService(locator)

    await expect(
      service.resolve('203.0.113.1', `${USER_AGENT}${'x'.repeat(600)}`)
    ).resolves.toEqual({
      ipAddress: '203.0.113.1',
      device: 'Chrome on Windows',
      userAgent: `${USER_AGENT}${'x'.repeat(600)}`.slice(0, 512),
      locationLabel: 'Buenos Aires, Buenos Aires, Argentina',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      country: 'Argentina',
    })
  })

  test('keeps geographic metadata nullable when the provider fails', async () => {
    const locator: GeoIpLocator = {
      locateByIp: vi.fn().mockRejectedValue(new Error('Provider unavailable')),
    }
    const service = new SessionMetadataService(locator)

    await expect(service.resolve('203.0.113.1', null)).resolves.toEqual({
      ipAddress: '203.0.113.1',
      device: null,
      userAgent: null,
      locationLabel: null,
      city: null,
      state: null,
      country: null,
    })
  })

  test('derives a location label from available geographic values without persisting it', () => {
    expect(
      getSessionLocationLabel({ city: null, state: 'Buenos Aires', country: 'Argentina' })
    ).toBe('Buenos Aires, Argentina')
  })
})
