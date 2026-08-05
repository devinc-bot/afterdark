import { useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getPaginationItems,
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@repo/ui'
import { PageAtmosphereWash } from '~/modules/common/components/page-atmosphere-wash'
import { Container } from '~/modules/common/components/container'
import { PageHeader } from '~/modules/common/components/page-header'
import { usePurchasedTicketsQuery } from '../queries/use-purchased-tickets-query'
import { PURCHASED_TICKETS_FIRST_PAGE } from '../services/purchased-tickets.service'
import { TicketCard } from './ticket-card'

export function MyTicketsPage() {
  const { t } = useTranslation('tickets')
  const [page, setPage] = useState(PURCHASED_TICKETS_FIRST_PAGE)
  const [isPageTransitionPending, startPageTransition] = useTransition()
  const { data, isError, isLoading } = usePurchasedTicketsQuery({ page })
  const tickets = data?.data ?? []

  function handlePageChange(nextPage: number) {
    if (nextPage === page) return

    startPageTransition(() => setPage(nextPage))
  }

  function renderPagination() {
    if (!data || data.totalPages <= 1) return null

    return (
      <Pagination aria-label={t('mine.pagination.ariaLabel')} className="mt-10">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={page === PURCHASED_TICKETS_FIRST_PAGE || isPageTransitionPending}
              text={t('mine.pagination.previous')}
              onClick={() => handlePageChange(page - 1)}
            />
          </PaginationItem>

          {getPaginationItems(page, data.totalPages).map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis label={t('mine.pagination.morePages')} />
                </PaginationItem>
              )
            }

            return (
              <PaginationItem key={item}>
                <PaginationButton
                  isActive={item === page}
                  disabled={isPageTransitionPending}
                  aria-label={t('mine.pagination.page', { page: item })}
                  onClick={() => handlePageChange(item)}
                >
                  {item}
                </PaginationButton>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              disabled={page === data.totalPages || isPageTransitionPending}
              text={t('mine.pagination.next')}
              onClick={() => handlePageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  function renderContent() {
    if (isLoading) {
      return <p role="status">{t('mine.states.loading')}</p>
    }

    if (isError) {
      return <p role="alert">{t('mine.states.error')}</p>
    }

    if (tickets.length === 0) {
      return <p>{t('mine.states.empty')}</p>
    }

    return (
      <>
        <ul
          className="relative grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] sm:gap-7"
          aria-label={t('mine.list.ariaLabel')}
        >
          {tickets.map((ticket) => (
            <li key={ticket.documentId} className="min-w-0">
              <TicketCard ticket={ticket} />
            </li>
          ))}
        </ul>

        {renderPagination()}
      </>
    )
  }

  return (
    <Container>
      <div className="relative mx-auto w-full max-w-5xl">
        <PageAtmosphereWash className="h-40" />

        <PageHeader title={t('mine.page.title')} description={t('mine.page.description')} />

        {renderContent()}
      </div>
    </Container>
  )
}
