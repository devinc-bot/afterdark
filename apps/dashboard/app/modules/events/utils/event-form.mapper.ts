import { EVENT_STATUS, type EventResponse } from '@repo/types'
import { eventDurationHoursSchema, type EventFormValues } from '@repo/validators'
import type { EventRecordItem } from '~/modules/events/components/event-record'

const MILLISECONDS_PER_HOUR = 3_600_000

export const EMPTY_EVENT_FORM_VALUES: EventFormValues = {
  locationId: '',
  name: '',
  description: '',
  startsAt: '',
  durationHours: '',
  status: EVENT_STATUS.PUBLISHED,
  faqs: [],
}

function formatDateForDatetimeLocal(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

function getEventDurationHours(event: EventResponse): string {
  const durationHours =
    (new Date(event.endsAt).getTime() - new Date(event.startsAt).getTime()) / MILLISECONDS_PER_HOUR

  if (!eventDurationHoursSchema.safeParse(durationHours).success) {
    return ''
  }

  return String(durationHours)
}

export function eventResponseToFormValues(event: EventResponse): EventFormValues {
  return {
    locationId: event.locationId,
    name: event.name,
    description: event.description,
    startsAt: formatDateForDatetimeLocal(new Date(event.startsAt)),
    durationHours: getEventDurationHours(event),
    status: event.status,
    faqs: event.faqs.map(({ question, answer }) => ({ question, answer })),
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
