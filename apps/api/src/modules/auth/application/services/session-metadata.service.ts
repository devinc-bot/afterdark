import { Inject, Injectable } from '@nestjs/common'
import { SESSION_METADATA_FIELD_LIMITS, type SessionMetadata } from '@repo/types'
import { GEO_IP_LOCATOR } from '../../../geo/geo.tokens'
import type { GeoIpLocator } from '../../../geo/geo-ip-locator.port'

function truncate(value: string, maximumLength: number): string {
  return value.slice(0, maximumLength)
}

function getBrowserName(userAgent: string): string {
  if (/Edg\//.test(userAgent)) {
    return 'Microsoft Edge'
  }
  if (/Firefox\//.test(userAgent)) {
    return 'Firefox'
  }
  if (/Chrome\//.test(userAgent)) {
    return 'Chrome'
  }
  if (/Safari\//.test(userAgent)) {
    return 'Safari'
  }
  return 'Unknown browser'
}

function getOperatingSystemName(userAgent: string): string {
  if (/Windows NT/.test(userAgent)) {
    return 'Windows'
  }
  if (/Android/.test(userAgent)) {
    return 'Android'
  }
  if (/(iPhone|iPad|iPod)/.test(userAgent)) {
    return 'iOS'
  }
  if (/Mac OS X/.test(userAgent)) {
    return 'macOS'
  }
  if (/Linux/.test(userAgent)) {
    return 'Linux'
  }
  return 'Unknown OS'
}

function getDeviceLabel(userAgent: string): string {
  return `${getBrowserName(userAgent)} on ${getOperatingSystemName(userAgent)}`
}

export function getSessionLocationLabel({
  city,
  state,
  country,
}: Pick<SessionMetadata, 'city' | 'state' | 'country'>): string | null {
  const values = [city, state, country].filter((value): value is string => Boolean(value))
  return values.length > 0 ? values.join(', ') : null
}

@Injectable()
export class SessionMetadataService {
  constructor(@Inject(GEO_IP_LOCATOR) private readonly geoIpLocator: GeoIpLocator) {}

  async resolve(ipAddress: string | null, rawUserAgent: string | null): Promise<SessionMetadata> {
    const userAgent = rawUserAgent
      ? truncate(rawUserAgent, SESSION_METADATA_FIELD_LIMITS.userAgent)
      : null
    const device = userAgent
      ? truncate(getDeviceLabel(userAgent), SESSION_METADATA_FIELD_LIMITS.device)
      : null

    try {
      const location = await this.geoIpLocator.locateByIp(ipAddress)
      const city = location.city ?? null
      const state = location.state ?? null
      const country = location.country ?? null
      return {
        ipAddress,
        device,
        userAgent,
        locationLabel: getSessionLocationLabel({ city, state, country }),
        city,
        state,
        country,
      }
    } catch {
      return {
        ipAddress,
        device,
        userAgent,
        locationLabel: null,
        city: null,
        state: null,
        country: null,
      }
    }
  }
}
