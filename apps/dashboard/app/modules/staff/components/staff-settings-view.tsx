import { useTranslation } from 'react-i18next'
import { PageLayout } from '~/modules/common/components/page-layout'

export function StaffSettingsView() {
  const { t } = useTranslation('settings')

  return (
    <PageLayout title={t('staff.page.title')} narrow>
      <p className="text-sm text-ink-muted">{t('staff.placeholder')}</p>
    </PageLayout>
  )
}
