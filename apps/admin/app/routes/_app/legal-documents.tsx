import { createFileRoute } from '@tanstack/react-router'
import { LegalDocumentsView } from '~/modules/legal-documents/components/legal-documents-view'

export const Route = createFileRoute('/_app/legal-documents')({
  component: LegalDocumentsRoute,
})

function LegalDocumentsRoute() {
  return (
    <main className="bg-background">
      <LegalDocumentsView />
    </main>
  )
}
