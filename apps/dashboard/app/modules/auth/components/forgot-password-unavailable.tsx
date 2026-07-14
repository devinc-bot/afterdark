import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'

export function ForgotPasswordUnavailable() {
  const { t } = useTranslation('auth')

  return (
    <section className="text-center" aria-labelledby="forgot-password-title">
      <h2
        id="forgot-password-title"
        className="font-display text-xl font-semibold text-balance text-on-surface"
      >
        {t('forgotPassword.title')}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-pretty text-on-surface-variant">
        {t('forgotPassword.description')}
      </p>
      <Button asChild size="lg" className="mt-7 w-full">
        <Link to={DASHBOARD_ROUTES.login()}>{t('forgotPassword.backToLogin')}</Link>
      </Button>
    </section>
  )
}
