import { expect, test } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatDateInputPlaceholder,
  formatDateRange,
  formatIsoDateInput,
  formatNumber,
} from '../src/lib/formatters.ts'

test('formats numbers and currencies with caller options', () => {
  expect(formatNumber(1234.5, { locale: 'en-US', options: { maximumFractionDigits: 1 } })).toBe(
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(1234.5)
  )
  expect(
    formatCurrency(1234.5, {
      locale: 'en-US',
      currency: 'USD',
      options: { maximumFractionDigits: 2 },
    })
  ).toBe(
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(1234.5)
  )
})

test('returns caller fallbacks for invalid values', () => {
  expect(formatDate('not-a-date', { fallback: '—' })).toBe('—')
  expect(formatNumber(Number.NaN, { fallback: '—' })).toBe('—')
  expect(formatCurrency(undefined, { fallback: '—' })).toBe('—')
  expect(formatDateRange('2026-08-03', 'not-a-date', { fallback: '—' })).toBe('—')
})

test('preserves ISO date-only calendar dates and invalid input', () => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' } as const
  const expected = new Intl.DateTimeFormat('en-GB', options).format(new Date(2024, 1, 29))

  expect(formatIsoDateInput('2024-02-29', { locale: 'en-GB' })).toBe(expected)
  expect(formatIsoDateInput('2024-02-30')).toBe('2024-02-30')
  expect(formatIsoDateInput('not-a-date', { fallback: '—' })).toBe('—')
})

test('formats native date-input placeholders for the active locale', () => {
  expect(formatDateInputPlaceholder('es-AR')).toMatch(/aaaa/)
  expect(formatDateInputPlaceholder('en-US')).toMatch(/yyyy/)
})
