export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  FINISHED: 'finished',
} as const

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS]
