import { expect, test } from 'vitest'
import { allocateSlug, normalizeSlug } from './slug.ts'

test('normalizes names into URL-safe slugs', () => {
  expect(normalizeSlug('  Café del Sur!!  ')).toBe('cafe-del-sur')
  expect(normalizeSlug('---')).toBe('item')
})

test('allocates incremental suffixes and excludes the current entity slug', () => {
  expect(allocateSlug('Café del Sur', ['cafe-del-sur'])).toBe('cafe-del-sur-2')
  expect(allocateSlug('Café del Sur', ['cafe-del-sur', 'cafe-del-sur-2'])).toBe('cafe-del-sur-3')
  expect(allocateSlug('Café del Sur', [])).toBe('cafe-del-sur')
})
