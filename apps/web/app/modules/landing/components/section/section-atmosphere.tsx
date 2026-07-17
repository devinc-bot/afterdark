import { useTranslation } from 'react-i18next'
import { cn } from '@afterdark/ui'
import { LANDING_IMAGES } from '../../constants/images'
import { Reveal } from '../reveal'
import { ScrollZoomImage } from '../scroll-zoom-image'

const SHELL = 'mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop'

type SectionAtmosphereProps = {
  className?: string
}

export function SectionAtmosphere({ className }: SectionAtmosphereProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      aria-labelledby="atmosphere-heading"
      className={cn('relative overflow-hidden border-t border-hairline/40', className)}
    >
      <div className="absolute inset-0">
        <ScrollZoomImage
          src={LANDING_IMAGES.atmosphere.src}
          srcSet={LANDING_IMAGES.atmosphere.srcSet}
          sizes="100vw"
          width={2400}
          height={1600}
          alt={t('atmosphere.imageAlt')}
          containerClassName="absolute inset-0"
          className="h-full w-full object-cover object-center"
          maxScale={1.35}
          loading="lazy"
          decoding="async"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-background/75 via-background/55 to-background/90"
        />
      </div>

      <div
        className={cn(
          SHELL,
          'relative flex min-h-[min(72vh,44rem)] flex-col justify-end py-[clamp(4rem,10vw,7rem)]'
        )}
      >
        <Reveal>
          <p className="font-label text-sm tracking-label-sm text-primary">
            {t('atmosphere.eyebrow')}
          </p>
          <blockquote className="mt-5 max-w-[22ch]">
            <p
              id="atmosphere-heading"
              className="font-display text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-[1.12] tracking-[-0.02em] text-balance text-on-surface"
            >
              {t('atmosphere.quote')}
            </p>
          </blockquote>
          <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('atmosphere.support')}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
