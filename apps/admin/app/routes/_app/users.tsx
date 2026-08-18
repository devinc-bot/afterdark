import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/users')({
  component: UsersRoute,
})

function UsersRoute() {
  const { t } = useTranslation('admin')

  return (
    <main className="bg-background">
      <h1 className="sr-only">{t('sections.users')}</h1>
    </main>
  )
}
