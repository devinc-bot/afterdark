import { useTranslation } from 'react-i18next'
import type { EventFaqResponse } from '@repo/types'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui'

const SECTION_HEADING =
  'font-display text-lg font-semibold tracking-tight text-balance text-on-surface'

type EventDetailFaqProps = {
  faqs: EventFaqResponse[]
}

export function EventDetailFaq({ faqs }: EventDetailFaqProps) {
  const { t } = useTranslation('events')

  if (faqs.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="event-detail-faq">
      <h2 id="event-detail-faq" className={SECTION_HEADING}>
        {t('discover.detail.faq')}
      </h2>
      <Accordion
        type="single"
        collapsible
        className="mt-4 w-full"
        aria-label={t('discover.detail.faqAriaLabel')}
      >
        {faqs.map((faq) => (
          <AccordionItem key={faq.documentId} value={faq.documentId}>
            <AccordionTrigger className="text-base hover:no-underline sm:text-lg">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="max-w-[65ch] font-body text-base leading-relaxed text-pretty text-on-surface-variant">
              <p className="whitespace-pre-wrap">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
