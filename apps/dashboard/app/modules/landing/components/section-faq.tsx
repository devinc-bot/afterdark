import { useTranslation } from 'react-i18next'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui'
import { LANDING_FAQ_KEYS } from '../constants/landing-content'

export function SectionFaq() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-20 border-b border-hairline/60 bg-surface-container-lowest"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-margin-mobile py-[clamp(4rem,8vw,6.5rem)] md:grid-cols-12 md:gap-16 md:px-margin-desktop">
        <div className="md:col-span-4">
          <h2
            id="faq-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('faq.headline')}
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue={LANDING_FAQ_KEYS[0]}
          className="md:col-span-8"
        >
          {LANDING_FAQ_KEYS.map((key) => (
            <AccordionItem key={key} value={key} className="border-hairline/50 first:border-t-0">
              <AccordionTrigger className="text-left font-display text-base font-semibold tracking-tight hover:no-underline sm:text-lg">
                {t(`faq.items.${key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="max-w-[56ch] text-base leading-relaxed text-pretty text-on-surface-variant">
                {t(`faq.items.${key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
