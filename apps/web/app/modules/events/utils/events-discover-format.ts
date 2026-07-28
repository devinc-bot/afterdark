import type { PublicEventDetailAddress, PublicEventResponse } from '@repo/types'

export function formatEventWhen(value: Date | string, locale = 'es-AR'): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/** Compact sticky-panel date, e.g. "sáb, 1 ago · 09:00". */
export function formatEventWhenCompact(value: Date | string, locale = 'es-AR'): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const dayPart = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
  const timePart = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  return `${dayPart} · ${timePart}`
}

type EventPlaceFields = Pick<PublicEventResponse, 'locationName' | 'city' | 'state'>

export function formatEventPlace(event: EventPlaceFields): string {
  const parts = [event.locationName, event.city, event.state].filter((part): part is string =>
    Boolean(part && part.trim())
  )
  return parts.join(' · ')
}

export function formatEventAddress(address: PublicEventDetailAddress): string {
  const streetLine = [address.street, address.streetNumber]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')

  const parts = [streetLine, address.city, address.state].filter((part) => Boolean(part?.trim()))
  return parts.join(' · ')
}
