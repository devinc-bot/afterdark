import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { Card, NotImage, cn } from '@repo/ui'
import type { PublicEventResponse } from '@repo/types'
import { formatEventPlace, formatEventWhen } from '../utils/events-discover-format'

type EventsDiscoverListItemProps = {
  event: PublicEventResponse
  selected: boolean
  onSelect: () => void
}

export function EventsDiscoverListItem({ event, selected, onSelect }: EventsDiscoverListItemProps) {
  const { t } = useTranslation('events')
  const image = event.images[0]
  const when = formatEventWhen(event.startsAt)
  const place = formatEventPlace(event)
  const hasCoordinates = event.latitude !== null && event.longitude !== null

  return (
    <Card
      as="button"
      id={`events-discover-item-${event.documentId}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={
        hasCoordinates
          ? t('discover.list.focusOnMap', { name: event.name })
          : t('discover.list.noMapLocation', { name: event.name })
      }
      className={cn(
        'group flex w-full gap-4 rounded-control border p-4 text-left sm:gap-5 sm:p-5',
        'bg-surface-container-low/50',
        'transition-[background-color,border-color,transform,box-shadow] duration-(--duration-fast) ease-emphasized',
        'motion-reduce:transition-none',
        'hover:bg-primary/8 active:scale-[0.99] motion-reduce:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'border-primary/45 bg-primary/12 shadow-[inset_0_0_0_1px] shadow-primary/25'
          : 'border-hairline/50 hover:border-primary/30'
      )}
    >
      {image ? (
        <img
          src={image.url}
          alt=""
          className={cn(
            'size-20 shrink-0 rounded-md object-cover sm:size-24',
            'ring-1 ring-hairline/40 transition-[ring-color] duration-(--duration-fast) ease-emphasized',
            'motion-reduce:transition-none',
            selected && 'ring-primary/60'
          )}
        />
      ) : (
        <NotImage
          size="md"
          label={t('discover.list.noImage')}
          className="rounded-md border-hairline/40 sm:size-24 sm:[&_svg]:size-8"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <h3
          className={cn(
            'font-display text-lg font-bold leading-snug -tracking-label-md text-balance sm:text-xl',
            selected ? 'text-primary-fixed' : 'text-on-surface'
          )}
        >
          {event.name}
        </h3>

        {when ? (
          <p
            className={cn(
              'font-label text-sm font-medium tracking-tight sm:text-base',
              selected ? 'text-primary' : 'text-primary/90'
            )}
          >
            {when}
          </p>
        ) : null}

        {place ? (
          <p className="flex items-start gap-1.5 font-label text-xs text-on-surface-variant sm:text-sm">
            <MapPin
              className="mt-0.5 size-3.5 shrink-0 opacity-70"
              aria-hidden
              strokeWidth={1.75}
            />
            <span className="min-w-0">{place}</span>
          </p>
        ) : null}

        {!hasCoordinates ? (
          <p className="font-label text-xs text-on-surface-variant">
            {t('discover.list.noCoordinatesHint')}
          </p>
        ) : null}

        {event.description && !selected ? (
          <p className="mt-0.5 line-clamp-2 max-w-prose font-body text-sm leading-relaxed text-pretty text-on-surface-variant">
            {event.description}
          </p>
        ) : null}
      </div>
    </Card>
  )
}
