import { Link as RouterLink } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import {
  Badge,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  NotImage,
  VT,
  armEventHero,
  buttonVariants,
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

  const detailLink = {
    to: '/events/$slug' as const,
    params: { slug: event.slug },
    onClick: armEventHero,
  }

  return (
    <Card
      data-vt-scope={VT.eventHero}
      id={`events-discover-item-${event.documentId}`}
      className={cn(
        'group flex h-full w-full flex-col border-hairline/15',
        'bg-surface-card hover:-translate-y-1',
        'transition-[border-color,box-shadow,background-color] duration-(--duration-fast) ease-emphasized',
        'motion-reduce:transition-none',
        'hover:border-hairline/40 hover:bg-surface-high/40'
      )}
    >
      <RouterLink
        {...detailLink}
        data-vt-source={VT.eventHero}
        className="m-4 flex overflow-hidden rounded-app focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={t('discover.list.viewEventAria', { name: event.name })}
      >
        {image ? (
          <img src={image.url} alt="" className="aspect-video w-full object-cover group-hover:scale-[1.05] duration-300" />
        ) : (
          <NotImage
            size="full"
            label={t('discover.list.noImage')}
            className="aspect-video min-h-0 w-full rounded-none border-0 border-b border-hairline/40"
          />
        )}
      </RouterLink>

      <CardHeader className="flex flex-1 flex-col gap-2 space-y-0 p-4 sm:gap-2.5 sm:p-5">
        <CardTitle className="font-display text-lg font-semibold tracking-tight text-balance text-on-surface sm:text-xl">
          <RouterLink
            {...detailLink}
            className="line-clamp-2 rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {event.name}
          </RouterLink>
        </CardTitle>

        {event.description ? (
          <CardDescription className="line-clamp-2 text-sm leading-relaxed text-pretty text-on-surface-variant sm:text-base">
            {event.description}
          </CardDescription>
        ) : null}

        {place ? (
          <p className="mt-auto flex items-start gap-1.5 text-sm text-on-surface-variant">
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
      </CardHeader>

      <CardFooter className="mt-auto p-4 pt-0 sm:p-5 sm:pt-0">
        <RouterLink
          {...detailLink}
          className={cn(
            buttonVariants({ variant: 'default', size: 'lg' }),
            'w-full',
            'group-hover:bg-primary/90'
          )}
        >
          {t('discover.list.viewEvent')}
        </RouterLink>
      </CardFooter>
    </Card>
  )
}
