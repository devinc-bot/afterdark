import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@afterdark/ui'
import { TICKET_STATUS, type TicketStatus } from '@afterdark/types'
import { EllipsisVertical } from 'lucide-react'

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

const TICKET_RECORDS_MOCK: TicketRecordItem[] = [
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

const INVENTORY_TAB = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const

type InventoryTab = (typeof INVENTORY_TAB)[keyof typeof INVENTORY_TAB]

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
  onActions,
}: {
  record: TicketRecordItem
  onActions?: (record: TicketRecordItem) => void
}) {
  return (
    <TableRow>
      <TableCell>
        <ClubIdentityCell
          clubName={record.clubName}
          clubInitials={record.clubInitials}
          clubAvatarClassName={record.clubAvatarClassName}
        />
      </TableCell>
      <TableCell>
        <TicketTypeBadge label={record.ticketTypeLabel} tone={record.ticketTypeTone} />
      </TableCell>
      <TableCell className="text-ink">{formatCurrency(record.price)}</TableCell>
      <TableCell>
        <StockStatusCell stockStatus={record.stockStatus} stockRemaining={record.stockRemaining} />
      </TableCell>
      <TableCell className="text-ink">{formatSoldCount(record.totalSold)}</TableCell>
      <TableCell className="font-semibold text-ink">{formatCurrency(record.revenue)}</TableCell>
      <TableCell className="text-right">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-ink-muted hover:text-ink"
              aria-label={`Acciones para ${record.ticketTypeLabel} en ${record.clubName}`}
              onClick={() => onActions?.(record)}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Acciones</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}

export function TicketRecords({
  records = TICKET_RECORDS_MOCK,
  onActions,
}: {
  records?: TicketRecordItem[]
  onActions?: (record: TicketRecordItem) => void
}) {
  const [inventoryTab, setInventoryTab] = useState<InventoryTab>(INVENTORY_TAB.ACTIVE)

  const filteredRecords = useMemo(() => {
    if (inventoryTab === INVENTORY_TAB.ACTIVE) {
      return records.filter((record) => record.status === TICKET_STATUS.ACTIVE)
    }

    return records.filter((record) => record.status === TICKET_STATUS.INACTIVE)
  }, [inventoryTab, records])

  return (
    <TooltipProvider>
      <section
        aria-labelledby="ticket-inventory-heading"
        className="overflow-hidden rounded-xl border border-hairline bg-surface-container-low"
      >
        <header className="flex flex-col gap-4 border-b border-hairline px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2
            id="ticket-inventory-heading"
            className="font-heading text-lg font-semibold text-ink sm:text-xl"
          >
            Detalle del inventario de tickets
          </h2>

          <Tabs
            value={inventoryTab}
            onValueChange={(value) => setInventoryTab(value as InventoryTab)}
          >
            <TabsList className="h-9 rounded-lg border border-hairline bg-surface-container p-1">
              <TabsTrigger
                value={INVENTORY_TAB.ACTIVE}
                className="rounded-md px-4 py-1 text-sm text-ink-muted data-[state=active]:bg-surface-container-high data-[state=active]:text-ink data-[state=active]:shadow-none"
              >
                Activos
              </TabsTrigger>
              <TabsTrigger
                value={INVENTORY_TAB.ARCHIVED}
                className="rounded-md px-4 py-1 text-sm text-ink-muted data-[state=active]:bg-surface-container-high data-[state=active]:text-ink data-[state=active]:shadow-none"
              >
                Archivados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {filteredRecords.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-heading text-base font-semibold text-ink">
              {inventoryTab === INVENTORY_TAB.ACTIVE
                ? 'No hay tickets activos'
                : 'No hay tickets archivados'}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
              {inventoryTab === INVENTORY_TAB.ACTIVE
                ? 'Los tickets activos aparecerán acá cuando estén publicados para la venta.'
                : 'Los tickets archivados aparecerán acá cuando desactives una entrada.'}
            </p>
          </div>
        ) : (
          <Table variant="compact" className="min-w-[960px]">
            <TableHeader>
              <TableRow>
                <TableHead>Club nocturno</TableHead>
                <TableHead>Tipo de entrada</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado de stock</TableHead>
                <TableHead>Total vendido</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TicketRecordRow key={record.id} record={record} onActions={onActions} />
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </TooltipProvider>
  )
}
