import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ErrorsView } from '~/modules/errors/components/errors-view'

export const Route = createFileRoute('/_app/errors')({
  component: ErrorsRoute,
})

function ErrorsRoute() {
  const { t } = useTranslation('admin')

  return (
    <main className="bg-background">
      <h1 className="sr-only">{t('sections.errors')}</h1>
      <ErrorsView />
    </main>
  )
}
