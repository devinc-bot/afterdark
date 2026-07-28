import type { PublicEventResponse } from '@repo/types'

export type EventsDiscoverCoverflowSlide = {
  documentId: string
  src: string
  title: string
}

export function buildEventsDiscoverCoverflowSlides(
  events: PublicEventResponse[]
): EventsDiscoverCoverflowSlide[] {
  const slides: EventsDiscoverCoverflowSlide[] = []

  for (const event of events) {
    const firstImage = event.images[0]
    if (!firstImage?.url) {
      continue
    }

    slides.push({
      documentId: event.documentId,
      src: firstImage.url,
      title: event.name,
    })
  }

  return slides
}
