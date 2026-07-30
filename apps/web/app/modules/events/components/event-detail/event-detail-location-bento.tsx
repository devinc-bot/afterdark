import { useTranslation } from 'react-i18next'
import { NotImage, cn } from '@repo/ui'
import type { EventImageResponse } from '@repo/types'

type EventDetailLocationBentoProps = {
  images: EventImageResponse[]
  locationName: string
  className?: string
}

type BentoSlot = {
  outer: string
  shell: string
  inner: string
  ring: string
}

/** Classic Tailwind-style 3×2 bento — left/right tall, middle stacked. */
const BENTO_FOUR: BentoSlot[] = [
  {
    outer: 'relative min-h-64 sm:min-h-80 lg:row-span-2 lg:min-h-[28rem]',
    shell: 'absolute inset-px rounded-app bg-surface-container-low lg:rounded-l-app-xl',
    inner:
      'relative size-full overflow-hidden rounded-[calc(var(--radius-app)+1px)] lg:rounded-l-[calc(var(--radius-app-xl)+1px)]',
    ring: 'pointer-events-none absolute inset-px rounded-app shadow-sm outline outline-hairline/35 lg:rounded-l-app-xl',
  },
  {
    outer: 'relative min-h-48 max-lg:row-start-1 sm:min-h-56',
    shell: 'absolute inset-px rounded-app bg-surface-container-low max-lg:rounded-t-app-xl',
    inner:
      'relative size-full overflow-hidden rounded-[calc(var(--radius-app)+1px)] max-lg:rounded-t-[calc(var(--radius-app-xl)+1px)]',
    ring: 'pointer-events-none absolute inset-px rounded-app shadow-sm outline outline-hairline/35 max-lg:rounded-t-app-xl',
  },
  {
    outer: 'relative min-h-48 max-lg:row-start-3 sm:min-h-56 lg:col-start-2 lg:row-start-2',
    shell: 'absolute inset-px rounded-app bg-surface-container-low',
    inner: 'relative size-full overflow-hidden rounded-[calc(var(--radius-app)+1px)]',
    ring: 'pointer-events-none absolute inset-px rounded-app shadow-sm outline outline-hairline/35',
  },
  {
    outer: 'relative min-h-64 sm:min-h-80 lg:row-span-2 lg:min-h-[28rem]',
    shell:
      'absolute inset-px rounded-app bg-surface-container-low max-lg:rounded-b-app-xl lg:rounded-r-app-xl',
    inner:
      'relative size-full overflow-hidden rounded-[calc(var(--radius-app)+1px)] max-lg:rounded-b-[calc(var(--radius-app-xl)+1px)] lg:rounded-r-[calc(var(--radius-app-xl)+1px)]',
    ring: 'pointer-events-none absolute inset-px rounded-app shadow-sm outline outline-hairline/35 max-lg:rounded-b-app-xl lg:rounded-r-app-xl',
  },
]

const BENTO_THREE: BentoSlot[] = [
  {
    outer: 'relative min-h-64 sm:min-h-80 lg:row-span-2 lg:min-h-[28rem]',
    shell: 'absolute inset-px rounded-app bg-surface-container-low lg:rounded-l-app-xl',
    inner:
      'relative size-full overflow-hidden rounded-[calc(var(--radius-app)+1px)] lg:rounded-l-[calc(var(--radius-app-xl)+1px)]',
    ring: 'pointer-events-none absolute inset-px rounded-app shadow-sm outline outline-hairline/35 lg:rounded-l-app-xl',
  },
  {
    outer: 'relative min-h-48 max-lg:row-start-1 sm:min-h-56',
    shell: 'absolute inset-px rounded-app bg-surface-container-low max-lg:rounded-t-app-xl',
    inner:
      'relative size-full overflow-hidden rounded-[calc(var(--radius-app)+1px)] max-lg:rounded-t-[calc(var(--radius-app-xl)+1px)]',
    ring: 'pointer-events-none absolute inset-px rounded-app shadow-sm outline outline-hairline/35 max-lg:rounded-t-app-xl',
  },
  {
    outer: 'relative min-h-48 max-lg:row-start-3 sm:min-h-56',
    shell:
      'absolute inset-px rounded-app bg-surface-container-low max-lg:rounded-b-app-xl lg:rounded-r-app-xl',
    inner:
      'relative size-full overflow-hidden rounded-[calc(var(--radius-app)+1px)] max-lg:rounded-b-[calc(var(--radius-app-xl)+1px)] lg:rounded-r-[calc(var(--radius-app-xl)+1px)]',
    ring: 'pointer-events-none absolute inset-px rounded-app shadow-sm outline outline-hairline/35 max-lg:rounded-b-app-xl lg:rounded-r-app-xl',
  },
]

