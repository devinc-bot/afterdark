import type { Request } from 'express'

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
]

function normalizeIp(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith('::ffff:')) {
    return trimmed.slice('::ffff:'.length)
  }
  return trimmed
}

function isPrivateOrLocalIp(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip))
}

/**
 * Returns a public client IP when available.
 * When the request is from localhost/private network (typical in local devops),
 * returns null so the provider can resolve the egress IP instead.
 */
export function resolvePublicClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for']
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded
  const candidate =
    (typeof forwardedValue === 'string' ? forwardedValue.split(',')[0] : undefined) ??
    req.ip ??
    req.socket.remoteAddress

  if (!candidate) {
    return null
  }

  const ip = normalizeIp(candidate)
  if (!ip || isPrivateOrLocalIp(ip)) {
    return null
  }

  return ip
}
