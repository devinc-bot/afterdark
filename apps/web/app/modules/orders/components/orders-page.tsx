import { startTransition, useState } from 'react'
import { Info, ReceiptText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  getPaginationItems,
  Link,
  LoadErrorBanner,
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Skeleton,
  toast,
} from '@repo/ui'
import type { BuyerOrderSummaryResponse } from '@repo/types'
import { PageAtmosphereWash } from '~/modules/common/components/page-atmosphere-wash'
import { Container } from '~/modules/common/components/container'
import { PageHeader } from '~/modules/common/components/page-header'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useDeleteOrderMutation } from '../mutations/use-delete-order-mutation'
import { useOrdersQuery } from '../queries/use-orders-query'
import { ORDERS_FIRST_PAGE } from '../services/orders.service'
import { DeleteOrderDialog } from './delete-order-dialog'
import { OrderSummary } from './order-summary'

function OrdersListSkeleton() {
  const { t } = useTranslation('orders')

  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('states.loading')}</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="grid gap-5 rounded-app-lg border border-hairline/25 bg-surface-card px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_9rem] lg:items-center"
        >
          <div className="space-y-4">
            <Skeleton className="h-6 w-2/5 max-w-64" />
            <Skeleton className="h-4 w-3/5 max-w-96" />
          </div>
          <div className="flex justify-between border-t border-hairline/20 pt-4 lg:block lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function OrdersPage() {
  const { t } = useTranslation('orders')
  const [page, setPage] = useState(ORDERS_FIRST_PAGE)
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrderSummaryResponse | null>(null)
  const ordersQuery = useOrdersQuery({ page })
  const deleteOrderMutation = useDeleteOrderMutation()
  const orders = ordersQuery.data?.data ?? []

  function handlePageChange(nextPage: number) {
    if (nextPage === page) return
    startTransition(() => setPage(nextPage))
  }

  async function handleDeleteConfirm() {
    if (!selectedOrder || deleteOrderMutation.isPending) return

    try {
      await deleteOrderMutation.mutateAsync(selectedOrder.documentId)
      setSelectedOrder(null)
      toast.success(t('delete.success'))

      if (orders.length === 1 && page > ORDERS_FIRST_PAGE) {
        startTransition(() => setPage(page - 1))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('delete.error'))
    }
  }

  function renderPagination() {
    if (!ordersQuery.data || ordersQuery.data.totalPages <= 1) return null

    return (
      <Pagination aria-label={t('pagination.ariaLabel')} className="mt-9">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={page === ORDERS_FIRST_PAGE || ordersQuery.isFetching}
              text={t('pagination.previous')}
              onClick={() => handlePageChange(page - 1)}
            />
          </PaginationItem>

          {getPaginationItems(page, ordersQuery.data.totalPages).map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis label={t('pagination.morePages')} />
                </PaginationItem>
              )
            }

            return (
              <PaginationItem key={item}>
                <PaginationButton
                  isActive={item === page}
                  disabled={ordersQuery.isFetching}
                  aria-label={t('pagination.page', { page: item })}
                  onClick={() => handlePageChange(item)}
                >
                  {item}
                </PaginationButton>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              disabled={page === ordersQuery.data.totalPages || ordersQuery.isFetching}
              text={t('pagination.next')}
              onClick={() => handlePageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  function renderContent() {
    if (ordersQuery.isLoading) return <OrdersListSkeleton />

    if (ordersQuery.isError) {
      return (
        <LoadErrorBanner
          className="my-0 w-full max-w-none"
          title={t('states.errorTitle')}
          message={ordersQuery.error.message || t('states.error')}
          retryLabel={t('actions.retry')}
          onRetry={() => void ordersQuery.refetch()}
          isRetrying={ordersQuery.isFetching}
        />
      )
    }

    if (orders.length === 0) {
      return (
        <div className="flex min-h-72 flex-col items-start justify-center rounded-app-lg border border-dashed border-hairline/55 bg-surface-container-low/55 px-6 py-10 sm:px-10">
          <ReceiptText className="size-7 text-primary" aria-hidden strokeWidth={1.75} />
          <h2 className="mt-5 text-balance font-display text-xl font-semibold tracking-tight text-on-surface">
            {t('states.emptyTitle')}
          </h2>
          <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-on-surface-variant">
            {t('states.emptyDescription')}
          </p>
          <Link to={WEB_ROUTES.events()} size="sm" className="mt-6 min-h-11 px-0" variant="link">
            {t('actions.discoverEvents')}
          </Link>
        </div>
      )
    }

    return (
      <>
        <span className="sr-only" aria-live="polite">
          {ordersQuery.isFetching ? t('states.loading') : null}
        </span>
        <ul
          className="space-y-3"
          aria-busy={ordersQuery.isFetching}
          aria-label={t('list.ariaLabel')}
        >
          {orders.map((order) => (
            <li key={order.documentId}>
              <OrderSummary order={order} onDelete={setSelectedOrder} />
            </li>
          ))}
        </ul>
        {renderPagination()}
      </>
    )
  }

  return (
    <Container>
      <div className="relative mx-auto w-full">
        <PageAtmosphereWash className="h-40" />
        <PageHeader title={t('page.title')} description={t('page.description')} />

        <aside className="mb-8 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-app border border-hairline/40 bg-surface-container-low/70 px-4 py-3.5 text-sm text-on-surface-variant sm:px-5">
          <Info className="size-7 shrink-0 text-primary" aria-hidden strokeWidth={1.75} />
          <p className="text-pretty leading-relaxed">{t('retentionNotice')}</p>
        </aside>

        {renderContent()}

        <DeleteOrderDialog
          open={selectedOrder !== null}
          order={selectedOrder}
          onOpenChange={(open) => {
            if (!open) setSelectedOrder(null)
          }}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteOrderMutation.isPending}
        />
      </div>
    </Container>
  )
}
