import { useTranslation } from 'react-i18next'
import { cn } from '@repo/ui'
import { Container } from '~/modules/common/components/container'
import { LANDING_IMAGES } from '../../constants/images'
import { LANDING_HEADING } from '../../constants/layout'
import { Reveal } from '../reveal'

type SectionAboutProps = {
  className?: string
}

export function SectionAbout({ className }: SectionAboutProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      aria-labelledby="about-heading"
      className={cn('relative z-20 -mt-10 sm:-mt-14 md:-mt-16', className)}
    >
      <Container>
        <Reveal>
          <div className="overflow-hidden rounded-app bg-surface-container-low/40 p-2 panel backdrop-blur-2xl backdrop-saturate-150">
            <div className="grid gap-0 md:grid-cols-12">
              <div className="flex flex-col justify-center gap-5 px-margin-mobile py-10 md:col-span-5 md:px-10 lg:px-12 lg:py-14">
                <h2 id="about-heading" className={cn(LANDING_HEADING, 'text-on-surface')}>
                  {t('about.headline')}
                </h2>
                <p className="max-w-[42ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
                  {t('about.body')}
                </p>
              </div>
              <div className="relative aspect-4/3 overflow-hidden rounded-app-sm bg-surface-container md:col-span-7 md:aspect-auto md:min-h-88">
                <img
                  src={LANDING_IMAGES.about.src}
                  srcSet={LANDING_IMAGES.about.srcSet}
                  sizes="(min-width: 768px) 58vw, 100vw"
                  width={1400}
                  height={1050}
                  alt={t('about.imageAlt')}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
