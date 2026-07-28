import { EVENT_STATUS, type EventResponse } from '@repo/types'
import type { EventFormValues } from '@repo/validators'
import type { EventRecordItem } from '~/modules/events/components/event-record'

export const EMPTY_EVENT_FORM_VALUES: EventFormValues = {
  locationId: '',
  name: '',
  description: '',
  startsAt: '',
  endsAt: '',
  status: EVENT_STATUS.PUBLISHED,
}

function formatDateForDatetimeLocal(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

export function eventResponseToFormValues(event: EventResponse): EventFormValues {
  return {
    locationId: event.locationId,
    name: event.name,
    description: event.description,
    startsAt: formatDateForDatetimeLocal(new Date(event.startsAt)),
    endsAt: formatDateForDatetimeLocal(new Date(event.endsAt)),
    status: event.status,
  }
}

export function eventResponseToRecordItem(event: EventResponse): EventRecordItem {
  return {
    id: event.documentId,
    name: event.name,
    imageUrl: event.images[0]?.url ?? null,
    clubName: event.locationName,
    startsAt: new Date(event.startsAt),
    endsAt: new Date(event.endsAt),
    status: event.status,
  }
}
