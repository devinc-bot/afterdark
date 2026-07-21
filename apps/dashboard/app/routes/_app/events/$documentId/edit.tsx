import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { EventWizardEditView } from '~/modules/events/components/event-wizard-edit-view'
import { useEvent } from '~/modules/events/queries/use-event-queries'
import { PageLayout } from '~/modules/common/components/page-layout'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { Button, usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/_app/events/$documentId/edit')({
  component: EventEditPage,
})

function EventEditPage() {
  const { documentId } = Route.useParams()
  const { t } = useTranslation('events')
  const { data: event, isLoading, isError, error } = useEvent(documentId)
  usePageTitle('events', 'wizard.editMetaTitle')

  if (isLoading) {
    return (
      <div className="rounded-xl border border-hairline bg-surface-container-low px-6 py-12 text-center">
        <p className="text-sm text-ink-muted">{t('wizard.loading')}</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-dashed border-error/40 bg-error-container/20 px-6 py-12 text-center">
        <p className="font-heading text-base font-semibold text-ink">
          {t('wizard.loadErrorTitle')}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
          {error instanceof Error ? error.message : t('wizard.loadErrorFallback')}
        </p>
      </div>
    )
  }

  if (!event) {
    return (
      <PageLayout title={t('wizard.notFoundTitle')} description={t('wizard.notFoundDescription')}>
        <div>
          <Button asChild variant="outline">
            <Link to={DASHBOARD_ROUTES.events()}>{t('wizard.back')}</Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

  return <EventWizardEditView event={event} />
}
