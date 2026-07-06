import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  Button,
  Card,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  getPaginationItems,
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@afterdark/ui'
import { EVENT_STATUS, type EventStatus } from '@afterdark/types'
import type { TFunction } from 'i18next'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'

const eventActionIconClassName = '!size-[20px] shrink-0'
const eventActionItemClassName = 'gap-3 py-2.5 text-base'

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value)
}

function ClubIdentityCell({
  clubName,
  clubInitials,
  clubAvatarClassName,
}: Pick<EventRecordItem, 'clubName' | 'clubInitials' | 'clubAvatarClassName'>) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md border text-xs font-bold uppercase',
          clubAvatarClassName
        )}
        aria-hidden="true"
      >
        {clubInitials}
      </div>
      <p className="truncate font-semibold text-ink">{clubName}</p>
    </div>
  )
}

function getEventStatusLabel(status: EventStatus, t: TFunction<'events'>): string {
  if (status === EVENT_STATUS.DRAFT) return t('form.statusDraft')
  if (status === EVENT_STATUS.FINISHED) return t('form.statusFinished')
  return t('form.statusPublished')
}

function EventStatusBadge({ status, label }: { status: EventStatus; label: string }) {
  return (
    <Badge
      variant="outline"
      size="sm"
      className={cn(
        status === EVENT_STATUS.PUBLISHED && 'border-primary/40 bg-primary/10 text-primary',
        status === EVENT_STATUS.FINISHED && 'border-tertiary/40 bg-tertiary/10 text-tertiary'
      )}
    >
      {label}
    </Badge>
  )
}

function EventRecordRow({
  record,
  onEdit,
  onDelete,
}: {
  record: EventRecordItem
  onEdit?: (record: EventRecordItem) => void
  onDelete?: (record: EventRecordItem) => void
}) {
  const { t } = useTranslation('events')
  const statusLabel = getEventStatusLabel(record.status, t)

  return (
    <TableRow className="border-0">
      <TableCell className="p-6">
        <ClubIdentityCell
          clubName={record.clubName}
          clubInitials={record.clubInitials}
          clubAvatarClassName={record.clubAvatarClassName}
        />
      </TableCell>
      <TableCell className="p-6 font-semibold text-ink">{record.name}</TableCell>
      <TableCell className="p-6 text-ink">{formatDateTime(record.startsAt)}</TableCell>
      <TableCell className="p-6 text-ink">{formatDateTime(record.endsAt)}</TableCell>
      <TableCell className="p-6">
        <EventStatusBadge status={record.status} label={statusLabel} />
      </TableCell>
      <TableCell className="p-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-ink-muted hover:text-ink"
              aria-label={t('table.rowActionsLabel', {
                event: record.name,
                club: record.clubName,
              })}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44 p-1.5">
            <DropdownMenuItem className={eventActionItemClassName} onClick={() => onEdit?.(record)}>
              <Pencil aria-hidden="true" className={eventActionIconClassName} />
              {t('table.actionEdit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(eventActionItemClassName, 'text-error focus:text-error')}
              onClick={() => onDelete?.(record)}
            >
              <Trash2 aria-hidden="true" className={cn(eventActionIconClassName, 'text-error')} />
              {t('table.actionDelete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export type EventRecordItem = {
  id: string
  name: string
  clubName: string
  clubInitials: string
  clubAvatarClassName: string
  startsAt: Date
  endsAt: Date
  status: EventStatus
}

export type EventRecordsPagination = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

function EventRecordsPaginationBar({
  pagination,
  previousLabel,
  nextLabel,
}: {
  pagination: EventRecordsPagination
  previousLabel: string
  nextLabel: string
}) {
  const { page, totalPages, onPageChange } = pagination

  if (totalPages <= 1) return null

  const items = getPaginationItems(page, totalPages)

  return (
    <div className="border-t border-hairline px-4 py-4 sm:px-6">
      <Pagination aria-label="Paginación de eventos">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text={previousLabel}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            />
          </PaginationItem>

          {items.map((item, index) =>
            item === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationButton isActive={item === page} onClick={() => onPageChange(item)}>
                  {item}
                </PaginationButton>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              text={nextLabel}
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export function EventRecords({
  records,
  pagination,
  onEdit,
  onDelete,
  headerAction,
}: {
  records: EventRecordItem[]
  pagination?: EventRecordsPagination
  onEdit?: (record: EventRecordItem) => void
  onDelete?: (record: EventRecordItem) => void
  headerAction?: ReactNode
}) {
  const { t } = useTranslation('events')

  const registryCount = pagination?.total ?? records.length
  const registrySubtitle =
    registryCount > 0 ? t('table.registryCount', { count: registryCount }) : null

  return (
    <section aria-labelledby="event-inventory-heading">
      <header className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2
            id="event-inventory-heading"
            className="font-heading text-lg font-semibold text-ink sm:text-xl"
          >
            {t('table.title')}
          </h2>
          {registrySubtitle ? (
            <p className="mt-1 text-sm text-ink-muted">{registrySubtitle}</p>
          ) : null}
        </div>
        {headerAction}
      </header>

      {records.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="font-heading text-base font-semibold text-ink">{t('table.emptyTitle')}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            {t('table.emptyDescription')}
          </p>
        </div>
      ) : (
        <Card variant="gradient">
          <Table variant="compact" className="min-w-[960px]">
            <TableHeader>
              <TableRow>
                <TableHead className="p-6">{t('table.club')}</TableHead>
                <TableHead className="p-6">{t('table.event')}</TableHead>
                <TableHead className="p-6">{t('table.startsAt')}</TableHead>
                <TableHead className="p-6">{t('table.endsAt')}</TableHead>
                <TableHead className="p-6">{t('table.status')}</TableHead>
                <TableHead className="p-6 text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <EventRecordRow
                  key={record.id}
                  record={record}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
          {pagination ? (
            <EventRecordsPaginationBar
              pagination={pagination}
              previousLabel={t('pagination.previous')}
              nextLabel={t('pagination.next')}
            />
          ) : null}
        </Card>
      )}
    </section>
  )
}
