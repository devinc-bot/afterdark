import assert from 'node:assert/strict'
import test from 'node:test'
import {
  formatCurrency,
  formatDate,
  formatDateInputPlaceholder,
  formatDateRange,
  formatIsoDateInput,
  formatNumber,
} from '../src/lib/formatters.ts'

test('formats numbers and currencies with caller options', () => {
  assert.equal(
    formatNumber(1234.5, { locale: 'en-US', options: { maximumFractionDigits: 1 } }),
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(1234.5)
  )
  assert.equal(
    formatCurrency(1234.5, {
      locale: 'en-US',
      currency: 'USD',
      options: { maximumFractionDigits: 2 },
    }),
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(1234.5)
  )
})

test('returns caller fallbacks for invalid values', () => {
  assert.equal(formatDate('not-a-date', { fallback: '—' }), '—')
  assert.equal(formatNumber(Number.NaN, { fallback: '—' }), '—')
  assert.equal(formatCurrency(undefined, { fallback: '—' }), '—')
  assert.equal(formatDateRange('2026-08-03', 'not-a-date', { fallback: '—' }), '—')
})

test('preserves ISO date-only calendar dates and invalid input', () => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' } as const
  const expected = new Intl.DateTimeFormat('en-GB', options).format(new Date(2024, 1, 29))

  assert.equal(formatIsoDateInput('2024-02-29', { locale: 'en-GB' }), expected)
  assert.equal(formatIsoDateInput('2024-02-30'), '2024-02-30')
  assert.equal(formatIsoDateInput('not-a-date', { fallback: '—' }), '—')
})

test('formats native date-input placeholders for the active locale', () => {
  assert.match(formatDateInputPlaceholder('es-AR'), /aaaa/)
  assert.match(formatDateInputPlaceholder('en-US'), /yyyy/)
})
