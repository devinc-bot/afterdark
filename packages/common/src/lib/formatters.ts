type FormatterLocale = string | string[]

type DateValue = Date | number | string | null | undefined

const DEFAULT_LOCALE = 'es-AR'
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const DATE_INPUT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}

export type FormatDateOptions = {
  locale?: FormatterLocale
  options?: Intl.DateTimeFormatOptions
  fallback?: string
}

export type FormatNumberOptions = {
  locale?: FormatterLocale
  options?: Intl.NumberFormatOptions
  fallback?: string
}

export type FormatCurrencyOptions = {
  locale?: FormatterLocale
  currency?: string
  options?: Omit<Intl.NumberFormatOptions, 'currency' | 'style'>
  fallback?: string
}

export type FormatDateRangeOptions = FormatDateOptions & {
  separator?: string
}

export type FormatIsoDateInputOptions = {
  locale?: FormatterLocale
  options?: Intl.DateTimeFormatOptions
  fallback?: string
}

function toValidDate(value: DateValue): Date | null {
  const date = value instanceof Date ? value : new Date(value ?? Number.NaN)
  return Number.isNaN(date.getTime()) ? null : date
}

function toLocalIsoDate(value: string): Date | null {
  const match = ISO_DATE_RE.exec(value.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

export function formatDate(value: DateValue, options: FormatDateOptions = {}): string {
  const date = toValidDate(value)
  if (!date) return options.fallback ?? ''

  return new Intl.DateTimeFormat(options.locale ?? DEFAULT_LOCALE, options.options).format(date)
}

export function formatNumber(
  value: number | null | undefined,
  options: FormatNumberOptions = {}
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options.fallback ?? ''
  }

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, options.options).format(value)
}

export function formatCurrency(
  value: number | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options.fallback ?? ''
  }

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    ...options.options,
    style: 'currency',
    currency: options.currency ?? 'ARS',
  }).format(value)
}

export function formatDateRange(
  from: DateValue,
  to: DateValue,
  options: FormatDateRangeOptions = {}
): string {
  const fromDate = toValidDate(from)
  const toDate = toValidDate(to)
  if (!fromDate || !toDate) return options.fallback ?? ''

  const formatter = new Intl.DateTimeFormat(options.locale ?? DEFAULT_LOCALE, options.options)
  return `${formatter.format(fromDate)}${options.separator ?? ' – '}${formatter.format(toDate)}`
}

export function formatIsoDateInput(value: string, options: FormatIsoDateInputOptions = {}): string {
  const date = toLocalIsoDate(value)
  if (!date) return options.fallback ?? value

  return new Intl.DateTimeFormat(options.locale ?? DEFAULT_LOCALE, {
    ...DATE_INPUT_OPTIONS,
    ...options.options,
  }).format(date)
}

export function formatDateInputPlaceholder(locale: FormatterLocale = DEFAULT_LOCALE): string {
  const yearToken = locale.toString().toLowerCase().startsWith('es') ? 'aaaa' : 'yyyy'
  const parts = new Intl.DateTimeFormat(locale, DATE_INPUT_OPTIONS).formatToParts(
    new Date(2000, 11, 31)
  )

  return parts
    .map((part) => {
      if (part.type === 'day') return 'dd'
      if (part.type === 'month') return 'mm'
      if (part.type === 'year') return yearToken
      return part.value
    })
    .join('')
}
