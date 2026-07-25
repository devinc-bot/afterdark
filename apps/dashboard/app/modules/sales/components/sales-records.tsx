import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TICKET_TYPE, type OwnerSaleResponse } from '@repo/types'
import {
  Button,
  Card,
  getPaginationItems,
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'
import { formatSaleAmount, formatSaleDateTime } from '~/modules/sales/utils/sales.formatter'

export type SalesRecordsPagination = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

const SALES_COLUMN_KEYS = [
  'buyer',
  'event',
  'ticket',
  'ticketType',
  'location',
  'paidAt',
  'quantity',
  'amount',
  'status',
] as const

function SalesRecordsHead() {
  const { t } = useTranslation('sales')

  return (
    <TableHeader>
      <TableRow>
        {SALES_COLUMN_KEYS.map((columnKey) => (
          <TableHead key={columnKey} className="p-6">
            {t(`table.${columnKey}`)}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}

const SKELETON_ROW_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

function SalesRecordsSkeleton() {
  const { t } = useTranslation('sales')

  return (
    <Card variant="gradient" aria-busy="true">
      <span className="sr-only">{t('table.loading')}</span>
      <Table variant="compact" className="min-w-275">
        <SalesRecordsHead />
        <TableBody>
          {SKELETON_ROW_KEYS.map((rowKey) => (
            <TableRow key={rowKey} className="border-0">
              <TableCell className="p-6">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-36 max-w-full" />
                  <Skeleton className="h-3 w-44 max-w-full" />
                </div>
              </TableCell>
              {SALES_COLUMN_KEYS.slice(1).map((columnKey) => (
                <TableCell key={columnKey} className="p-6">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function SalesStateMessage({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-hairline bg-surface-container-low px-6 py-12 text-center">
      <div className="flex flex-col gap-2">
        <p className="font-heading text-base font-semibold text-ink">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

function SalesRecordsPaginationBar({
  pagination,
  previousLabel,
  nextLabel,
  ariaLabel,
}: {
  pagination: SalesRecordsPagination
  previousLabel: string
  nextLabel: string
  ariaLabel: string
}) {
  const { page, totalPages, onPageChange } = pagination

  if (totalPages < 1) return null

  const items = getPaginationItems(page, Math.max(totalPages, 1))

  return (
    <div className="border-t border-hairline px-4 py-4 sm:px-6">
      <Pagination aria-label={ariaLabel}>
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

function SaleRecordRow({ sale }: { sale: OwnerSaleResponse }) {
  const { t } = useTranslation('sales')
  const typeLabel =
    sale.ticketType === TICKET_TYPE.VIP
      ? t('filters.ticketTypeVip')
      : t('filters.ticketTypeGeneral')

  return (
    <TableRow className="border-0">
      <TableCell className="p-6">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{sale.buyerName}</p>
          <p className="truncate text-sm text-ink-muted">{sale.buyerEmail}</p>
        </div>
      </TableCell>
      <TableCell className="p-6 text-ink">{sale.eventName}</TableCell>
      <TableCell className="p-6 text-ink">{sale.ticketName}</TableCell>
      <TableCell className="p-6 text-ink">{typeLabel}</TableCell>
      <TableCell className="p-6 text-ink">{sale.locationName}</TableCell>
      <TableCell className="p-6 text-ink">{formatSaleDateTime(sale.paidAt)}</TableCell>
      <TableCell className="p-6 text-ink">{sale.quantity}</TableCell>
      <TableCell className="p-6 font-semibold text-ink">{formatSaleAmount(sale.amount)}</TableCell>
      <TableCell className="p-6 text-ink">{t('table.statusCompleted')}</TableCell>
    </TableRow>
  )
}

export function SalesRecords({
  sales,
  pagination,
  filters,
  isLoading = false,
  isError = false,
  hasActiveFilters = false,
  onRetry,
}: {
  sales: OwnerSaleResponse[]
  pagination?: SalesRecordsPagination
  filters?: ReactNode
  isLoading?: boolean
  isError?: boolean
  hasActiveFilters?: boolean
  onRetry?: () => void
}) {
  const { t } = useTranslation('sales')
  const registryCount = pagination?.total ?? sales.length
  const registrySubtitle =
    !isLoading && !isError && registryCount > 0
      ? t('table.registryCount', { count: registryCount })
      : null

  function renderBody() {
    if (isLoading) {
      return <SalesRecordsSkeleton />
    }

    if (isError) {
      return (
        <SalesStateMessage
          title={t('list.errorTitle')}
          description={t('list.error')}
          action={
            onRetry ? (
              <Button type="button" variant="outline" onClick={onRetry}>
                {t('list.retry')}
              </Button>
            ) : undefined
          }
        />
      )
    }

    if (sales.length === 0) {
      return (
        <SalesStateMessage
          title={hasActiveFilters ? t('table.emptyFiltered') : t('table.empty')}
          description={
            hasActiveFilters ? t('table.emptyFilteredDescription') : t('table.emptyDescription')
          }
        />
      )
    }

    return (
      <Card variant="gradient">
        <Table variant="compact" className="min-w-275">
          <SalesRecordsHead />
          <TableBody>
            {sales.map((sale) => (
              <SaleRecordRow key={sale.id} sale={sale} />
            ))}
          </TableBody>
        </Table>
        {pagination ? (
          <SalesRecordsPaginationBar
            pagination={pagination}
            previousLabel={t('pagination.previous')}
            nextLabel={t('pagination.next')}
            ariaLabel={t('pagination.label')}
          />
        ) : null}
      </Card>
    )
  }

  return (
    <section aria-labelledby="sales-history-heading" className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2
            id="sales-history-heading"
            className="font-heading text-lg font-semibold text-ink sm:text-xl"
          >
            {t('table.title')}
          </h2>
          {registrySubtitle ? (
            <p className="mt-1 text-sm text-ink-muted">{registrySubtitle}</p>
          ) : null}
        </div>
      </header>

      {filters}

      {renderBody()}
    </section>
  )
}
