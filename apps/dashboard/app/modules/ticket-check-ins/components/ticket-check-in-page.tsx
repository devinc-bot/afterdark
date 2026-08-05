import { useTranslation } from 'react-i18next'
import { PageLayout } from '~/modules/common/components/page-layout'
import { TicketScanner } from './ticket-scanner'

export function TicketCheckInPage() {
  const { t } = useTranslation('dashboard')

  return (
    <PageLayout
      title={t('pages.qrTicket.title')}
      description={t('pages.qrTicket.description')}
      narrow
    >
      <TicketScanner />
    </PageLayout>
  )
}
