import { useState } from 'react'
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
import { TICKET_STATUS, TICKET_TYPE, type TicketStatus, type TicketType } from '@afterdark/types'
import type { TFunction } from 'i18next'
import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import { TicketViewDialog } from '~/modules/tickets/components/dialog-view-ticket'
import { TICKET_TAB, type TicketTab } from '~/modules/tickets/constants/tickets-tabs.constants'

const ticketActionIconClassName = '!size-[20px] shrink-0'
const ticketActionItemClassName = 'gap-3 py-2.5 text-base'

export type TicketRecordItem = {
  id: string
  name: string
  clubName: string
  clubInitials: string
  clubAvatarClassName: string
  ticketType: TicketType
  ticketTypeTone?: 'default' | 'primary' | 'tertiary'
  price: number
  quantity: number
  totalSold: number
  revenue: number
  status: TicketStatus
}

export const TICKET_RECORDS_MOCK: TicketRecordItem[] = [
  {
    id: '1',
    name: 'Ultra VIP Pass',
    clubName: 'Neon Vault',
    clubInitials: 'NV',
    clubAvatarClassName: 'border-primary/40 bg-primary/20 text-primary',
    ticketType: TICKET_TYPE.VIP,
    ticketTypeTone: 'primary',
    price: 450,
    quantity: 12,
    totalSold: 1402,
    revenue: 630_900,
    status: TICKET_STATUS.ACTIVE,
  },
  {
    id: '2',
    name: 'General Entry',
    clubName: 'Cyber Pulse',
    clubInitials: 'CP',
    clubAvatarClassName: 'border-hairline-strong bg-surface-container-high text-ink-muted',
    ticketType: TICKET_TYPE.GENERAL,
    price: 45,
    quantity: 500,
    totalSold: 850,
    revenue: 38_250,
    status: TICKET_STATUS.ACTIVE,
  },
  {
    id: '3',
    name: 'Bottle Service',
    clubName: 'The Underworld',
    clubInitials: 'UW',
    clubAvatarClassName: 'border-tertiary/40 bg-tertiary/15 text-tertiary',
    ticketType: TICKET_TYPE.VIP,
    ticketTypeTone: 'primary',
    price: 1200,
    quantity: 80,
    totalSold: 312,
    revenue: 374_400,
    status: TICKET_STATUS.ACTIVE,
  },
  {
    id: '4',
    name: 'Early Bird',
    clubName: 'Echo Chamber',
    clubInitials: 'EC',
    clubAvatarClassName: 'border-outline-variant/60 bg-surface-container text-ink-muted',
    ticketType: TICKET_TYPE.GENERAL,
    price: 25,
    quantity: 0,
    totalSold: 500,
    revenue: 12_500,
    status: TICKET_STATUS.ACTIVE,
  },
  {
    id: '5',
    name: 'VIP Backstage',
    clubName: 'Velvet Room',
    clubInitials: 'VR',
    clubAvatarClassName: 'border-secondary/50 bg-secondary/20 text-secondary',
    ticketType: TICKET_TYPE.VIP,
    price: 150,
    quantity: 200,
    totalSold: 145,
    revenue: 21_750,
    status: TICKET_STATUS.INACTIVE,
  },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function getTicketTypeLabel(type: TicketType, t: TFunction<'tickets'>): string {
  return type === TICKET_TYPE.VIP ? t('form.typeVip') : t('form.typeGeneral')
}

function getTicketTypeTone(type: TicketType): TicketRecordItem['ticketTypeTone'] {
  if (type === TICKET_TYPE.VIP) return 'primary'
  return 'default'
}

function formatSoldCount(value: number): string {
  return value.toLocaleString('es-AR')
}

function ClubIdentityCell({
  clubName,
  clubInitials,
  clubAvatarClassName,
}: Pick<TicketRecordItem, 'clubName' | 'clubInitials' | 'clubAvatarClassName'>) {
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

function TicketTypeBadge({
  label,
  tone = 'default',
}: {
  label: string
  tone?: TicketRecordItem['ticketTypeTone']
}) {
  return (
    <Badge
      variant="outline"
      size="sm"
      className={cn(
        tone === 'primary' && 'border-primary/40 bg-primary/10 text-primary',
        tone === 'tertiary' && 'border-tertiary/40 bg-tertiary/10 text-tertiary'
      )}
    >
      {label}
    </Badge>
  )
}

function formatQuantity(value: number): string {
  return value.toLocaleString('es-AR')
}

function TicketRecordRow({
  record,
  onView,
  onEdit,
  onDelete,
}: {
  record: TicketRecordItem
  onView?: (record: TicketRecordItem) => void
  onEdit?: (record: TicketRecordItem) => void
  onDelete?: (record: TicketRecordItem) => void
}) {
  const { t } = useTranslation('tickets')

  const ticketTypeLabel = getTicketTypeLabel(record.ticketType, t)

  return (
    <TableRow className="border-0">
      <TableCell className="p-6">
        <ClubIdentityCell
          clubName={record.clubName}
          clubInitials={record.clubInitials}
          clubAvatarClassName={record.clubAvatarClassName}
        />
      </TableCell>
      <TableCell className="p-6">
        <TicketTypeBadge
          label={ticketTypeLabel}
          tone={record.ticketTypeTone ?? getTicketTypeTone(record.ticketType)}
        />
      </TableCell>
      <TableCell className="p-6 text-ink">{formatCurrency(record.price)}</TableCell>
      <TableCell className="p-6 text-ink">{formatQuantity(record.quantity)}</TableCell>
      <TableCell className="p-6 text-ink">{formatSoldCount(record.totalSold)}</TableCell>
      <TableCell className="p-6 font-semibold text-ink">{formatCurrency(record.revenue)}</TableCell>
      <TableCell className="p-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-ink-muted hover:text-ink"
              aria-label={t('table.rowActionsLabel', {
                type: ticketTypeLabel,
                club: record.clubName,
              })}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44 p-1.5">
            <DropdownMenuItem
              className={ticketActionItemClassName}
              onClick={() => onEdit?.(record)}
            >
              <Pencil aria-hidden="true" className={ticketActionIconClassName} />
              {t('table.actionEdit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={ticketActionItemClassName}
              onClick={() => onView?.(record)}
            >
              <Eye aria-hidden="true" className={ticketActionIconClassName} />
              {t('table.actionView')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(ticketActionItemClassName, 'text-error focus:text-error')}
              onClick={() => onDelete?.(record)}
            >
              <Trash2 aria-hidden="true" className={cn(ticketActionIconClassName, 'text-error')} />
              {t('table.actionDelete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export type TicketRecordsPagination = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

function TicketRecordsPaginationBar({
  pagination,
  previousLabel,
  nextLabel,
}: {
  pagination: TicketRecordsPagination
  previousLabel: string
  nextLabel: string
}) {
  const { page, totalPages, onPageChange } = pagination

  if (totalPages <= 1) return null

  const items = getPaginationItems(page, totalPages)

  return (
    <div className="border-t border-hairline px-4 py-4 sm:px-6">
      <Pagination aria-label="Paginación de tickets">
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

export function TicketRecords({
  records,
  inventoryTab,
  onEdit,
  onDelete,
  pagination,
}: {
  records: TicketRecordItem[]
  inventoryTab: TicketTab
  onEdit?: (record: TicketRecordItem) => void
  onDelete?: (record: TicketRecordItem) => void
  pagination?: TicketRecordsPagination
}) {
  const { t } = useTranslation('tickets')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [recordToView, setRecordToView] = useState<TicketRecordItem | null>(null)

  const registryCount = pagination?.total ?? records.length
  const registrySubtitle =
    registryCount > 0 ? t('table.registryCount', { count: registryCount }) : null

  const handleViewRecord = (record: TicketRecordItem) => {
    setRecordToView(record)
    setViewDialogOpen(true)
  }

  const handleEditRecord = (record: TicketRecordItem) => {
    onEdit?.(record)
  }

  const handleDeleteRecord = (record: TicketRecordItem) => {
    onDelete?.(record)
  }

  const handleViewDialogOpenChange = (open: boolean) => {
    setViewDialogOpen(open)
    if (!open) {
      setRecordToView(null)
    }
  }

  return (
    <>
      <section aria-labelledby="ticket-inventory-heading">
        <header className="py-4">
          <div className="min-w-0">
            <h2
              id="ticket-inventory-heading"
              className="font-heading text-lg font-semibold text-ink sm:text-xl"
            >
              {t('table.title')}
            </h2>
            {registrySubtitle ? (
              <p className="mt-1 text-sm text-ink-muted">{registrySubtitle}</p>
            ) : null}
          </div>
        </header>

        {records.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-heading text-base font-semibold text-ink">
              {inventoryTab === TICKET_TAB.ACTIVE
                ? t('table.emptyActiveTitle')
                : t('table.emptyInactiveTitle')}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
              {inventoryTab === TICKET_TAB.ACTIVE
                ? t('table.emptyActiveDescription')
                : t('table.emptyInactiveDescription')}
            </p>
          </div>
        ) : (
          <Card variant="gradient">
            <Table variant="compact" className="min-w-[960px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="p-6">{t('table.club')}</TableHead>
                  <TableHead className="p-6">{t('table.ticketType')}</TableHead>
                  <TableHead className="p-6">{t('table.price')}</TableHead>
                  <TableHead className="p-6">{t('table.quantity')}</TableHead>
                  <TableHead className="p-6">{t('table.totalSold')}</TableHead>
                  <TableHead className="p-6">{t('table.revenue')}</TableHead>
                  <TableHead className="p-6 text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TicketRecordRow
                    key={record.id}
                    record={record}
                    onView={handleViewRecord}
                    onEdit={handleEditRecord}
                    onDelete={handleDeleteRecord}
                  />
                ))}
              </TableBody>
            </Table>
            {pagination ? (
              <TicketRecordsPaginationBar
                pagination={pagination}
                previousLabel={t('pagination.previous')}
                nextLabel={t('pagination.next')}
              />
            ) : null}
          </Card>
        )}
      </section>

      <TicketViewDialog
        record={recordToView}
        open={viewDialogOpen}
        onOpenChange={handleViewDialogOpenChange}
      />
    </>
  )
}