const BENTO_TWO: BentoSlot[] = [
  {
    outer: 'relative min-h-64 sm:min-h-80',
    shell:
      'absolute inset-px rounded-app bg-surface-container-low max-lg:rounded-t-app-xl lg:rounded-l-app-xl',
    inner:
      'relative size-full overflow-hidden rounded-[calc(var(--radius-app)+1px)] max-lg:rounded-t-[calc(var(--radius-app-xl)+1px)] lg:rounded-l-[calc(var(--radius-app-xl)+1px)]',
    ring: 'pointer-events-none absolute inset-px rounded-app shadow-sm outline outline-hairline/35 max-lg:rounded-t-app-xl lg:rounded-l-app-xl',
  },
  {
    outer: 'relative min-h-64 sm:min-h-80',
    shell:
      'absolute inset-px rounded-app bg-surface-container-low max-lg:rounded-b-app-xl lg:rounded-r-app-xl',
    inner:
      'relative size-full overflow-hidden rounded-[calc(var(--radius-app)+1px)] max-lg:rounded-b-[calc(var(--radius-app-xl)+1px)] lg:rounded-r-[calc(var(--radius-app-xl)+1px)]',
    ring: 'pointer-events-none absolute inset-px rounded-app shadow-sm outline outline-hairline/35 max-lg:rounded-b-app-xl lg:rounded-r-app-xl',
  },
]

function BentoTile({
  image,
  alt,
  slot,
  priority,
}: {
  image: EventImageResponse
  alt: string
  slot: BentoSlot
  priority?: boolean
}) {
  return (
    <div className={slot.outer}>
      <div className={slot.shell} aria-hidden />
      <div className={slot.inner}>
        {image.url ? (
          <img
            src={image.url}
            alt={alt}
            className="size-full object-cover transition-transform duration-(--duration-normal) ease-emphasized hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            draggable={false}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-surface-container">
            <NotImage size="sm" />
          </div>
        )}
      </div>
      <div className={slot.ring} aria-hidden />
    </div>
  )
}

function ExtraTile({ image, alt }: { image: EventImageResponse; alt: string }) {
  return (
    <div className="relative min-h-48 sm:min-h-56">
      <div className="absolute inset-px rounded-app bg-surface-container-low" aria-hidden />
      <div className="relative size-full overflow-hidden rounded-[calc(var(--radius-app)+1px)]">
        {image.url ? (
          <img
            src={image.url}
            alt={alt}
            className="size-full object-cover transition-transform duration-(--duration-normal) ease-emphasized hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-surface-container">
            <NotImage size="sm" />
          </div>
        )}
      </div>
      <div
        className="pointer-events-none absolute inset-px rounded-app shadow-sm outline outline-hairline/35"
        aria-hidden
      />
    </div>
  )
}

export function EventDetailLocationBento({
  images,
  locationName,
  className,
}: EventDetailLocationBentoProps) {
  const { t } = useTranslation('events')
  const name = locationName.trim() || t('discover.detail.locationGallery')
  const alt = (index: number) => t('discover.detail.locationBentoAlt', { name, index: index + 1 })

  if (images.length === 0) {
    return null
  }

  if (images.length === 1) {
    const image = images[0]!
    return (
      <div
        className={cn('relative min-h-64 w-full sm:min-h-80', className)}
        role="group"
        aria-label={t('discover.detail.locationBentoAriaLabel')}
      >
        <div className="absolute inset-px rounded-app-xl bg-surface-container-low" aria-hidden />
        <div className="relative size-full min-h-64 overflow-hidden rounded-[calc(var(--radius-app-xl)+1px)] sm:min-h-80">
          {image.url ? (
            <img
              src={image.url}
              alt={alt(0)}
              className="size-full object-cover"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-surface-container">
              <NotImage size="sm" />
            </div>
          )}
        </div>
        <div
          className="pointer-events-none absolute inset-px rounded-app-xl shadow-sm outline outline-hairline/35"
          aria-hidden
        />
      </div>
    )
  }

  if (images.length === 2) {
    return (
      <div
        className={cn('grid gap-4 lg:grid-cols-2', className)}
        role="group"
        aria-label={t('discover.detail.locationBentoAriaLabel')}
      >
        {images.map((image, index) => (
          <BentoTile
            key={image.documentId}
            image={image}
            alt={alt(index)}
            slot={BENTO_TWO[index]!}
            priority={index === 0}
          />
        ))}
      </div>
    )
  }

  if (images.length === 3) {
    return (
      <div
        className={cn('grid gap-4 lg:grid-cols-2 lg:grid-rows-2', className)}
        role="group"
        aria-label={t('discover.detail.locationBentoAriaLabel')}
      >
        {images.map((image, index) => (
          <BentoTile
            key={image.documentId}
            image={image}
            alt={alt(index)}
            slot={BENTO_THREE[index]!}
            priority={index === 0}
          />
        ))}
      </div>
    )
  }

  const featured = images.slice(0, 4)
  const extras = images.slice(4)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2"
        role="group"
        aria-label={t('discover.detail.locationBentoAriaLabel')}
      >
        {featured.map((image, index) => (
          <BentoTile
            key={image.documentId}
            image={image}
            alt={alt(index)}
            slot={BENTO_FOUR[index]!}
            priority={index === 0}
          />
        ))}
      </div>

      {extras.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {extras.map((image, index) => (
            <ExtraTile key={image.documentId} image={image} alt={alt(index + 4)} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
