import { describe, expect, test } from 'vitest'
import { forwardApiSetCookieHeaders } from '../src/lib/auth-response-headers.ts'

const ACCESS_TOKEN = 'access-token'
const REFRESH_TOKEN = 'refresh-token-secret'

function createApiHeaders(): Headers {
  return new Headers([
    ['Content-Type', 'application/json'],
    ['X-Request-Id', 'request-123'],
    ['Set-Cookie', `access_token=${ACCESS_TOKEN}; Path=/; HttpOnly; SameSite=Lax`],
    ['Set-Cookie', `refresh_token=${REFRESH_TOKEN}; Path=/; HttpOnly; SameSite=Strict`],
  ])
}

function createAuthResponse() {
  return {
    data: { accessToken: ACCESS_TOKEN },
    headers: createApiHeaders(),
  }
}

describe('forwardApiSetCookieHeaders', () => {
  test('appends every API cookie without forwarding non-cookie headers', () => {
    const serverFunctionHeaders = new Headers({ 'X-Server-Function': 'auth' })

    forwardApiSetCookieHeaders(createAuthResponse(), serverFunctionHeaders)

    expect(serverFunctionHeaders.getSetCookie()).toEqual([
      `access_token=${ACCESS_TOKEN}; Path=/; HttpOnly; SameSite=Lax`,
      `refresh_token=${REFRESH_TOKEN}; Path=/; HttpOnly; SameSite=Strict`,
    ])
    expect(serverFunctionHeaders.get('Content-Type')).toBeNull()
    expect(serverFunctionHeaders.get('X-Request-Id')).toBeNull()
    expect(serverFunctionHeaders.get('X-Server-Function')).toBe('auth')
  })

  test('returns the API body without exposing the refresh cookie credential', () => {
    const serverFunctionHeaders = new Headers()

    const loginBody = forwardApiSetCookieHeaders(createAuthResponse(), serverFunctionHeaders)

    expect(loginBody).toEqual({ accessToken: ACCESS_TOKEN })
    expect(loginBody).not.toHaveProperty('refreshToken')
    expect(serverFunctionHeaders.getSetCookie()).toContain(
      `refresh_token=${REFRESH_TOKEN}; Path=/; HttpOnly; SameSite=Strict`
    )
  })

  test('leaves browser-facing headers unchanged when the API did not set cookies', () => {
    const serverFunctionHeaders = new Headers({ 'X-Server-Function': 'auth' })
    const apiHeaders = new Headers({ 'X-Request-Id': 'request-123' })

    forwardApiSetCookieHeaders({ data: undefined, headers: apiHeaders }, serverFunctionHeaders)

    expect(serverFunctionHeaders.getSetCookie()).toEqual([])
    expect(serverFunctionHeaders.get('X-Server-Function')).toBe('auth')
  })
})
