import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  NotImage,
  cn,
} from '@repo/ui'
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
  const selectLabel = hasCoordinates
    ? t('discover.list.focusOnMap', { name: event.name })
    : t('discover.list.noMapLocation', { name: event.name })

  return (
    <Card
      id={`events-discover-item-${event.documentId}`}
      aria-current={selected ? 'true' : undefined}
      variant="gradient"
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden pt-0',
        'bg-surface-card',
        'transition-[border-color,box-shadow,background-color] duration-(--duration-fast) ease-emphasized',
        'motion-reduce:transition-none',
        selected
          ? 'bg-primary/8 shadow-(--shadow-glass)'
          : 'border-hairline/60 hover:border-hairline hover:shadow-(--shadow-glass)'
      )}
    >
      <div className="relative overflow-hidden">
        {image ? (
          <>
            <img
              src={image.url}
              alt={event.name}
              className={cn(
                'aspect-video w-full object-cover',
                'transition-transform duration-(--duration-normal) ease-emphasized',
                'motion-reduce:transition-none',
                'group-hover:scale-[1.02] motion-reduce:group-hover:scale-100'
              )}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent"
              aria-hidden
            />
          </>
        ) : (
          <NotImage
            size="full"
            label={t('discover.list.noImage')}
            className="aspect-video min-h-0 w-full rounded-none border-0 border-b border-hairline/40"
          />
        )}

        {when ? (
          <div className="absolute top-3 left-3 z-20 max-w-[calc(100%-1.5rem)]">
            <Badge variant="outline" size="sm">
              {when}
            </Badge>
          </div>
        ) : null}
      </div>

      <CardHeader className="flex flex-1 flex-col gap-2 space-y-0 p-4 sm:gap-2.5 sm:p-5">
        <CardTitle
          className={cn(
            'font-display text-lg font-semibold leading-snug tracking-tight text-balance sm:text-xl',
            selected ? 'text-primary' : 'text-on-surface'
          )}
        >
          {event.name}
        </CardTitle>

        {event.description ? (
          <CardDescription className="line-clamp-2 text-sm leading-relaxed text-pretty text-on-surface-variant sm:text-base">
            {event.description}
          </CardDescription>
        ) : null}

        {place ? (
          <p className="mt-auto flex items-start gap-1.5 font-label text-sm text-on-surface-variant">
            <MapPin
              className="mt-0.5 size-3.5 shrink-0 opacity-70"
              aria-hidden
              strokeWidth={1.75}
            />
            <span className="min-w-0 text-pretty">{place}</span>
          </p>
        ) : null}

        {!hasCoordinates ? (
          <p className="font-label text-sm text-on-surface-variant">
            {t('discover.list.noCoordinatesHint')}
          </p>
        ) : null}
      </CardHeader>

      <CardFooter className="mt-auto p-4 pt-0 sm:p-5 sm:pt-0">
        <Button
          type="button"
          className="min-h-11 w-full"
          variant={selected ? 'default' : 'ghost'}
          aria-pressed={selected}
          aria-label={selectLabel}
          onClick={onSelect}
        >
          {t('discover.list.viewEvent')}
        </Button>
      </CardFooter>
    </Card>
  )
}
