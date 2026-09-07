import {
  LEGAL_DOCUMENT_TYPE,
  type LegalDocumentByTypeResponse,
  type LegalDocumentType,
} from '@repo/types'
import { Button } from '@repo/ui'
import { useTranslation } from 'react-i18next'
import { LegalDocumentSection } from './legal-document-section'
import {
  usePublishLegalDocument,
  useSaveLegalDocumentDraft,
} from '../mutations/use-legal-documents-mutations'
import { useLegalDocumentsQuery } from '../queries/use-legal-documents-query'
import { editorValueToTipTapJson } from '../utils/legal-document-content'

function documentForType(
  documents: LegalDocumentByTypeResponse[],
  type: LegalDocumentType
): LegalDocumentByTypeResponse {
  return (
    documents.find((document) => document.type === type) ?? { type, draft: null, published: null }
  )
}

export function LegalDocumentsView() {
  const { t } = useTranslation('admin')
  const { data, error, isError, isPending, refetch } = useLegalDocumentsQuery()
  const saveMutation = useSaveLegalDocumentDraft()
  const publishMutation = usePublishLegalDocument()

  function handleSave(type: LegalDocumentType, value: string, title: string) {
    saveMutation.mutate({
      type,
      input: {
        title,
        content: editorValueToTipTapJson(value),
      },
    })
  }

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

      {isPending ? (
        <p role="status" className="text-sm leading-6 text-ink-muted">
          {t('legalDocuments.loading')}
        </p>
      ) : isError || !data ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-sm leading-6 text-error">
            {error instanceof Error ? error.message : t('legalDocuments.loadError')}
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            {t('legalDocuments.retry')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <LegalDocumentSection
            title={t('legalDocuments.organizations.title')}
            description={t('legalDocuments.organizations.description')}
            termsLabel={t('legalDocuments.tabs.terms')}
            privacyLabel={t('legalDocuments.tabs.privacy')}
            termsEditorLabel={t('legalDocuments.organizations.termsEditorLabel')}
            privacyEditorLabel={t('legalDocuments.organizations.privacyEditorLabel')}
            termsType={LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD}
            privacyType={LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD}
            termsDocument={documentForType(data, LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD)}
            privacyDocument={documentForType(data, LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD)}
            saveLabel={t('legalDocuments.save')}
            savingLabel={t('legalDocuments.saving')}
            publishLabel={t('legalDocuments.publish')}
            publishingLabel={t('legalDocuments.publishing')}
            savingType={saveMutation.isPending ? (saveMutation.variables?.type ?? null) : null}
            publishingType={publishMutation.isPending ? (publishMutation.variables ?? null) : null}
            onSave={handleSave}
            onPublish={publishMutation.mutate}
          />

          <LegalDocumentSection
            title={t('legalDocuments.web.title')}
            description={t('legalDocuments.web.description')}
            termsLabel={t('legalDocuments.tabs.terms')}
            privacyLabel={t('legalDocuments.tabs.privacy')}
            termsEditorLabel={t('legalDocuments.web.termsEditorLabel')}
            privacyEditorLabel={t('legalDocuments.web.privacyEditorLabel')}
            termsType={LEGAL_DOCUMENT_TYPE.TERMS_WEB}
            privacyType={LEGAL_DOCUMENT_TYPE.PRIVACY_WEB}
            termsDocument={documentForType(data, LEGAL_DOCUMENT_TYPE.TERMS_WEB)}
            privacyDocument={documentForType(data, LEGAL_DOCUMENT_TYPE.PRIVACY_WEB)}
            saveLabel={t('legalDocuments.save')}
            savingLabel={t('legalDocuments.saving')}
            publishLabel={t('legalDocuments.publish')}
            publishingLabel={t('legalDocuments.publishing')}
            savingType={saveMutation.isPending ? (saveMutation.variables?.type ?? null) : null}
            publishingType={publishMutation.isPending ? (publishMutation.variables ?? null) : null}
            onSave={handleSave}
            onPublish={publishMutation.mutate}
          />
        </div>
      )}
    </div>
  )
}
