import { useId, useState } from 'react'
import { RichEditor, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { LEGAL_DOCUMENT_TAB } from '~/modules/legal-documents/constants/legal-document-tabs'

type LegalDocumentSectionProps = {
  title: string
  description: string
  termsLabel: string
  privacyLabel: string
  termsEditorLabel: string
  privacyEditorLabel: string
}

export function LegalDocumentSection({
  title,
  description,
  termsLabel,
  privacyLabel,
  termsEditorLabel,
  privacyEditorLabel,
}: LegalDocumentSectionProps) {
  const [termsContent, setTermsContent] = useState('')
  const [privacyContent, setPrivacyContent] = useState('')
  const titleId = useId()

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
          <RichEditor
            value={termsContent}
            onChange={setTermsContent}
            editorAriaLabel={termsEditorLabel}
            className="[&_.ProseMirror]:min-h-[280px] sm:[&_.ProseMirror]:min-h-[340px]"
          />
        </TabsContent>

        <TabsContent value={LEGAL_DOCUMENT_TAB.PRIVACY} className="mt-5">
          <RichEditor
            value={privacyContent}
            onChange={setPrivacyContent}
            editorAriaLabel={privacyEditorLabel}
            className="[&_.ProseMirror]:min-h-[280px] sm:[&_.ProseMirror]:min-h-[340px]"
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}
