import { startTransition, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import type { PublicOrganizationProfileResponse } from '@repo/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  LoadErrorBanner,
  Link,
  NotFoundView,
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Skeleton,
  getPaginationItems,
  usePageTitle,
} from '@repo/ui'
import { Container } from '~/modules/common/components/container'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { getUserInitials } from '~/modules/common/utils/user-initials.utils'
import {
  isPublicOrganizationSlug,
  usePublicOrganizationProfileQuery,
} from '../queries/use-public-organization-profile-query'
import { EventsDiscoverListItem } from '~/modules/events/components/events-discover-list-item'

type OrganizationProfilePageProps = {
  slug: string
}

export function OrganizationProfilePage({ slug }: OrganizationProfilePageProps) {
  const { t } = useTranslation('events')
  const { t: tCommon } = useTranslation('common')
  const [page, setPage] = useState(1)
  const isValidSlug = isPublicOrganizationSlug(slug)
  const {
    data: profile,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = usePublicOrganizationProfileQuery(slug, page)

  usePageTitle('events', 'discover.page.metaTitle')

  useEffect(() => {
    if (!profile?.name) {
      return
    }

    document.title = t('discover.organization.metaTitle', { name: profile.name })
  }, [profile?.name, t])

  const showNotFound = !isValidSlug || (!isPending && !isError && profile === null)
  const showLoading = isValidSlug && isPending
  const showError = isValidSlug && isError
  const showContent = isValidSlug && !isPending && !isError && profile

  return (
    <main className="min-h-svh overflow-x-clip bg-background text-on-background">
      {showLoading ? <OrganizationProfileLoading /> : null}
      {showError ? (
        <Container className="py-8 sm:py-10 lg:py-12">
          <LoadErrorBanner
            className="my-0 w-full max-w-none"
            title={t('discover.organization.errorTitle')}
            message={error instanceof Error ? error.message : t('discover.organization.error')}
            retryLabel={t('discover.organization.retry')}
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        </Container>
      ) : null}
      {showNotFound ? (
        <Container className="py-8 sm:py-10 lg:py-12">
          <NotFoundView
            brandLabel={tCommon('appNameUpper')}
            title={t('discover.organization.notFoundTitle')}
            description={t('discover.organization.notFoundDescription')}
            actionLabel={t('discover.organization.backToEvents')}
            actionTo={WEB_ROUTES.events()}
            className="min-h-0 py-16"
          />
        </Container>
      ) : null}
      {showContent ? (
        <OrganizationProfileContent
          profile={profile}
          page={page}
          onPageChange={setPage}
          isFetching={isFetching}
        />
      ) : null}
    </main>
  )
}

type OrganizationProfileContentProps = {
  profile: PublicOrganizationProfileResponse
  page: number
  onPageChange: (page: number) => void
  isFetching: boolean
}

function OrganizationProfileContent({
  profile,
  page,
  onPageChange,
  isFetching,
}: OrganizationProfileContentProps) {
  const { t } = useTranslation('events')
  const initials = getUserInitials(profile.name, '')
  const heroImages = profile.events.data.flatMap((event) => event.images.slice(0, 1)).slice(0, 3)

  return (
    <>
      <section className="relative isolate overflow-hidden bg-surface-container-lowest">
        <OrganizationHeroBackdrop images={heroImages} />
        <div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest via-surface-container-lowest/60 to-surface-container-lowest/15" />
        <Container className="relative flex min-h-80 flex-col justify-end py-8 sm:min-h-96 sm:py-10 lg:min-h-112 lg:py-12">
          <Link
            to={WEB_ROUTES.events()}
            variant='link'
            className="absolute top-5 inline-flex items-center gap-1.5 font-label text-sm sm:top-6"
          >
            <ArrowLeft className="size-3.5" aria-hidden strokeWidth={1.75} />
            {t('discover.organization.backToEvents')}
          </Link>
          <div className="flex items-end gap-4 sm:gap-5">
            <Avatar className="size-20 shrink-0 border-4 border-surface-container-lowest sm:size-24">
              {profile.avatar ? <AvatarImage src={profile.avatar} alt="" /> : null}
              <AvatarFallback className="bg-primary text-xl font-bold text-on-primary sm:text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h1 className="max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-balance text-on-surface sm:text-4xl lg:text-5xl">
              {profile.name}
            </h1>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16 lg:py-20">
        <section aria-labelledby="organization-events-heading">
          <h2
            id="organization-events-heading"
            className="max-w-xl font-display text-2xl font-bold tracking-tight text-balance text-on-surface sm:text-3xl"
          >
            {t('discover.organization.eventsTitle')}
          </h2>
          {profile.events.data.length === 0 ? (
            <div className="mt-7 border-t border-hairline/50 pt-10 sm:mt-8 sm:pt-12">
              <p className="max-w-md font-display text-xl font-bold text-balance text-on-surface sm:text-2xl">
                {t('discover.organization.emptyTitle')}
              </p>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
                {t('discover.organization.emptyDescription')}
              </p>
            </div>
          ) : (
            <ul
              className="mt-7 grid list-none grid-cols-1 gap-5 p-0 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
              aria-label={t('discover.organization.eventsAria', { name: profile.name })}
            >
              {profile.events.data.map((event) => (
                <li key={event.documentId} className="min-w-0">
                  <EventsDiscoverListItem event={event} />
                </li>
              ))}
            </ul>
          )}
          {profile.events.totalPages > 1 ? (
            <Pagination aria-label={t('discover.organization.paginationLabel')} className="mt-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    disabled={page === 1 || isFetching}
                    text={t('pagination.previous')}
                    onClick={() => startTransition(() => onPageChange(page - 1))}
                  />
                </PaginationItem>
                {getPaginationItems(page, profile.events.totalPages)
                  .filter((item): item is number => item !== 'ellipsis')
                  .map((item) => (
                    <PaginationItem key={item}>
                      <PaginationButton
                        isActive={item === page}
                        disabled={isFetching}
                        aria-label={t('discover.organization.pageLabel', { page: item })}
                        onClick={() => startTransition(() => onPageChange(item))}
                      >
                        {item}
                      </PaginationButton>
                    </PaginationItem>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    disabled={page === profile.events.totalPages || isFetching}
                    text={t('pagination.next')}
                    onClick={() => startTransition(() => onPageChange(page + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </section>
      </Container>
    </>
  )
}

function OrganizationHeroBackdrop({ images }: { images: { url: string }[] }) {
  if (images.length === 0) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-br from-surface-container-highest via-surface-container-high to-surface-container-low"
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid grid-cols-3 gap-px bg-surface-container-low"
    >
      {images.map((image, index) => (
        <img
          key={image.url}
          src={image.url}
          alt=""
          className="size-full object-cover opacity-75 filter-[saturate(0.82)]"
          style={{ objectPosition: `${50 + (index - 1) * 12}% center` }}
        />
      ))}
      {Array.from({ length: 3 - images.length }, (_, index) => (
        <div key={`placeholder-${index}`} className="bg-surface-container-high" />
      ))}
    </div>
  )
}

function OrganizationProfileLoading() {
  const { t } = useTranslation('events')

  return (
    <div aria-busy="true" aria-live="polite">
      <p className="sr-only">{t('discover.organization.loading')}</p>
      <div className="relative h-80 bg-surface-container-low sm:h-96 lg:h-112">
        <Skeleton className="size-full rounded-none bg-surface-container-high" />
        <Container className="absolute inset-x-0 bottom-0 flex items-end gap-4 py-8 sm:gap-5 sm:py-10 lg:py-12">
          <Skeleton className="size-20 shrink-0 rounded-full bg-surface-container-highest sm:size-24" />
          <Skeleton className="h-10 w-2/3 max-w-xl bg-surface-container-highest sm:h-12" />
        </Container>
      </div>
      <Container className="py-12 sm:py-16 lg:py-20">
        <Skeleton className="h-10 w-56 bg-surface-container-high" />
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="aspect-4/5 w-full bg-surface-container-high" />
          ))}
        </div>
      </Container>
    </div>
  )
}
