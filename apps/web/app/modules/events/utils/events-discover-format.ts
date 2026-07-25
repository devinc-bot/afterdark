import type { PublicEventResponse } from '@repo/types'

export function formatEventWhen(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

type EventPlaceFields = Pick<PublicEventResponse, 'locationName' | 'city' | 'state'>

export function formatEventPlace(event: EventPlaceFields): string {
  const parts = [event.locationName, event.city, event.state].filter((part): part is string =>
    Boolean(part && part.trim())
  )
  return parts.join(' · ')
}
