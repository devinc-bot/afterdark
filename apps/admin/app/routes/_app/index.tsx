import { createFileRoute, redirect } from '@tanstack/react-router'
import { ADMIN_ROUTES } from '~/modules/common/constants/routes'

export const Route = createFileRoute('/_app/')({
  beforeLoad: () => {
    throw redirect({ to: ADMIN_ROUTES.users() })
  },
})
