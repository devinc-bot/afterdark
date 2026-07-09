import {
  ATTENDEE_ENTRY_STATUS,
  type AttendeeEntryStatus,
} from '~/modules/staff-panel/constants/attendee-entry-status'

export type AttendeeRecord = {
  id: string
  name: string
  eventName: string
  entryStatus: AttendeeEntryStatus
}

export const ATTENDEE_RECORDS_MOCK: AttendeeRecord[] = [
  {
    id: '1',
    name: 'Lucía Fernández',
    eventName: 'Neon Nights',
    entryStatus: ATTENDEE_ENTRY_STATUS.VALID,
  },
  {
    id: '2',
    name: 'Martín Gómez',
    eventName: 'Neon Nights',
    entryStatus: ATTENDEE_ENTRY_STATUS.USED,
  },
  {
    id: '3',
    name: 'Camila Ruiz',
    eventName: 'Afterglow Session',
    entryStatus: ATTENDEE_ENTRY_STATUS.VALID,
  },
  {
    id: '4',
    name: 'Diego Morales',
    eventName: 'Afterglow Session',
    entryStatus: ATTENDEE_ENTRY_STATUS.EXPIRED,
  },
  {
    id: '5',
    name: 'Valentina Soto',
    eventName: 'Basement Pulse',
    entryStatus: ATTENDEE_ENTRY_STATUS.USED,
  },
]
