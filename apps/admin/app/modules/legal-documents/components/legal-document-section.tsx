import { useId, useState } from 'react'
import type { LegalDocumentByTypeResponse, LegalDocumentType } from '@repo/types'
import { Button, RichEditor, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { LEGAL_DOCUMENT_TAB } from '~/modules/legal-documents/constants/legal-document-tabs'
import { tipTapJsonToEditorValue } from '../utils/legal-document-content'

type LegalDocumentSectionProps = {
  title: string
  description: string
  termsLabel: string
  privacyLabel: string
  termsEditorLabel: string
  privacyEditorLabel: string
  termsType: LegalDocumentType
  privacyType: LegalDocumentType
  termsDocument: LegalDocumentByTypeResponse
  privacyDocument: LegalDocumentByTypeResponse
  saveLabel: string
  savingLabel: string
  publishLabel: string
  publishingLabel: string
  savingType: LegalDocumentType | null
  publishingType: LegalDocumentType | null
  onSave: (type: LegalDocumentType, value: string, title: string) => void
  onPublish: (type: LegalDocumentType) => void
}

type LegalDocumentEditorPaneProps = {
  documentType: LegalDocumentType
  title: string
  editorLabel: string
  value: string
  hasDraft: boolean
  saveLabel: string
  savingLabel: string
  publishLabel: string
  publishingLabel: string
  isSaving: boolean
  isPublishing: boolean
  onChange: (value: string) => void
  onSave: (type: LegalDocumentType, value: string, title: string) => void
  onPublish: (type: LegalDocumentType) => void
}

function persistedContent(document: LegalDocumentByTypeResponse): Record<string, unknown> | null {
  return document.draft?.content ?? document.published?.content ?? null
}

function LegalDocumentEditorPane({
  documentType,
  title,
  editorLabel,
  value,
  hasDraft,
  saveLabel,
  savingLabel,
  publishLabel,
  publishingLabel,
  isSaving,
  isPublishing,
  onChange,
  onSave,
  onPublish,
}: LegalDocumentEditorPaneProps) {
  const canPublish = hasDraft && !isPublishing

  return (
    <div className="flex flex-col gap-4">
      <RichEditor
        value={value}
        onChange={onChange}
        editorAriaLabel={editorLabel}
        scrollable
      />
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={isSaving}
          loading={isSaving}
          onClick={() => onSave(documentType, value, title)}
        >
          {isSaving ? savingLabel : saveLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!canPublish}
          loading={isPublishing}
          onClick={() => {
            if (!hasDraft) return
            onPublish(documentType)
          }}
        >
          {isPublishing ? publishingLabel : publishLabel}
        </Button>
      </div>
    </div>
  )
}

export function LegalDocumentSection({
  title,
  description,
  termsLabel,
  privacyLabel,
  termsEditorLabel,
  privacyEditorLabel,
  termsType,
  privacyType,
  termsDocument,
  privacyDocument,
  saveLabel,
  savingLabel,
  publishLabel,
  publishingLabel,
  savingType,
  publishingType,
  onSave,
  onPublish,
}: LegalDocumentSectionProps) {
  const titleId = useId()
  const [termsContent, setTermsContent] = useState(() =>
    tipTapJsonToEditorValue(persistedContent(termsDocument))
  )
  const [privacyContent, setPrivacyContent] = useState(() =>
    tipTapJsonToEditorValue(persistedContent(privacyDocument))
  )

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-5 border-t border-hairline pt-7 first:border-t-0 first:pt-0"
    >
      <div className="max-w-2xl space-y-1.5">
        <h2 id={titleId} className="font-heading text-xl font-semibold text-ink text-balance">
          {title}
        </h2>
        <p className="text-sm leading-6 text-ink-muted text-pretty">{description}</p>
      </div>

      <Tabs defaultValue={LEGAL_DOCUMENT_TAB.TERMS}>
        <TabsList variant="line" aria-label={title}>
          <TabsTrigger variant="line" value={LEGAL_DOCUMENT_TAB.TERMS}>
            {termsLabel}
          </TabsTrigger>
          <TabsTrigger variant="line" value={LEGAL_DOCUMENT_TAB.PRIVACY}>
            {privacyLabel}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={LEGAL_DOCUMENT_TAB.TERMS} className="mt-5">
          <LegalDocumentEditorPane
            documentType={termsType}
            title={termsLabel}
            editorLabel={termsEditorLabel}
            value={termsContent}
            hasDraft={termsDocument.draft !== null}
            saveLabel={saveLabel}
            savingLabel={savingLabel}
            publishLabel={publishLabel}
            publishingLabel={publishingLabel}
            isSaving={savingType === termsType}
            isPublishing={publishingType === termsType}
            onChange={setTermsContent}
            onSave={onSave}
            onPublish={onPublish}
          />
        </TabsContent>

        <TabsContent value={LEGAL_DOCUMENT_TAB.PRIVACY} className="mt-5">
          <LegalDocumentEditorPane
            documentType={privacyType}
            title={privacyLabel}
            editorLabel={privacyEditorLabel}
            value={privacyContent}
            hasDraft={privacyDocument.draft !== null}
            saveLabel={saveLabel}
            savingLabel={savingLabel}
            publishLabel={publishLabel}
            publishingLabel={publishingLabel}
            isSaving={savingType === privacyType}
            isPublishing={publishingType === privacyType}
            onChange={setPrivacyContent}
            onSave={onSave}
            onPublish={onPublish}
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}
