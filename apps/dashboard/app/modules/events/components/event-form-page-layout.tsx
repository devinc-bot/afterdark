import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FormPageLayout } from '~/modules/common/components/form-page-layout'

type EventFormPageLayoutProps = {
  title: string
  description: string
  onBack: () => void
  footer: ReactNode
  footerBanner?: ReactNode
  children: ReactNode
}

export function EventFormPageLayout({
  title,
  description,
  onBack,
  footer,
  footerBanner,
  children,
}: EventFormPageLayoutProps) {
  const { t } = useTranslation('events')

  return (
    <FormPageLayout
      title={title}
      description={description}
      backLabel={t('form.back')}
      onBack={onBack}
      footer={footer}
      footerBanner={footerBanner}
    >
      {children}
    </FormPageLayout>
  )
}
