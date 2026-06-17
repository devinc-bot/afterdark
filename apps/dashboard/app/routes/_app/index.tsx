import { createFileRoute, redirect } from '@tanstack/react-router'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

export const Route = createFileRoute('/_app/')({
  beforeLoad: () => {
    throw redirect({ to: DASHBOARD_ROUTES.home() })
  },
})
