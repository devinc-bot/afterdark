import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@afterdark/ui'
import type { PublicEventResponse } from '@afterdark/types'
import { formatEventPlace, formatEventWhen } from '../utils/events-discover-format'

type EventsDiscoverSelectionProps = {
  event: PublicEventResponse
  onClear: () => void
}

/** Inline close for discovery selection — not a detail page (out of scope). */
export function EventsDiscoverSelection({ event, onClear }: EventsDiscoverSelectionProps) {
  const { t } = useTranslation('events')
  const image = event.images[0]
  const when = formatEventWhen(event.startsAt)
  const place = formatEventPlace(event)
  const hasCoordinates = event.latitude !== null && event.longitude !== null

  return (
    <div
      className="bg-surface-container-low/90 px-4 py-4 sm:px-5"
      role="region"
      aria-labelledby="events-discover-selection-title"
      aria-live="polite"
    >
      <div className="flex gap-4">
        {image ? (
          <img
            src={image.url}
            alt=""
            className="size-16 shrink-0 rounded-md object-cover sm:size-20"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="events-discover-selection-title"
              className="font-display text-lg font-semibold tracking-tight text-balance text-on-surface"
            >
              {event.name}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 text-on-surface-variant"
              aria-label={t('discover.selection.clear')}
              onClick={onClear}
            >
              <X className="size-4" aria-hidden />
            </Button>
          </div>
          {when ? <p className="mt-1 font-label text-sm text-primary/90">{when}</p> : null}
          {place ? (
            <p className="mt-0.5 font-label text-sm text-on-surface-variant">{place}</p>
          ) : null}
          {!hasCoordinates ? (
            <p className="mt-1 font-label text-xs text-on-surface-variant">
              {t('discover.list.noCoordinatesHint')}
            </p>
          ) : null}
          {event.description ? (
            <p className="mt-2 line-clamp-3 font-body text-sm leading-relaxed text-pretty text-on-surface-variant">
              {event.description}
            </p>
          ) : null}
          <p className="mt-3 font-label text-sm text-primary">
            {t('discover.selection.ticketsSoon')}
          </p>
        </div>
      </div>
    </div>
  )
}
