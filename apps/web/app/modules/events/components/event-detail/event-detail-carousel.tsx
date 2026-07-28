import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  NotImage,
  cn,
  type CarouselApi,
} from '@repo/ui'
import type { EventImageResponse } from '@repo/types'

const TWEEN_FACTOR_BASE = 0.2

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return reduced
}

type EventDetailCarouselProps = {
  images: EventImageResponse[]
  eventName: string
  className?: string
  /** Hero = committed event media. Gallery = quieter venue strip. */
  variant?: 'hero' | 'gallery'
  ariaLabelKey?: 'discover.detail.carouselAriaLabel' | 'discover.detail.locationCarouselAriaLabel'
  altKey?: 'discover.detail.carouselAlt' | 'discover.detail.locationCarouselAlt'
}

export function EventDetailCarousel({
  images,
  eventName,
  className,
  variant = 'hero',
  ariaLabelKey = 'discover.detail.carouselAriaLabel',
  altKey = 'discover.detail.carouselAlt',
}: EventDetailCarouselProps) {
  const { t } = useTranslation('events')
  const reduceMotion = usePrefersReducedMotion()
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const tweenFactor = useRef(0)
  const tweenNodes = useRef<Array<HTMLElement | null>>([])
  const isHero = variant === 'hero'
  const enableParallax = isHero && !reduceMotion

  const clearParallax = useCallback(() => {
    tweenNodes.current.forEach((node) => {
      if (node) {
        node.style.transform = ''
      }
    })
  }, [])

  const setTweenNodes = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return
    tweenNodes.current = carouselApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector<HTMLElement>('[data-parallax-layer]')
    })
  }, [])

  const setTweenFactor = useCallback(
    (carouselApi: CarouselApi) => {
      if (!carouselApi) return
      tweenFactor.current = enableParallax
        ? TWEEN_FACTOR_BASE * carouselApi.scrollSnapList().length
        : 0
    },
    [enableParallax]
  )

  const tweenParallax = useCallback(
    (carouselApi: CarouselApi, eventName?: string) => {
      if (!carouselApi) return

      if (!enableParallax || tweenFactor.current === 0) {
        clearParallax()
        return
      }

      const engine = carouselApi.internalEngine()
      const scrollProgress = carouselApi.scrollProgress()
      const slidesInView = carouselApi.slidesInView()
      const isScrollEvent = eventName === 'scroll'

      carouselApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress
        const slidesInSnap = engine.slideRegistry[snapIndex]

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) {
            return
          }

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target()
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target)
                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress)
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress)
                }
              }
            })
          }

          const translate = diffToTarget * (-1 * tweenFactor.current) * 100
          const tweenNode = tweenNodes.current[slideIndex]
          if (tweenNode) {
            tweenNode.style.transform = `translateX(${translate}%)`
          }
        })
      })
    },
    [clearParallax, enableParallax]
  )

  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
    }

    setTweenNodes(api)
    setTweenFactor(api)
    tweenParallax(api)
    onSelect()

    api
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenParallax)
      .on('reInit', onSelect)
      .on('scroll', tweenParallax)
      .on('slideFocus', tweenParallax)
      .on('select', onSelect)

    return () => {
      api
        .off('reInit', setTweenNodes)
        .off('reInit', setTweenFactor)
        .off('reInit', tweenParallax)
        .off('reInit', onSelect)
        .off('scroll', tweenParallax)
        .off('slideFocus', tweenParallax)
        .off('select', onSelect)
    }
  }, [api, setTweenFactor, setTweenNodes, tweenParallax])

  if (images.length === 0) {
    return (
      <NotImage
        size="full"
        label={t('discover.list.noImage')}
        className={cn(
          'min-h-0 w-full border border-hairline/40',
          isHero
            ? 'aspect-video rounded-none sm:aspect-19/9 sm:rounded-app-lg'
            : 'aspect-4/3 rounded-app',
          className
        )}
      />
    )
  }

  const showControls = images.length > 1

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: isHero ? 'start' : showControls ? 'start' : 'start',
        loop: showControls,
      }}
      className={cn('relative w-full', className)}
      aria-label={t(ariaLabelKey)}
    >
      <CarouselContent className={showControls ? (isHero ? 'ml-0' : '-ml-2') : 'ml-0'}>
        {images.map((image, index) => (
          <CarouselItem
            key={image.documentId}
            className={cn(
              isHero
                ? showControls
                  ? 'basis-full pl-0 sm:basis-[94%] sm:pl-3'
                  : 'basis-full pl-0'
                : showControls
                  ? 'basis-[78%] pl-2 sm:basis-[46%]'
                  : 'basis-full pl-0'
            )}
          >
            <div
              className={cn(
                'overflow-hidden',
                isHero
                  ? 'aspect-video rounded-none sm:aspect-19/9 sm:rounded-app-lg'
                  : 'aspect-4/3 rounded-app'
              )}
            >
              <div
                data-parallax-layer
                className="relative flex h-full w-full items-center justify-center will-change-transform"
              >
                <img
                  src={image.url}
                  alt={t(altKey, { name: eventName })}
                  className={cn(
                    'h-full object-cover',
                    enableParallax ? 'max-w-none flex-[0_0_115%]' : 'w-full'
                  )}
                  draggable={false}
                  loading={isHero && index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={isHero && index === 0 ? 'high' : undefined}
                />
                {isHero ? (
                  <div
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent sm:rounded-app-lg"
                    aria-hidden
                  />
                ) : null}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {showControls ? (
        <div className={cn('flex items-center justify-center', isHero ? 'p-4 sm:p-5' : 'pt-3')}>
          <div
            className={cn(
              'relative flex w-full items-center justify-center gap-1 sm:w-auto',
              isHero ? 'rounded-full bg-surface-strong p-1' : 'gap-2'
            )}
          >
            <CarouselPrevious
              variant="ghost"
              className={cn(
                'static top-auto left-auto size-10 translate-x-0 translate-y-0 rounded-full border-0 shadow-none',
                !isHero && 'size-8'
              )}
              aria-label={t('discover.detail.carouselPrev')}
            />

            <div className="flex items-center gap-1.5 px-1">
              {images.map((image, i) => (
                <button
                  key={image.documentId}
                  type="button"
                  onClick={() => api?.scrollTo(i)}
                  aria-label={t('discover.detail.carouselDotAlt', {
                    name: eventName,
                    index: i + 1,
                  })}
                  aria-current={selectedIndex === i ? 'true' : undefined}
                  className={cn(
                    'h-1.5 cursor-pointer rounded-full border-0 transition-all duration-300',
                    selectedIndex === i
                      ? 'w-5 bg-on-surface'
                      : 'w-1.5 bg-on-surface/30 hover:bg-on-surface/50'
                  )}
                />
              ))}
            </div>

            <CarouselNext
              variant="ghost"
              className={cn(
                'static top-auto right-auto size-10 translate-x-0 translate-y-0 rounded-full border-0 shadow-none',
                !isHero && 'size-8'
              )}
              aria-label={t('discover.detail.carouselNext')}
            />
          </div>
        </div>
      ) : null}
    </Carousel>
  )
}
