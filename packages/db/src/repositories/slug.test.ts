import assert from 'node:assert/strict'
import test from 'node:test'
import { allocateSlug, normalizeSlug } from './slug.ts'

test('normalizes names into URL-safe slugs', () => {
  assert.equal(normalizeSlug('  Café del Sur!!  '), 'cafe-del-sur')
  assert.equal(normalizeSlug('---'), 'item')
})

test('allocates incremental suffixes and excludes the current entity slug', () => {
  assert.equal(allocateSlug('Café del Sur', ['cafe-del-sur']), 'cafe-del-sur-2')
  assert.equal(allocateSlug('Café del Sur', ['cafe-del-sur', 'cafe-del-sur-2']), 'cafe-del-sur-3')
  assert.equal(allocateSlug('Café del Sur', []), 'cafe-del-sur')
})
