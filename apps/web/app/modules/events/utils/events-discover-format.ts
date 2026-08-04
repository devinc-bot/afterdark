import { formatDate } from '@repo/common'
import type { PublicEventDetailAddress, PublicEventResponse } from '@repo/types'

export function formatEventWhen(value: Date | string, locale = 'es-AR'): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  // Midnight often means "date only" in published events — hide noisy 0:00.
  const includeTime = date.getHours() !== 0 || date.getMinutes() !== 0

  return formatDate(date, {
    locale,
    options: {
      dateStyle: 'medium',
      ...(includeTime ? { timeStyle: 'short' as const } : {}),
    },
  })
}

/** Compact sticky-panel date, e.g. "sáb, 1 ago · 09:00". */
export function formatEventWhenCompact(value: Date | string, locale = 'es-AR'): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const dayPart = formatDate(date, {
    locale,
    options: { weekday: 'short', day: 'numeric', month: 'short' },
  })
  const timePart = formatDate(date, {
    locale,
    options: { hour: '2-digit', minute: '2-digit' },
  })

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
