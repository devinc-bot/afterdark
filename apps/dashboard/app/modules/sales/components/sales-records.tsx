import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TICKET_TYPE, type OwnerSaleResponse } from '@afterdark/types'
import {
  Card,
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
import { formatSaleAmount, formatSaleDateTime } from '~/modules/sales/utils/sales.formatter'

export type SalesRecordsPagination = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
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
      <TableCell className="p-6 text-ink">{sale.clubName}</TableCell>
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
}: {
  sales: OwnerSaleResponse[]
  pagination?: SalesRecordsPagination
  filters?: ReactNode
}) {
  const { t } = useTranslation('sales')
  const registryCount = pagination?.total ?? sales.length
  const registrySubtitle =
    registryCount > 0 ? t('table.registryCount', { count: registryCount }) : null

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

      {sales.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="font-heading text-base font-semibold text-ink">{t('table.empty')}</p>
        </div>
      ) : (
        <Card variant="gradient">
          <Table variant="compact" className="min-w-[1100px]">
            <TableHeader>
              <TableRow>
                <TableHead className="p-6">{t('table.buyer')}</TableHead>
                <TableHead className="p-6">{t('table.event')}</TableHead>
                <TableHead className="p-6">{t('table.ticket')}</TableHead>
                <TableHead className="p-6">{t('table.ticketType')}</TableHead>
                <TableHead className="p-6">{t('table.club')}</TableHead>
                <TableHead className="p-6">{t('table.paidAt')}</TableHead>
                <TableHead className="p-6">{t('table.quantity')}</TableHead>
                <TableHead className="p-6">{t('table.amount')}</TableHead>
                <TableHead className="p-6">{t('table.status')}</TableHead>
              </TableRow>
            </TableHeader>
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
      )}
    </section>
  )
}
