import { expect, test } from 'vitest'
import { slugSchema } from '../src/common.ts'

test('accepts normalized public slugs and rejects UUIDs or malformed values', () => {
  expect(slugSchema.safeParse('fiesta-de-primavera').success).toBe(true)
  expect(slugSchema.safeParse('cafe-del-sur-2').success).toBe(true)
  expect(slugSchema.safeParse('Fiesta de Primavera').success).toBe(false)
  expect(slugSchema.safeParse('91f445ca-e100-4f75-afed-e1c3a4e340e3').success).toBe(false)
})
