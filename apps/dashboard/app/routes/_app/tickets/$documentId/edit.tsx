import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  TicketEditErrorView,
  TicketEditLoadingView,
  TicketEditNotFoundView,
  TicketEditView,
} from '~/modules/tickets/components/ticket-edit-view'
import { useTicket } from '~/modules/tickets/queries/use-ticket-queries'
import { usePageTitle } from '@repo/ui'

export const Route = createFileRoute('/_app/tickets/$documentId/edit')({
  component: TicketEditPage,
})

function TicketEditPage() {
  const { documentId } = Route.useParams()
  const { t } = useTranslation('tickets')
  const { data: ticket, isLoading, isError, error, refetch, isFetching } = useTicket(documentId)
  usePageTitle('tickets', 'editPage.metaTitle')

  if (isLoading) {
    return <TicketEditLoadingView />
  }

  if (isError) {
    return (
      <TicketEditErrorView
        message={error instanceof Error ? error.message : t('editPage.loadErrorFallback')}
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  if (!ticket) {
    return <TicketEditNotFoundView />
  }

  return <TicketEditView ticket={ticket} />
}
