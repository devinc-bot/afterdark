import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TICKET_STATUS } from '@afterdark/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@afterdark/ui'
import { KpiInformationTickets } from '~/modules/tickets/components/kpi-information-tickets'
import { TICKET_RECORDS_MOCK, TicketRecords } from '~/modules/tickets/components/ticket-record'
import { TICKET_TAB } from '~/modules/tickets/constants/tickets-tabs.constants'
import { PageLayout } from '~/modules/common/components/page-layout'

export function TicketsManagementView() {
  const { t } = useTranslation('tickets')
  const [activeTab, setActiveTab] = useState<string>(TICKET_TAB.ACTIVE)
  const records = TICKET_RECORDS_MOCK

  const activeRecords = useMemo(
    () => records.filter((record) => record.status === TICKET_STATUS.ACTIVE),
    [records]
  )

  const archivedRecords = useMemo(
    () => records.filter((record) => record.status === TICKET_STATUS.INACTIVE),
    [records]
  )

  return (
    <PageLayout title={t('page.title')} description={t('page.description')}>
      <KpiInformationTickets />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList variant="line" className="flex w-full gap-4 sm:w-auto">
            <TabsTrigger variant="line" value={TICKET_TAB.ACTIVE}>
              {t('tabs.active')}
            </TabsTrigger>
            <TabsTrigger variant="line" value={TICKET_TAB.ARCHIVED}>
              {t('tabs.archived')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={TICKET_TAB.ACTIVE} className="mt-0">
          <TicketRecords records={activeRecords} inventoryTab={TICKET_TAB.ACTIVE} />
        </TabsContent>

        <TabsContent value={TICKET_TAB.ARCHIVED} className="mt-0">
          <TicketRecords records={archivedRecords} inventoryTab={TICKET_TAB.ARCHIVED} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
