import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import {
  Badge,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Link,
  NotImage,
  cn,
} from '@repo/ui'
import type { PublicEventResponse } from '@repo/types'
import { formatEventPlace, formatEventWhen } from '../utils/events-discover-format'

type EventsDiscoverListItemProps = {
  event: PublicEventResponse
}

export function EventsDiscoverListItem({ event }: EventsDiscoverListItemProps) {
  const { t, i18n } = useTranslation('events')
  const image = event.images[0]
  const when = formatEventWhen(event.startsAt, i18n.language)
  const place = formatEventPlace(event)
  const hasCoordinates = event.latitude !== null && event.longitude !== null

  return (
    <Card
      id={`events-discover-item-${event.documentId}`}
      className={cn(
        'group relative flex h-full w-full flex-col border-hairline/10',
        'bg-surface-card',
        'transition-[border-color,box-shadow,background-color] duration-(--duration-fast) ease-emphasized',
        'motion-reduce:transition-none',
        'hover:shadow-(--shadow-glass)'
      )}
    >
      <div className="flex overflow-hidden rounded-app m-4">
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
          </>
        ) : (
          <NotImage
            size="full"
            label={t('discover.list.noImage')}
            className="aspect-video min-h-0 w-full rounded-none border-0 border-b border-hairline/40"
          />
        )}
      </div>

      <CardHeader className="flex flex-1 flex-col gap-2 space-y-0 p-4 sm:gap-2.5 sm:p-5">
        <CardTitle className="truncate font-display text-lg font-semibold tracking-tight text-on-surface sm:text-xl">
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

        {when ? (
          <Badge variant="outline" size="sm" className="w-fit border-hairline/30">
            {when}
          </Badge>
        ) : null}

        {!hasCoordinates ? (
          <p className="font-label text-sm text-on-surface-variant">
            {t('discover.list.noCoordinatesHint')}
          </p>
        ) : null}
      </CardHeader>

      <CardFooter className="mt-auto p-4 pt-0 sm:p-5 sm:pt-0">
        <Link
          to="/events/$documentId"
          params={{ documentId: event.documentId }}
          className="min-h-11 w-full bg-background/50"
          variant="ghost"
          size="lg"
          aria-label={t('discover.list.viewEvent')}
        >
          {t('discover.list.viewEvent')}
        </Link>
      </CardFooter>
    </Card>
  )
}
