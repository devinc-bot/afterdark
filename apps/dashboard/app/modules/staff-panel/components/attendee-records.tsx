import { useTranslation } from 'react-i18next'
import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@afterdark/ui'
import type { AttendeeRecord } from '~/modules/staff-panel/constants/attendees.mock'
import { EntryStatusBadge } from '~/modules/staff-panel/components/entry-status-badge'

type AttendeeRecordsProps = {
  records: AttendeeRecord[]
}

export function AttendeeRecords({ records }: AttendeeRecordsProps) {
  const { t } = useTranslation('dashboard')

  if (records.length === 0) {
    return (
      <Card variant="gradient" className="px-6 py-10 text-center">
        <p className="text-sm text-ink-muted">{t('pages.panel.staff.table.empty')}</p>
      </Card>
    )
  }

  return (
    <Card variant="gradient">
      <Table variant="compact">
        <TableHeader>
          <TableRow>
            <TableHead className="p-6">{t('pages.panel.staff.table.name')}</TableHead>
            <TableHead className="p-6">{t('pages.panel.staff.table.event')}</TableHead>
            <TableHead className="p-6">{t('pages.panel.staff.table.entryStatusLabel')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="p-6 font-medium text-ink">{record.name}</TableCell>
              <TableCell className="p-6 text-ink-muted">{record.eventName}</TableCell>
              <TableCell className="p-6">
                <EntryStatusBadge status={record.entryStatus} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
