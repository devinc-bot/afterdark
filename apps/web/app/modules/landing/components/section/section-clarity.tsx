import { Ticket, ShieldCheck, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@repo/ui'
import { Container } from '~/modules/common/components/container'
import { LANDING_HEADING, LANDING_SECTION_Y } from '../../constants/layout'
import { Reveal } from '../reveal'

const CLARITY_ITEMS = [
  { id: 'ticket', Icon: Ticket },
  { id: 'secure', Icon: ShieldCheck },
  { id: 'time', Icon: Clock3 },
] as const

type SectionClarityProps = {
  className?: string
}

export function SectionClarity({ className }: SectionClarityProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      id="claridad"
      aria-labelledby="clarity-heading"
      className={cn('scroll-mt-24 border-t border-hairline/40', className)}
    >
      <Container className={LANDING_SECTION_Y}>
        <Reveal>
          <div className="max-w-2xl">
            <h2 id="clarity-heading" className={cn(LANDING_HEADING, 'text-on-surface')}>
              {t('clarity.headline')}
            </h2>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
              {t('clarity.support')}
            </p>
          </div>

          <ul className="mt-14 grid gap-0 border-t border-hairline/50 md:grid-cols-3 md:divide-x md:divide-hairline/50">
            {CLARITY_ITEMS.map(({ id, Icon }, index) => (
              <li
                key={id}
                className={cn(
                  'flex flex-col gap-5 border-b border-hairline/50 py-10 last:border-b-0 md:border-b-0 md:px-8 md:pt-10 md:first:pl-0 md:last:pr-0',
                  index === 0 && 'md:pl-0'
                )}
              >
                <Icon
                  className="size-8 text-on-surface-variant"
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                  aria-hidden
                />
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-balance text-on-surface">
                    {t(`clarity.items.${id}.title`)}
                  </h3>
                  <p className="mt-3 max-w-[34ch] text-base leading-relaxed text-pretty text-on-surface-variant">
                    {t(`clarity.items.${id}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}
