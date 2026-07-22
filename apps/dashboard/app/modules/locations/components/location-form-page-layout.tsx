import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FormPageLayout } from '~/modules/common/components/form-page-layout'

type LocationFormPageLayoutProps = {
  title: string
  description: string
  onBack: () => void
  footer: ReactNode
  children: ReactNode
}

export function LocationFormPageLayout({
  title,
  description,
  onBack,
  footer,
  children,
}: LocationFormPageLayoutProps) {
  const { t } = useTranslation('locations')

  return (
    <FormPageLayout
      title={title}
      description={description}
      backLabel={t('formPage.back')}
      onBack={onBack}
      footer={footer}
    >
      {children}
    </FormPageLayout>
  )
}
