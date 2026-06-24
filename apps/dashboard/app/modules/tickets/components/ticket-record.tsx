import { useState } from 'react'
import {
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
} from '@afterdark/ui'
import { TICKET_STATUS, type TicketStatus } from '@afterdark/types'
import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import { TicketViewDialog } from '~/modules/tickets/components/dialog-view-ticket'
import { TICKETS_COPY } from '~/modules/tickets/constants/tickets.copy'
import { TICKET_TAB, type TicketTab } from '~/modules/tickets/constants/tickets-tabs.constants'

const ticketActionIconClassName = '!size-[20px] shrink-0'
const ticketActionItemClassName = 'gap-3 py-2.5 text-base'

export const TICKET_STOCK_STATUS = {
  LIMITED: 'limited',
  IN_STOCK: 'in_stock',
  AVAILABLE: 'available',
  SOLD_OUT: 'sold_out',
} as const

export type TicketStockStatus = (typeof TICKET_STOCK_STATUS)[keyof typeof TICKET_STOCK_STATUS]

export type TicketRecordItem = {
  id: string
  clubName: string
  clubInitials: string
  clubAvatarClassName: string
  ticketTypeLabel: string
  ticketTypeTone?: 'default' | 'primary' | 'tertiary'
  price: number
  stockStatus: TicketStockStatus
  stockRemaining?: number
  totalSold: number
  revenue: number
  status: TicketStatus
}

export const TICKET_RECORDS_MOCK: TicketRecordItem[] = [
  {
    id: '1',
    clubName: 'Neon Vault',
    clubInitials: 'NV',
    clubAvatarClassName: 'border-primary/40 bg-primary/20 text-primary',
    ticketTypeLabel: 'Ultra VIP Pass',
    ticketTypeTone: 'primary',
    price: 450,
    stockStatus: TICKET_STOCK_STATUS.LIMITED,
    stockRemaining: 12,
    totalSold: 1402,
    revenue: 630_900,
    status: TICKET_STATUS.ACTIVE,
  },
  {
    id: '2',
    clubName: 'Cyber Pulse',
    clubInitials: 'CP',
    clubAvatarClassName: 'border-hairline-strong bg-surface-container-high text-ink-muted',
    ticketTypeLabel: 'General Entry',
    price: 45,
    stockStatus: TICKET_STOCK_STATUS.IN_STOCK,
    totalSold: 850,
    revenue: 38_250,
    status: TICKET_STATUS.ACTIVE,
  },
  {
    id: '3',
    clubName: 'The Underworld',
    clubInitials: 'UW',
    clubAvatarClassName: 'border-tertiary/40 bg-tertiary/15 text-tertiary',
    ticketTypeLabel: 'Bottle Service',
    ticketTypeTone: 'tertiary',
    price: 1200,
    stockStatus: TICKET_STOCK_STATUS.AVAILABLE,
    totalSold: 312,
    revenue: 374_400,
    status: TICKET_STATUS.ACTIVE,
  },
  {
    id: '4',
    clubName: 'Echo Chamber',
    clubInitials: 'EC',
    clubAvatarClassName: 'border-outline-variant/60 bg-surface-container text-ink-muted',
    ticketTypeLabel: 'Early Bird',
    price: 25,
    stockStatus: TICKET_STOCK_STATUS.SOLD_OUT,
    totalSold: 500,
    revenue: 12_500,
    status: TICKET_STATUS.ACTIVE,
  },
  {
    id: '5',
    clubName: 'Velvet Room',
    clubInitials: 'VR',
    clubAvatarClassName: 'border-secondary/50 bg-secondary/20 text-secondary',
    ticketTypeLabel: 'VIP Backstage',
    price: 150,
    stockStatus: TICKET_STOCK_STATUS.IN_STOCK,
    totalSold: 145,
    revenue: 21_750,
    status: TICKET_STATUS.INACTIVE,
  },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
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

function StockStatusCell({
  stockStatus,
  stockRemaining,
}: Pick<TicketRecordItem, 'stockStatus' | 'stockRemaining'>) {
  if (stockStatus === TICKET_STOCK_STATUS.LIMITED) {
    return (
      <div className="flex items-center gap-2 text-sm text-error">
        <span className="size-1.5 shrink-0 rounded-full bg-error" aria-hidden="true" />
        <span>Limitado ({stockRemaining ?? 0} restantes)</span>
      </div>
    )
  }

  const label =
    stockStatus === TICKET_STOCK_STATUS.IN_STOCK
      ? 'En stock'
      : stockStatus === TICKET_STOCK_STATUS.AVAILABLE
        ? 'Disponible'
        : 'Agotado'

  return (
    <div className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="size-1.5 shrink-0 rounded-full bg-ink-muted-soft" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
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
        <TicketTypeBadge label={record.ticketTypeLabel} tone={record.ticketTypeTone} />
      </TableCell>
      <TableCell className="p-6 text-ink">{formatCurrency(record.price)}</TableCell>
      <TableCell className="p-6">
        <StockStatusCell stockStatus={record.stockStatus} stockRemaining={record.stockRemaining} />
      </TableCell>
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
              aria-label={`Acciones para ${record.ticketTypeLabel} en ${record.clubName}`}
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
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className={ticketActionItemClassName}
              onClick={() => onView?.(record)}
            >
              <Eye aria-hidden="true" className={ticketActionIconClassName} />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(ticketActionItemClassName, 'text-error focus:text-error')}
              onClick={() => onDelete?.(record)}
            >
              <Trash2 aria-hidden="true" className={cn(ticketActionIconClassName, 'text-error')} />
              Borrar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function TicketRecords({
  records,
  inventoryTab,
  onEdit,
  onDelete,
}: {
  records: TicketRecordItem[]
  inventoryTab: TicketTab
  onEdit?: (record: TicketRecordItem) => void
  onDelete?: (record: TicketRecordItem) => void
}) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [recordToView, setRecordToView] = useState<TicketRecordItem | null>(null)

  const copy = TICKETS_COPY.table
  const registrySubtitle = records.length > 0 ? copy.registryCount(records.length) : null

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
              {copy.title}
            </h2>
            {registrySubtitle ? (
              <p className="mt-1 text-sm text-ink-muted">{registrySubtitle}</p>
            ) : null}
          </div>
        </header>

        {records.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-heading text-base font-semibold text-ink">
              {inventoryTab === TICKET_TAB.ACTIVE ? copy.emptyActiveTitle : copy.emptyArchivedTitle}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
              {inventoryTab === TICKET_TAB.ACTIVE
                ? copy.emptyActiveDescription
                : copy.emptyArchivedDescription}
            </p>
          </div>
        ) : (
          <Card variant="gradient">
            <Table variant="compact" className="min-w-[960px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="p-6">{copy.club}</TableHead>
                  <TableHead className="p-6">{copy.ticketType}</TableHead>
                  <TableHead className="p-6">{copy.price}</TableHead>
                  <TableHead className="p-6">{copy.stockStatus}</TableHead>
                  <TableHead className="p-6">{copy.totalSold}</TableHead>
                  <TableHead className="p-6">{copy.revenue}</TableHead>
                  <TableHead className="p-6 text-right">{copy.actions}</TableHead>
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
