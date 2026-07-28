import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  NotImage,
  VT,
  cn,
  vtStyle,
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
}

export function EventDetailCarousel({ images, eventName, className }: EventDetailCarouselProps) {
  const { t } = useTranslation('events')
  const reduceMotion = usePrefersReducedMotion()
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const tweenFactor = useRef(0)
  const tweenNodes = useRef<Array<HTMLElement | null>>([])
  const enableParallax = !reduceMotion

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
          'min-h-0 w-full border border-hairline/40 aspect-video rounded-none sm:aspect-19/9 sm:rounded-app-lg',
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
        align: 'start',
        loop: showControls,
      }}
      className={cn('relative w-full', className)}
      aria-label={t('discover.detail.carouselAriaLabel')}
    >
      <CarouselContent className="ml-0">
        {images.map((image, index) => (
          <CarouselItem
            key={image.documentId}
            className={cn(
              showControls ? 'basis-full pl-0 sm:basis-[94%] sm:pl-3' : 'basis-full pl-0'
            )}
          >
            <div
              className="overflow-hidden aspect-video rounded-none sm:aspect-19/9 sm:rounded-app-lg"
              style={index === 0 ? vtStyle(VT.eventHero) : undefined}
            >
              <div
                data-parallax-layer
                className="relative flex h-full w-full items-center justify-center will-change-transform"
              >
                <img
                  src={image.url}
                  alt={t('discover.detail.carouselAlt', { name: eventName })}
                  className={cn(
                    'h-full object-cover',
                    enableParallax ? 'max-w-none flex-[0_0_115%]' : 'w-full'
                  )}
                  draggable={false}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : undefined}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent sm:rounded-app-lg"
                  aria-hidden
                />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {showControls ? (
        <div className="flex items-center justify-center p-4 sm:p-5">
          <div className="relative flex w-full items-center justify-center gap-1 rounded-full bg-surface-strong p-1 sm:w-auto">
            <CarouselPrevious
              variant="ghost"
              className="static top-auto left-auto size-10 translate-x-0 translate-y-0 rounded-full border-0 shadow-none"
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
              className="static top-auto right-auto size-10 translate-x-0 translate-y-0 rounded-full border-0 shadow-none"
              aria-label={t('discover.detail.carouselNext')}
            />
          </div>
        </div>
      ) : null}
    </Carousel>
  )
}
