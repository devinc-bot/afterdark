import { useTranslation } from 'react-i18next'
import { Badge, cn } from '@repo/ui'
import {
  ATTENDEE_ENTRY_STATUS,
  type AttendeeEntryStatus,
} from '~/modules/staff-panel/constants/attendee-entry-status'

const entryStatusClassName: Record<AttendeeEntryStatus, string> = {
  [ATTENDEE_ENTRY_STATUS.VALID]: 'border-success/40 bg-success/10 text-success',
  [ATTENDEE_ENTRY_STATUS.USED]: 'border-hairline bg-surface-container text-ink-muted',
  [ATTENDEE_ENTRY_STATUS.EXPIRED]: 'border-destructive/40 bg-destructive/10 text-destructive',
}

export function EntryStatusBadge({ status }: { status: AttendeeEntryStatus }) {
  const { t } = useTranslation('dashboard')

  return (
    <Badge variant="outline" size="sm" className={cn('w-fit', entryStatusClassName[status])}>
      {t(`pages.panel.staff.table.entryStatus.${status}`)}
    </Badge>
  )
}
