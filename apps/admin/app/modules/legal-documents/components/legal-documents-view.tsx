import { useTranslation } from 'react-i18next'
import { LegalDocumentSection } from './legal-document-section'

export function LegalDocumentsView() {
  const { t } = useTranslation('admin')

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <header className="max-w-2xl space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-ink text-balance">
          {t('legalDocuments.title')}
        </h1>
        <p className="text-sm leading-6 text-ink-muted text-pretty">
          {t('legalDocuments.description')}
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <LegalDocumentSection
          title={t('legalDocuments.organizations.title')}
          description={t('legalDocuments.organizations.description')}
          termsLabel={t('legalDocuments.tabs.terms')}
          privacyLabel={t('legalDocuments.tabs.privacy')}
          termsEditorLabel={t('legalDocuments.organizations.termsEditorLabel')}
          privacyEditorLabel={t('legalDocuments.organizations.privacyEditorLabel')}
        />

        <LegalDocumentSection
          title={t('legalDocuments.web.title')}
          description={t('legalDocuments.web.description')}
          termsLabel={t('legalDocuments.tabs.terms')}
          privacyLabel={t('legalDocuments.tabs.privacy')}
          termsEditorLabel={t('legalDocuments.web.termsEditorLabel')}
          privacyEditorLabel={t('legalDocuments.web.privacyEditorLabel')}
        />
      </div>
    </div>
  )
}
