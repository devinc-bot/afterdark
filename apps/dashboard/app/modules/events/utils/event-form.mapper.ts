import { EVENT_STATUS, type EventResponse } from '@afterdark/types'
import type { EventFormValues } from '@afterdark/validators'
import type { EventRecordItem } from '~/modules/events/components/event-record'

export const EMPTY_EVENT_FORM_VALUES: EventFormValues = {
  clubId: '',
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
    clubId: event.clubId,
    name: event.name,
    description: event.description,
    startsAt: formatDateForDatetimeLocal(new Date(event.startsAt)),
    endsAt: formatDateForDatetimeLocal(new Date(event.endsAt)),
    status: event.status,
  }
}

function clubInitials(clubName: string): string {
  const parts = clubName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'CL'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
}

export function eventResponseToRecordItem(event: EventResponse): EventRecordItem {
  return {
    id: event.documentId,
    name: event.name,
    clubName: event.clubName,
    clubInitials: clubInitials(event.clubName),
    clubAvatarClassName: 'border-hairline-strong bg-surface-container-high text-ink-muted',
    startsAt: new Date(event.startsAt),
    endsAt: new Date(event.endsAt),
    status: event.status,
  }
}
