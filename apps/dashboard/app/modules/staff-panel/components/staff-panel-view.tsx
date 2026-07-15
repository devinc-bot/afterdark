import { useTranslation } from 'react-i18next'
import { Button } from '@afterdark/ui'
import { ScanLine } from 'lucide-react'
import { PageLayout } from '~/modules/common/components/page-layout'
import { usePageTitle } from '@afterdark/ui'
import { AttendeeRecords } from '~/modules/staff-panel/components/attendee-records'
import { ATTENDEE_RECORDS_MOCK } from '~/modules/staff-panel/constants/attendees.mock'

export function StaffPanelView() {
  const { t } = useTranslation('dashboard')
  usePageTitle('dashboard', 'pages.panel.staff.metaTitle')

  return (
    <PageLayout title={t('pages.panel.title')} description={t('pages.panel.staff.description')}>
      <div className="flex flex-col gap-6">
        <div>
          <Button type="button" iconLeft={<ScanLine aria-hidden="true" />}>
            {t('pages.panel.staff.scan')}
          </Button>
        </div>
        <AttendeeRecords records={ATTENDEE_RECORDS_MOCK} />
      </div>
    </PageLayout>
  )
}
