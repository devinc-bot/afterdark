import { createFileRoute } from '@tanstack/react-router'
import { RequireGuest } from '~/modules/common/components/require-guest'
import { LandingPage } from '~/modules/landing/components/landing-page'

export const Route = createFileRoute('/')({
  component: LandingRoute,
})

function LandingRoute() {
  return (
    <RequireGuest>
      <LandingPage />
    </RequireGuest>
  )
}
