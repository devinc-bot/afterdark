import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'
import { STAFF_STATUS, type StaffStatus, type UserRole } from '@repo/types'
import { EllipsisVertical, Loader2, Power, PowerOff, Trash2 } from 'lucide-react'
import { StaffUserDeactivateDialog } from '~/modules/staff/components/staff-user-deactivate-dialog'
import { StaffUserDeleteDialog } from '~/modules/staff/components/staff-user-delete-dialog'
import { StaffUserRecordsToolbar } from '~/modules/staff/components/staff-user-records-toolbar'
import type { StaffUserRecord } from '~/modules/staff/types/staff-user-record'
import {
  hasActiveStaffUserSearch,
  searchStaffUserRecords,
} from '~/modules/staff/utils/staff-user-records-filter.utils'
import { getStaffUserInitials } from '~/modules/staff/utils/staff-user.utils'

type StaffUserRecordsProps = {
  records: StaffUserRecord[]
  statusControlsDisabled?: boolean
  pendingRecordId?: string | null
  onStatusChange?: (recordId: string, status: StaffStatus) => void
  onDelete?: (recordId: string) => void
}

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

function StaffUserRoleCell({ role }: { role: UserRole }) {
  const { t } = useTranslation('staff')
  return (
    <span className="text-sm text-ink-muted">
      {t(`userRoles.${role}` as `userRoles.${UserRole}`)}
    </span>
  )
}

function StaffUserStatusBadge({ status }: { status: StaffStatus }) {
  const { t } = useTranslation('staff')
  const isActive = status === STAFF_STATUS.ACTIVE

  return (
    <Badge
      variant="outline"
      size="sm"
      className={
        isActive
          ? 'border-success/40 bg-success/10 text-success'
          : 'border-hairline bg-surface-container text-ink-muted'
      }
    >
      {isActive ? t('table.statusActive') : t('table.statusInactive')}
    </Badge>
  )
}

function StaffUserRecordActions({
  record,
  onActivate,
  onDeactivateRequest,
  onDeleteRequest,
  statusControlsDisabled = false,
  isPending = false,
}: {
  record: StaffUserRecord
  onActivate: (recordId: string) => void
  onDeactivateRequest: (record: StaffUserRecord) => void
  onDeleteRequest: (record: StaffUserRecord) => void
  statusControlsDisabled?: boolean
  isPending?: boolean
}) {
  const { t } = useTranslation('staff')
  const isActive = record.status === STAFF_STATUS.ACTIVE

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-ink-muted hover:text-ink"
          aria-label={`${t('table.actions')} para ${record.name}`}
          disabled={statusControlsDisabled}
          aria-busy={isPending}
        >
          {isPending ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <EllipsisVertical aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 p-1.5">
        <DropdownMenuItem
          disabled={statusControlsDisabled}
          onSelect={() => {
            if (isActive) {
              onDeactivateRequest(record)
              return
            }
            onActivate(record.id)
          }}
        >
          {isActive ? <PowerOff aria-hidden="true" /> : <Power aria-hidden="true" />}
          {isActive ? t('table.deactivateUser') : t('table.activateUser')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-error focus:text-error"
          disabled={statusControlsDisabled}
          onSelect={() => onDeleteRequest(record)}
        >
          <Trash2 aria-hidden="true" className="text-error" />
          {t('table.deleteUser')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function StaffUserRecordRow({
  record,
  onActivate,
  onDeactivateRequest,
  onDeleteRequest,
  statusControlsDisabled = false,
  isPending = false,
}: {
  record: StaffUserRecord
  onActivate: (recordId: string) => void
  onDeactivateRequest: (record: StaffUserRecord) => void
  onDeleteRequest: (record: StaffUserRecord) => void
  statusControlsDisabled?: boolean
  isPending?: boolean
}) {
  return (
    <TableRow className="border-0">
      <TableCell className="p-6">
        <StaffUserIdentityCell record={record} />
      </TableCell>
      <TableCell className="p-6">
        <Badge variant="outline" size="sm">
          {record.organizationName}
        </Badge>
      </TableCell>
      <TableCell className="p-6">
        <StaffUserRoleCell role={record.role} />
      </TableCell>
      <TableCell className="p-6">
        <StaffUserStatusBadge status={record.status} />
      </TableCell>
      <TableCell className="p-6 text-right">
        <StaffUserRecordActions
          record={record}
          onActivate={onActivate}
          onDeactivateRequest={onDeactivateRequest}
          onDeleteRequest={onDeleteRequest}
          statusControlsDisabled={statusControlsDisabled}
          isPending={isPending}
        />
      </TableCell>
    </TableRow>
  )
}

export function StaffUserRecords({
  records,
  statusControlsDisabled = false,
  pendingRecordId = null,
  onStatusChange,
  onDelete,
}: StaffUserRecordsProps) {
  const { t } = useTranslation('staff')
  const [searchQuery, setSearchQuery] = useState('')
  const [deactivateTarget, setDeactivateTarget] = useState<StaffUserRecord | null>(null)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StaffUserRecord | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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

  const handleDeleteRequest = useCallback(
    (record: StaffUserRecord) => {
      if (statusControlsDisabled) return
      setDeleteTarget(record)
      setDeleteDialogOpen(true)
    },
    [statusControlsDisabled]
  )

  const handleDeleteConfirm = useCallback(
    (record: StaffUserRecord) => {
      onDelete?.(record.id)
      setDeleteTarget(null)
    },
    [onDelete]
  )

  const getRegistrySubtitle = (): string | null => {
    if (records.length > 0) {
      return hasActiveSearch
        ? t('table.showingFiltered', { visible: visibleRecords.length, total: records.length })
        : t('table.registryCount', { count: records.length })
    }
    return null
  }

  return (
    <section aria-labelledby="staff-user-records-heading">
      <header className="py-4">
        <div className="min-w-0">
          <h2
            id="staff-user-records-heading"
            className="font-heading text-lg font-semibold text-ink sm:text-xl"
          >
            {t('table.title')}
          </h2>
          {getRegistrySubtitle() ? (
            <p className="mt-1 text-sm text-ink-muted">{getRegistrySubtitle()}</p>
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
          <p className="font-heading text-base font-semibold text-ink">{t('table.emptyTitle')}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            {t('table.emptyDescription')}
          </p>
        </div>
      ) : (
        <>
          {visibleRecords.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-heading text-base font-semibold text-ink">
                {t('table.noResultsTitle')}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
                {t('table.noResultsDescription')}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleClearSearch}
              >
                {t('table.search.clear')}
              </Button>
            </div>
          ) : null}

          {visibleRecords.length > 0 ? (
            <Card variant="gradient">
              <Table variant="compact">
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-6">{t('table.name')}</TableHead>
                    <TableHead className="p-6">{t('table.organization')}</TableHead>
                    <TableHead className="p-6">{t('table.role')}</TableHead>
                    <TableHead className="p-6">{t('table.status')}</TableHead>
                    <TableHead className="text-right p-6">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRecords.map((record) => (
                    <StaffUserRecordRow
                      key={record.id}
                      record={record}
                      onActivate={handleActivate}
                      onDeactivateRequest={handleDeactivateRequest}
                      onDeleteRequest={handleDeleteRequest}
                      statusControlsDisabled={statusControlsDisabled}
                      isPending={pendingRecordId === record.id}
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

      <StaffUserDeleteDialog
        record={deleteTarget}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </section>
  )
}
