import { Injectable, Logger } from '@nestjs/common'
import type { GeoIpLocateResult } from '@afterdark/types'

const IPQUERY_BASE_URL = 'https://api.ipquery.io'
const USER_AGENT = 'afterdark/1.0 (location; contact=ops@afterdark.local)'

type IpQueryLocationPayload = {
  location?: {
    latitude?: number
    longitude?: number
    city?: string
    state?: string
    country?: string
  }
}

@Injectable()
export class IpQueryLocatorAdapter {
  private readonly logger = new Logger(IpQueryLocatorAdapter.name)

  async locateByIp(ip: string | null): Promise<GeoIpLocateResult> {
    const url = ip
      ? new URL(`${IPQUERY_BASE_URL}/${encodeURIComponent(ip)}`)
      : new URL(`${IPQUERY_BASE_URL}/`)
    url.searchParams.set('format', 'json')

    const payload = (await this.fetchJson(url)) as IpQueryLocationPayload
    const location = payload.location
    const latitude = location?.latitude
    const longitude = location?.longitude

    if (
      !location ||
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error('IpQuery response missing coordinates')
    }

    return {
      latitude,
      longitude,
      city: location.city,
      state: location.state,
      country: location.country,
    }
  }

  private async fetchJson(url: URL): Promise<unknown> {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      this.logger.warn(`IpQuery request failed: ${response.status} ${response.statusText}`)
      throw new Error(`IpQuery HTTP ${response.status}`)
    }

    return response.json()
  }
}
