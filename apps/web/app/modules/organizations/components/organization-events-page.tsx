import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { CalendarDays, MoveUpRight, Sparkles } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Skeleton,
  usePageTitle,
} from '@repo/ui'
import { Container } from '~/modules/common/components/container'
import { usePublicEventsInfiniteQuery } from '~/modules/events/queries/use-public-events-infinite-query'
import { EventsDiscoverListItem } from '~/modules/events/components/events-discover-list-item'

const MOCK_BANNER =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=85'

type OrganizationEventsPageProps = {
  organizationId: string
}

export function OrganizationEventsPage({ organizationId }: OrganizationEventsPageProps) {
  const { t } = useTranslation('events')
  const { data, isPending, isError, refetch } = usePublicEventsInfiniteQuery({
    startsFrom: '',
    startsTo: '',
    city: '',
    state: '',
  })

  usePageTitle('events', 'discover.organization.metaTitle')

  const events = data?.pages.flatMap((page) => page.data) ?? []
  const organizationName = organizationId === 'demo' ? 'Noche Clara' : 'Noche Clara'

  return (
    <div className="pb-16">
      <Container className="pt-6 sm:pt-10">
        <section className="overflow-hidden rounded-app-lg border border-hairline/20 bg-surface-card shadow-(--shadow-glass)">
          <div className="relative aspect-[2.5/1] min-h-48 overflow-hidden sm:min-h-64">
            <img
              src={MOCK_BANNER}
              alt={t('discover.organization.bannerAlt', { name: organizationName })}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(10,12,9,0.82)_100%)]" />
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:bottom-7 sm:left-8">
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
              {t('discover.organization.bannerLabel')}
            </div>
          </div>

          <div className="relative flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:items-end sm:gap-6 sm:px-8 sm:pb-8">
            <Avatar className="-mt-10 size-24 shrink-0 border-4 border-surface-card sm:-mt-12 sm:size-28">
              <AvatarImage
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80"
                alt=""
              />
              <AvatarFallback className="bg-primary text-lg font-bold text-on-primary">
                NC
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-medium text-primary">
                {t('discover.organization.eyebrow')}
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-on-surface text-balance sm:text-4xl">
                {organizationName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
                {t('discover.organization.description')}
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit shrink-0 border-primary/30 bg-primary/10 text-primary"
            >
              {t('discover.organization.activeBadge')}
            </Badge>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="organization-events-heading">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-primary">
                {t('discover.organization.eventsKicker')}
              </p>
              <h2
                id="organization-events-heading"
                className="font-display text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl"
              >
                {t('discover.organization.eventsTitle')}
              </h2>
            </div>
            <Link
              to="/events"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
            >
              {t('discover.organization.viewAll')}
              <MoveUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {isPending ? <OrganizationEventsSkeleton /> : null}
          {isError ? (
            <div className="rounded-app border border-error/30 bg-error-container/20 p-6 text-center">
              <p className="text-sm text-error">{t('discover.organization.error')}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => void refetch()}
              >
                {t('discover.organization.retry')}
              </Button>
            </div>
          ) : null}
          {!isPending && !isError && events.length === 0 ? (
            <div className="rounded-app border border-dashed border-hairline/40 bg-surface-muted/50 px-6 py-14 text-center">
              <CalendarDays className="mx-auto size-8 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg font-semibold text-on-surface">
                {t('discover.organization.emptyTitle')}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-on-surface-variant">
                {t('discover.organization.emptyDescription')}
              </p>
            </div>
          ) : null}
          {!isPending && !isError && events.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventsDiscoverListItem key={event.documentId} event={event} />
              ))}
            </div>
          ) : null}
        </section>
      </Container>
    </div>
  )
}

function OrganizationEventsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      {['one', 'two', 'three'].map((key) => (
        <div
          key={key}
          className="overflow-hidden rounded-app border border-hairline/15 bg-surface-card p-4"
        >
          <Skeleton className="aspect-video w-full rounded-app-sm" />
          <Skeleton className="mt-5 h-6 w-4/5" />
          <Skeleton className="mt-3 h-4 w-3/5" />
          <Skeleton className="mt-7 h-11 w-full rounded-app" />
        </div>
      ))}
    </div>
  )
}
