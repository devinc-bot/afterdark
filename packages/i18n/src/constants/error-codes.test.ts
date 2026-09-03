import { expect, test } from 'vitest'
import { AUTH_ERROR_CODE, RATE_LIMIT_ERROR_CODE } from './error-codes.ts'
import enErrors from '../locales/errors/en.json' with { type: 'json' }
import esErrors from '../locales/errors/es.json' with { type: 'json' }

function nestedCopy(locale: unknown, code: string): unknown {
  return code.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[part]
  }, locale)
}

test('exposes the generic HTTP 429 code for in-memory throttling', () => {
  expect(RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS).toBe('rateLimit.TOO_MANY_REQUESTS')
})

test('exposes the fail-closed client IP code', () => {
  expect(RATE_LIMIT_ERROR_CODE.CLIENT_IP_REQUIRED).toBe('rateLimit.CLIENT_IP_REQUIRED')
})

test('keeps daily auth 429 codes on their existing domain keys', () => {
  expect(AUTH_ERROR_CODE.USER_REGISTRATION_RATE_LIMITED).toBe('auth.USER_REGISTRATION_RATE_LIMITED')
  expect(AUTH_ERROR_CODE.PASSWORD_RESET_RATE_LIMITED).toBe('auth.PASSWORD_RESET_RATE_LIMITED')
})

test('localizes the generic 429 copy in Spanish and English', () => {
  expect(nestedCopy(esErrors, 'rateLimit.TOO_MANY_REQUESTS')).toBe(
    'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.'
  )
  expect(nestedCopy(enErrors, 'rateLimit.TOO_MANY_REQUESTS')).toBe(
    'Too many requests. Please wait a moment and try again.'
  )
})

test('localizes the fail-closed client IP copy in Spanish and English', () => {
  expect(nestedCopy(esErrors, 'rateLimit.CLIENT_IP_REQUIRED')).toBe(
    'No pudimos identificar tu dirección IP.'
  )
  expect(nestedCopy(enErrors, 'rateLimit.CLIENT_IP_REQUIRED')).toBe(
    'We could not determine your client IP address.'
  )
})
