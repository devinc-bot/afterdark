import assert from 'node:assert/strict'
import test from 'node:test'
import { slugSchema } from '../src/common.ts'

test('accepts normalized public slugs and rejects UUIDs or malformed values', () => {
  assert.equal(slugSchema.safeParse('fiesta-de-primavera').success, true)
  assert.equal(slugSchema.safeParse('cafe-del-sur-2').success, true)
  assert.equal(slugSchema.safeParse('Fiesta de Primavera').success, false)
  assert.equal(slugSchema.safeParse('91f445ca-e100-4f75-afed-e1c3a4e340e3').success, false)
})
