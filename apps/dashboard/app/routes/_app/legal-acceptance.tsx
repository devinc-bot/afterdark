import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@repo/ui'
import { LegalAcceptancePage } from '~/modules/legal-documents/components/legal-acceptance-page'

export const Route = createFileRoute('/_app/legal-acceptance')({
  component: LegalAcceptanceRoute,
})

function LegalAcceptanceRoute() {
  usePageTitle('auth', 'legalAcceptance.metaTitle')

  return <LegalAcceptancePage />
}
