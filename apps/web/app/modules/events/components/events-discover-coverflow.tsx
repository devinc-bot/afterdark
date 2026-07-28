import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Autoplay,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  cn,
  type CarouselApi,
} from '@repo/ui'
import type { EventsDiscoverCoverflowSlide } from '../utils/events-discover-coverflow'

const TWEEN_FACTOR_BASE = 0.2
const AUTOPLAY_DELAY_MS = 4500

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

type EventsDiscoverCoverflowProps = {
  slides: EventsDiscoverCoverflowSlide[]
  onActivate: (documentId: string) => void
  className?: string
}

export function EventsDiscoverCoverflow({
  slides,
  onActivate,
  className,
}: EventsDiscoverCoverflowProps) {
  const { t } = useTranslation('events')
  const reduceMotion = usePrefersReducedMotion()
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loadedIndexes, setLoadedIndexes] = useState<ReadonlySet<number>>(() => new Set([0]))
  const tweenFactor = useRef(0)
  const tweenNodes = useRef<Array<HTMLElement | null>>([])
  const autoplay = useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY_MS,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      playOnInit: false,
    })
  )

  const updateSlidesInView = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return

    const slideCount = carouselApi.slideNodes().length
    const selected = carouselApi.selectedScrollSnap()
    const nextToLoad = new Set(carouselApi.slidesInView())
    nextToLoad.add(selected)
    if (slideCount > 1) {
      nextToLoad.add((selected + 1) % slideCount)
    }

    setLoadedIndexes((prev) => {
      let changed = false
      const next = new Set(prev)
      for (const index of nextToLoad) {
        if (!next.has(index)) {
          next.add(index)
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [])

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
      tweenFactor.current = reduceMotion
        ? 0
        : TWEEN_FACTOR_BASE * carouselApi.scrollSnapList().length
    },
    [reduceMotion]
  )

  const tweenParallax = useCallback(
    (carouselApi: CarouselApi, eventName?: string) => {
      if (!carouselApi) return

      if (reduceMotion || tweenFactor.current === 0) {
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
    [clearParallax, reduceMotion]
  )

  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
      updateSlidesInView(api)
    }

    setTweenNodes(api)
    setTweenFactor(api)
    tweenParallax(api)
    updateSlidesInView(api)
    onSelect()

    api
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenParallax)
      .on('reInit', updateSlidesInView)
      .on('reInit', onSelect)
      .on('scroll', tweenParallax)
      .on('slideFocus', tweenParallax)
      .on('slidesInView', updateSlidesInView)
      .on('select', onSelect)

    return () => {
      api
        .off('reInit', setTweenNodes)
        .off('reInit', setTweenFactor)
        .off('reInit', tweenParallax)
        .off('reInit', updateSlidesInView)
        .off('reInit', onSelect)
        .off('scroll', tweenParallax)
        .off('slideFocus', tweenParallax)
        .off('slidesInView', updateSlidesInView)
        .off('select', onSelect)
    }
  }, [api, setTweenFactor, setTweenNodes, tweenParallax, updateSlidesInView])

  useEffect(() => {
    if (!api || slides.length < 2) return

    if (reduceMotion) {
      autoplay.current.stop()
      return
    }

    void autoplay.current.play()
  }, [api, reduceMotion, slides.length])

  if (slides.length === 0) {
    return null
  }

  const showControls = slides.length > 1

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: showControls ? 'center' : 'start',
        loop: showControls,
      }}
      plugins={showControls ? [autoplay.current] : undefined}
      className={cn('relative w-full', className)}
      aria-label={t('discover.coverflow.ariaLabel')}
    >
      <CarouselContent className={showControls ? '-ml-3' : 'ml-0'}>
        {slides.map((slide, index) => {
          const isLoaded = loadedIndexes.has(index)

          return (
            <CarouselItem
              key={slide.documentId}
              className={showControls ? 'basis-[86%] pl-3 sm:basis-[88%]' : 'basis-full pl-0'}
            >
              <button
                type="button"
                className="relative aspect-19/9 w-full cursor-pointer overflow-hidden rounded-app-lg border-0 bg-transparent p-0"
                onClick={() => onActivate(slide.documentId)}
                aria-label={slide.title}
              >
                <div
                  data-parallax-layer
                  className="relative flex h-full w-full items-center justify-center will-change-transform"
                >
                  {isLoaded ? (
                    <img
                      src={slide.src}
                      alt={slide.title}
                      className={cn(
                        'h-full object-cover',
                        reduceMotion ? 'w-full' : 'max-w-none flex-[0_0_115%]'
                      )}
                      draggable={false}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : undefined}
                    />
                  ) : (
                    <div className="h-full w-full bg-surface-strong" aria-hidden />
                  )}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-app-lg bg-linear-to-t from-black/70 via-black/10 to-transparent"
                    aria-hidden
                  />
                </div>
                <span className="pointer-events-none absolute bottom-3 left-3 right-3 w-fit max-w-[min(100%-1.5rem,42rem)] rounded-app bg-background/5 px-5 py-3 text-left font-display text-lg font-semibold text-balance text-white drop-shadow backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-6 sm:text-2xl">
                  {slide.title}
                </span>
              </button>
            </CarouselItem>
          )
        })}
      </CarouselContent>

      {showControls ? (
        <div className="flex flex-col items-center gap-3 p-4 text-center sm:p-5">
          <div className="relative flex w-full items-center justify-center gap-1 p-2 rounded-full bg-surface-strong sm:w-auto">
            <CarouselPrevious
              variant="ghost"
              className="static top-auto left-auto size-10 translate-x-0 translate-y-0 rounded-full border-0 shadow-none"
              aria-label={t('discover.coverflow.prev')}
            />

            <div className="flex items-center gap-1.5 px-1">
              {slides.map((slide, i) => (
                <button
                  key={slide.documentId}
                  type="button"
                  onClick={() => api?.scrollTo(i)}
                  aria-label={slide.title}
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
              aria-label={t('discover.coverflow.next')}
            />
          </div>
        </div>
      ) : null}
    </Carousel>
  )
}
