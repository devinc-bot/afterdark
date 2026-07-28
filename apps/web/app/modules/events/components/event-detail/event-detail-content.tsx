import { useTranslation } from 'react-i18next'
import { ArrowLeft, MapPin } from 'lucide-react'
import type { PublicEventDetailResponse } from '@repo/types'
import { Link } from '@repo/ui'
import { PAGE_HEADER_HEADING } from '~/modules/common/components/page-header'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { formatEventAddress, formatEventWhen } from '../../utils/events-discover-format'
import { EventDetailCarousel } from './event-detail-carousel'
import { EventDetailMap } from './event-detail-map'
import { EventDetailPurchasePanel } from './event-detail-purchase-panel'
import { EventDetailShareButton } from './event-detail-share-button'

const SECTION_HEADING =
  'font-display text-lg font-semibold tracking-tight text-balance text-on-surface'

type EventDetailContentProps = {
  event: PublicEventDetailResponse
}

export function EventDetailContent({ event }: EventDetailContentProps) {
  const { t, i18n } = useTranslation('events')
  const startsAt = formatEventWhen(event.startsAt, i18n.language)
  const endsAt = formatEventWhen(event.endsAt, i18n.language)
  const addressText = event.address ? formatEventAddress(event.address) : null
  const latitude = event.address?.latitude
  const longitude = event.address?.longitude
  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number'
  const hasSchedule = Boolean(startsAt || endsAt)

  return (
    <article className="flex flex-col gap-0 relative z-10 space-y-6">
      <Link
        to={WEB_ROUTES.events()}
        className="inline-flex w-fit gap-1.5 font-label text-sm text-on-surface-variant transition-colors duration-(--duration-fast) ease-emphasized hover:text-on-surface motion-reduce:transition-none"
      >
        <ArrowLeft className="size-3.5 shrink-0 opacity-70" aria-hidden strokeWidth={1.75} />
        {t('discover.detail.backToEvents')}
      </Link>

      <div className="relative z-10 mt-6 w-full">
        <EventDetailCarousel images={event.images} eventName={event.name} variant="hero" />
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className={PAGE_HEADER_HEADING}>{event.name}</h1>
          {event.locationName ? (
            <p className="mt-2.5 flex items-start gap-1.5 font-label text-sm text-on-surface-variant sm:mt-3">
              <MapPin
                className="mt-0.5 size-3.5 shrink-0 opacity-70"
                aria-hidden
                strokeWidth={1.75}
              />
              <span className="min-w-0 text-pretty">{event.locationName}</span>
            </p>
          ) : null}
        </div>
        <div className="shrink-0 self-start">
          <EventDetailShareButton eventName={event.name} />
        </div>
      </header>

      <div className="grid gap-8 lg:mt-10 lg:grid-cols-12 lg:items-start lg:gap-10">
        <div className="order-2 flex min-w-0 flex-col gap-10 lg:order-1 lg:col-span-8">
          {hasSchedule ? (
            <section aria-labelledby="event-detail-schedule">
              <h2 id="event-detail-schedule" className={SECTION_HEADING}>
                {t('discover.detail.schedule')}
              </h2>
              <dl className="mt-4 flex flex-col gap-3">
                {startsAt ? (
                  <div className="grid gap-0.5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-0">
                    <dt className="font-label text-sm text-on-surface-variant">
                      {t('discover.detail.startsAt')}
                    </dt>
                    <dd className="font-body text-base leading-relaxed text-on-surface">
                      {startsAt}
                    </dd>
                  </div>
                ) : null}
                {endsAt ? (
                  <div className="grid gap-0.5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-0">
                    <dt className="font-label text-sm text-on-surface-variant">
                      {t('discover.detail.endsAt')}
                    </dt>
                    <dd className="font-body text-base leading-relaxed text-on-surface">
                      {endsAt}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          {event.description ? (
            <section aria-labelledby="event-detail-description">
              <h2 id="event-detail-description" className={SECTION_HEADING}>
                {t('discover.detail.description')}
              </h2>
              <p className="mt-4 max-w-[65ch] whitespace-pre-wrap font-body text-base leading-relaxed text-pretty text-on-surface-variant">
                {event.description}
              </p>
            </section>
          ) : null}

          <section aria-labelledby="event-detail-address">
            <h2 id="event-detail-address" className={SECTION_HEADING}>
              {t('discover.detail.address')}
            </h2>
            {addressText ? (
              <p className="mt-4 max-w-[65ch] font-body text-base leading-relaxed text-pretty text-on-surface-variant">
                {addressText}
              </p>
            ) : (
              <p className="mt-4 font-body text-base text-on-surface-variant">
                {t('discover.detail.noAddress')}
              </p>
            )}
            {!hasCoordinates && addressText ? (
              <p className="mt-2 font-label text-sm text-on-surface-variant/80">
                {t('discover.list.noCoordinatesHint')}
              </p>
            ) : null}
          </section>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <EventDetailPurchasePanel startsAt={event.startsAt} />
          </div>
        </div>
      </div>

      {event.locationImages.length > 0 ? (
        <section
          aria-labelledby="event-detail-location-gallery"
          className="mt-12 flex flex-col gap-4 border-t border-hairline/20 pt-10 sm:mt-16 sm:pt-12"
        >
          <div className="max-w-2xl">
            <h2 id="event-detail-location-gallery" className={SECTION_HEADING}>
              {t('discover.detail.locationGallery')}
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-pretty text-on-surface-variant">
              {t('discover.detail.locationGalleryHint')}
            </p>
          </div>
          <EventDetailCarousel
            images={event.locationImages}
            eventName={event.locationName}
            variant="gallery"
            ariaLabelKey="discover.detail.locationCarouselAriaLabel"
            altKey="discover.detail.locationCarouselAlt"
          />
        </section>
      ) : null}

      {hasCoordinates ? (
        <section aria-labelledby="event-detail-map" className="mt-12 flex flex-col gap-4 sm:mt-14">
          <h2 id="event-detail-map" className={SECTION_HEADING}>
            {t('discover.detail.map')}
          </h2>
          <EventDetailMap latitude={latitude} longitude={longitude} eventName={event.name} />
        </section>
      ) : null}
    </article>
  )
}
