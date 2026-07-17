import { Injectable } from '@nestjs/common'

type Bucket = {
  count: number
  resetAt: number
}

@Injectable()
export class GeoRateLimitService {
  private readonly windowMs = 60_000
  private readonly maxRequests = 30
  private readonly buckets = new Map<string, Bucket>()

  consume(key: string): boolean {
    const now = Date.now()
    const current = this.buckets.get(key)

    if (!current || current.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }

    if (current.count >= this.maxRequests) {
      return false
    }

    current.count += 1
    return true
  }
}
