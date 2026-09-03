import type { GeoIpLocateResult } from '@repo/types'

export interface GeoIpLocator {
  locateByIp(ip: string | null): Promise<GeoIpLocateResult>
}
