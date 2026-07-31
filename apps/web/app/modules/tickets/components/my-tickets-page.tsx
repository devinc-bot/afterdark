import { useTranslation } from 'react-i18next'
import { PageAtmosphereWash } from '~/modules/common/components/page-atmosphere-wash'
import { Container } from '~/modules/common/components/container'
import { PageHeader } from '~/modules/common/components/page-header'
import { MOCK_TICKETS } from '../constants/mock-tickets'
import { TicketCard } from './ticket-card'

export function MyTicketsPage() {
  const { t } = useTranslation('tickets')

  return (
    <Container>
      <div className="relative mx-auto w-full max-w-5xl">
        <PageAtmosphereWash className="h-40" />

        <PageHeader title={t('mine.page.title')} description={t('mine.page.description')} />

        <ul
          className="relative grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] sm:gap-7"
          aria-label={t('mine.list.ariaLabel')}
        >
          {MOCK_TICKETS.map((ticket) => (
            <li key={ticket.id} className="min-w-0">
              <TicketCard ticket={ticket} />
            </li>
          ))}
        </ul>
      </div>
    </Container>
  )
}
