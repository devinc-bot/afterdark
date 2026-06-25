import { useCallback, useMemo, useState } from 'react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@afterdark/ui'
import { STAFF_STATUS, type StaffStatus } from '@afterdark/types'
import { EllipsisVertical, Pencil } from 'lucide-react'
import { StaffUserDeactivateDialog } from '~/modules/staff/components/staff-user-deactivate-dialog'
import { StaffUserRecordsToolbar } from '~/modules/staff/components/staff-user-records-toolbar'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
import type { StaffUserRecord } from '~/modules/staff/types/staff-user-record'
import {
  hasActiveStaffUserSearch,
  searchStaffUserRecords,
} from '~/modules/staff/utils/staff-user-records-filter.utils'
import { getStaffUserInitials, getStaffUserRoleLabel } from '~/modules/staff/utils/staff-user.utils'

type StaffUserRecordsProps = {
  records: StaffUserRecord[]
  statusControlsDisabled?: boolean
  onStatusChange?: (recordId: string, status: StaffStatus) => void
}

const staffActionIconClassName = '!size-[20px] shrink-0'
const staffActionItemClassName = 'gap-3 py-2.5 text-base'

function StaffUserIdentityCell({ record }: { record: StaffUserRecord }) {
  const initials = getStaffUserInitials(record.name)
  const [avatarImageFailed, setAvatarImageFailed] = useState(false)
  const showAvatarImage = Boolean(record.avatarUrl) && !avatarImageFailed

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-9 shrink-0">
        {showAvatarImage ? (
          <AvatarImage src={record.avatarUrl!} alt="" onError={() => setAvatarImageFailed(true)} />
        ) : null}
        <AvatarFallback
          className={cn(
            'flex items-center justify-center rounded-full border text-xs font-semibold uppercase',
            record.avatarClassName
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{record.name}</p>
        <p className="truncate text-xs text-ink-muted">{record.email}</p>
      </div>
    </div>
  )
}

function StaffUserRoleCell({ role }: { role: StaffUserRecord['role'] }) {
  return <span className="text-sm text-ink-muted">{getStaffUserRoleLabel(role)}</span>
}

function StaffUserRecordActions({ record }: { record: StaffUserRecord }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-ink-muted hover:text-ink"
          aria-label={`${STAFF_COPY.table.actions} para ${record.name}`}
        >
          <EllipsisVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 p-1.5">
        <DropdownMenuItem
          className={staffActionItemClassName}
          disabled
          title={STAFF_COPY.table.editUnavailableTooltip}
        >
          <Pencil aria-hidden="true" className={staffActionIconClassName} />
          Editar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function StaffUserStatusControl({
  record,
  onActivate,
  onDeactivateRequest,
  statusControlsDisabled = false,
}: {
  record: StaffUserRecord
  onActivate: (recordId: string) => void
  onDeactivateRequest: (record: StaffUserRecord) => void
  statusControlsDisabled?: boolean
}) {
  const isActive = record.status === STAFF_STATUS.ACTIVE

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={isActive}
        disabled={statusControlsDisabled}
        onCheckedChange={(checked) => {
          if (statusControlsDisabled) return
          if (checked) {
            onActivate(record.id)
            return
          }
          onDeactivateRequest(record)
        }}
        aria-label={
          isActive
            ? `${STAFF_COPY.table.deactivateAccess} ${record.name}`
            : `${STAFF_COPY.table.activateAccess} ${record.name}`
        }
      />
      <span className="text-sm text-ink-muted">
        {isActive ? STAFF_COPY.table.statusActive : STAFF_COPY.table.statusInactive}
      </span>
    </div>
  )
}

function StaffUserRecordRow({
  record,
  onActivate,
  onDeactivateRequest,
  statusControlsDisabled = false,
}: {
  record: StaffUserRecord
  onActivate: (recordId: string) => void
  onDeactivateRequest: (record: StaffUserRecord) => void
  statusControlsDisabled?: boolean
}) {
  return (
    <TableRow className="border-0">
      <TableCell className="p-6">
        <StaffUserIdentityCell record={record} />
      </TableCell>
      <TableCell className="p-6">
        <Badge variant="outline" size="sm">
          {record.clubName}
        </Badge>
      </TableCell>
      <TableCell className="p-6">
        <StaffUserRoleCell role={record.role} />
      </TableCell>
      <TableCell className="p-6 text-sm text-ink-muted">{record.lastActiveLabel}</TableCell>
      <TableCell>
        <StaffUserStatusControl
          record={record}
          onActivate={onActivate}
          onDeactivateRequest={onDeactivateRequest}
          statusControlsDisabled={statusControlsDisabled}
        />
      </TableCell>
      <TableCell className="p-6 text-right">
        <StaffUserRecordActions record={record} />
      </TableCell>
    </TableRow>
  )
}

export function StaffUserRecords({
  records,
  statusControlsDisabled = false,
  onStatusChange,
}: StaffUserRecordsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deactivateTarget, setDeactivateTarget] = useState<StaffUserRecord | null>(null)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)

  const hasActiveSearch = hasActiveStaffUserSearch(searchQuery)

  const visibleRecords = useMemo(
    () => searchStaffUserRecords(records, searchQuery),
    [records, searchQuery]
  )

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const handleActivate = useCallback(
    (recordId: string) => {
      onStatusChange?.(recordId, STAFF_STATUS.ACTIVE)
    },
    [onStatusChange]
  )

  const handleDeactivateRequest = useCallback(
    (record: StaffUserRecord) => {
      if (statusControlsDisabled) return
      setDeactivateTarget(record)
      setDeactivateDialogOpen(true)
    },
    [statusControlsDisabled]
  )

  const handleDeactivateConfirm = useCallback(
    (record: StaffUserRecord) => {
      onStatusChange?.(record.id, STAFF_STATUS.INACTIVE)
      setDeactivateTarget(null)
    },
    [onStatusChange]
  )

  const registrySubtitle =
    records.length > 0
      ? hasActiveSearch
        ? STAFF_COPY.table.showingFiltered(visibleRecords.length, records.length)
        : STAFF_COPY.table.registryCount(records.length)
      : null

  return (
    <section aria-labelledby="staff-user-records-heading">
      <header className="py-4">
        <div className="min-w-0">
          <h2
            id="staff-user-records-heading"
            className="font-heading text-lg font-semibold text-ink sm:text-xl"
          >
            {STAFF_COPY.table.title}
          </h2>
          {registrySubtitle ? (
            <p className="mt-1 text-sm text-ink-muted">{registrySubtitle}</p>
          ) : null}
        </div>
      </header>

      {records.length > 0 ? (
        <StaffUserRecordsToolbar
          searchQuery={searchQuery}
          hasActiveSearch={hasActiveSearch}
          onSearchQueryChange={setSearchQuery}
          onClearSearch={handleClearSearch}
        />
      ) : null}

      {records.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="font-heading text-base font-semibold text-ink">
            {STAFF_COPY.table.emptyTitle}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            {STAFF_COPY.table.emptyDescription}
          </p>
        </div>
      ) : (
        <>
          {visibleRecords.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-heading text-base font-semibold text-ink">
                {STAFF_COPY.table.noResultsTitle}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
                {STAFF_COPY.table.noResultsDescription}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleClearSearch}
              >
                {STAFF_COPY.table.search.clear}
              </Button>
            </div>
          ) : null}

          {visibleRecords.length > 0 ? (
            <Card variant="gradient">
              <Table variant="compact">
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-6">{STAFF_COPY.table.name}</TableHead>
                    <TableHead className="p-6">{STAFF_COPY.table.venue}</TableHead>
                    <TableHead className="p-6">{STAFF_COPY.table.role}</TableHead>
                    <TableHead className="p-6">{STAFF_COPY.table.lastActive}</TableHead>
                    <TableHead className="p-6">{STAFF_COPY.table.status}</TableHead>
                    <TableHead className="text-right p-6">{STAFF_COPY.table.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRecords.map((record) => (
                    <StaffUserRecordRow
                      key={record.id}
                      record={record}
                      onActivate={handleActivate}
                      onDeactivateRequest={handleDeactivateRequest}
                      statusControlsDisabled={statusControlsDisabled}
                    />
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : null}
        </>
      )}

      <StaffUserDeactivateDialog
        record={deactivateTarget}
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        onConfirm={handleDeactivateConfirm}
      />
    </section>
  )
}
