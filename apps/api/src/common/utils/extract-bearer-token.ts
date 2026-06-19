export function extractBearerToken(authorization: string | undefined): string | null {
  if (!authorization) {
    return null
  }

  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return null
  }

  return token
}
