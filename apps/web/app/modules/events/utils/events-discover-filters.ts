import { formatIsoDateInput } from '@repo/common'

export type EventsDiscoverFiltersValue = {
  startsFrom: string
  startsTo: string
  city: string
  state: string
}

export const EMPTY_EVENTS_DISCOVER_FILTERS: EventsDiscoverFiltersValue = {
  startsFrom: '',
  startsTo: '',
  city: '',
  state: '',
}

export type EventsDiscoverFilterField = keyof EventsDiscoverFiltersValue

export function countActiveDiscoverFilters(filters: EventsDiscoverFiltersValue): number {
  let count = 0
  if (filters.startsFrom) count += 1
  if (filters.startsTo) count += 1
  if (filters.city.trim()) count += 1
  if (filters.state.trim()) count += 1
  return count
}

export function appliedFiltersKey(filters: EventsDiscoverFiltersValue): string {
  return [filters.startsFrom, filters.startsTo, filters.city.trim(), filters.state.trim()].join('|')
}

export function areDiscoverFiltersEqual(
  a: EventsDiscoverFiltersValue,
  b: EventsDiscoverFiltersValue
): boolean {
  return appliedFiltersKey(a) === appliedFiltersKey(b)
}

export function clearDiscoverFilterField(
  filters: EventsDiscoverFiltersValue,
  field: EventsDiscoverFilterField
): EventsDiscoverFiltersValue {
  return { ...filters, [field]: '' }
}

export function formatDiscoverFilterDate(value: string): string {
  return formatIsoDateInput(value, {
    locale: 'es-AR',
    options: { dateStyle: 'medium' },
  })
}

export function toPublicEventsFilterParams(filters: EventsDiscoverFiltersValue): {
  startsFrom?: string
  startsTo?: string
  city?: string
  state?: string
} {
  const city = filters.city.trim()
  const state = filters.state.trim()

  return {
    startsFrom: filters.startsFrom ? `${filters.startsFrom}T00:00:00.000Z` : undefined,
    startsTo: filters.startsTo ? `${filters.startsTo}T23:59:59.999Z` : undefined,
    city: city.length > 0 ? city : undefined,
    state: state.length > 0 ? state : undefined,
  }
}

/** URL search ↔ filter draft (empty strings omitted from the URL). */
export type EventsDiscoverSearchParams = {
  startsFrom?: string
  startsTo?: string
  city?: string
  state?: string
}

export function filtersFromSearch(search: EventsDiscoverSearchParams): EventsDiscoverFiltersValue {
  return {
    startsFrom: typeof search.startsFrom === 'string' ? search.startsFrom : '',
    startsTo: typeof search.startsTo === 'string' ? search.startsTo : '',
    city: typeof search.city === 'string' ? search.city : '',
    state: typeof search.state === 'string' ? search.state : '',
  }
}

export function searchFromFilters(filters: EventsDiscoverFiltersValue): EventsDiscoverSearchParams {
  const city = filters.city.trim()
  const state = filters.state.trim()

  return {
    ...(filters.startsFrom ? { startsFrom: filters.startsFrom } : {}),
    ...(filters.startsTo ? { startsTo: filters.startsTo } : {}),
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
  }
}

export function parseEventsDiscoverSearch(
  search: Record<string, unknown>
): EventsDiscoverSearchParams {
  return {
    startsFrom: typeof search.startsFrom === 'string' ? search.startsFrom : undefined,
    startsTo: typeof search.startsTo === 'string' ? search.startsTo : undefined,
    city: typeof search.city === 'string' ? search.city : undefined,
    state: typeof search.state === 'string' ? search.state : undefined,
  }
}
