import { useTranslation } from 'react-i18next'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@afterdark/ui'
import { LANDING_FAQ_KEYS } from '../constants/landing-content'

export function SectionFaq() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-20 border-b border-hairline/60 bg-surface-container-lowest"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-margin-mobile py-[clamp(4rem,8vw,6rem)] md:grid-cols-12 md:px-margin-desktop">
        <div className="md:col-span-4">
          <p className="font-label text-sm font-medium tracking-label-sm text-primary uppercase">
            {t('faq.eyebrow')}
          </p>
          <h2
            id="faq-heading"
            className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
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
            <AccordionItem key={key} value={key} className="first:border-t-0">
              <AccordionTrigger>{t(`faq.items.${key}.question`)}</AccordionTrigger>
              <AccordionContent>{t(`faq.items.${key}.answer`)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
