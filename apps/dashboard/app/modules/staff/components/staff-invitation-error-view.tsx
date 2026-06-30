import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button, Card } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

type StaffInvitationErrorViewProps = {
  title: string
  description: string
}

export function StaffInvitationErrorView({ title, description }: StaffInvitationErrorViewProps) {
  const { t } = useTranslation('staff')

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="px-6 py-5 sm:px-8">
        <Link
          to={DASHBOARD_ROUTES.login()}
          className="text-lg tracking-tight text-ink transition-colors duration-150 hover:text-primary"
        >
          afterdark
        </Link>
      </header>

      <main className="grid flex-1 place-items-center px-6 py-12">
        <div className="motion-reduce:animate-none animate-fade-up w-full max-w-md">
          <Card variant="gradient" className="p-6 text-center sm:p-8">
            <h1 className="font-heading text-xl font-semibold text-ink">{title}</h1>
            <p className="mt-3 text-sm text-ink-muted">{description}</p>
            <Button asChild className="mt-6">
              <Link to={DASHBOARD_ROUTES.login()}>{t('invitation.accept.goToLogin')}</Link>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}
