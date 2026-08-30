import { expect, test } from 'vitest'

test('vitest runs a minimal node test', () => {
  expect(typeof globalThis.process).toBe('object')
  expect(process.env.NODE_ENV).toBe('test')
})
