import { useTranslation } from 'react-i18next'
import { cn } from '@repo/ui'
import { LANDING_IMAGES } from '../../constants/images'
import { LANDING_SHELL } from '../../constants/layout'
import { Reveal } from '../reveal'
import { ScrollZoomImage } from '../scroll-zoom-image'

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
          className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-background"
        />
      </div>

      <div
        className={cn(
          LANDING_SHELL,
          'relative flex min-h-[min(72vh,44rem)] flex-col justify-end py-[clamp(4rem,10vw,7rem)]'
        )}
      >
        <Reveal>
          <blockquote className="max-w-[22ch]">
            <p
              id="atmosphere-heading"
              className="font-display text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-[1.12] tracking-[-0.02em] text-balance text-white"
            >
              {t('atmosphere.quote')}
            </p>
          </blockquote>
          <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-pretty text-white/85 sm:text-lg">
            {t('atmosphere.support')}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
