import type { PublicEventResponse } from '@repo/types'
import { formatEventPlace, formatEventWhen } from './events-discover-format'

/** Featured hero only — not a second full catalog. */
export const EVENTS_DISCOVER_COVERFLOW_LIMIT = 6

export type EventsDiscoverCoverflowSlide = {
  documentId: string
  src: string
  title: string
  when: string
  place: string
}

export function buildEventsDiscoverCoverflowSlides(
  events: PublicEventResponse[],
  locale: string
): EventsDiscoverCoverflowSlide[] {
  const slides: EventsDiscoverCoverflowSlide[] = []

  for (const event of events) {
    if (slides.length >= EVENTS_DISCOVER_COVERFLOW_LIMIT) {
      break
    }

    const firstImage = event.images[0]
    if (!firstImage?.url) {
      continue
    }

    slides.push({
      documentId: event.documentId,
      src: firstImage.url,
      title: event.name,
      when: formatEventWhen(event.startsAt, locale),
      place: formatEventPlace(event),
    })
  }

  return slides
}
