import { useTranslation } from 'react-i18next'
import { createFileRoute } from '@tanstack/react-router'
import staffEs from '@afterdark/i18n/locales/staff/es.json'
import { Skeleton } from '@afterdark/ui'
import { StaffInvitationAcceptView } from '~/modules/staff/components/staff-invitation-accept-view'
import { StaffInvitationErrorView } from '~/modules/staff/components/staff-invitation-error-view'
import { STAFF_INVITATION_VALIDATION_REASON } from '~/modules/staff/constants/staff-invitation.constants'
import { useStaffInvitationByLink } from '~/modules/staff/queries/use-staff-invitation-by-link'
import { mapStaffInvitationLinkError } from '~/modules/staff/utils/staff-invitation-link.utils'

export const Route = createFileRoute('/$name/$token')({
  head: () => ({
    meta: [{ title: staffEs.invitation.accept.metaTitle }],
  }),
  component: StaffInvitationPage,
})

function StaffInvitationPage() {
  const { t } = useTranslation('staff')
  const { name, token } = Route.useParams()
  const { data, isPending, isError, error } = useStaffInvitationByLink(name, token)

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6">
        <Skeleton className="h-96 w-full max-w-md rounded-xl" aria-busy="true" />
      </div>
    )
  }

  if (isError) {
    const reason = mapStaffInvitationLinkError(error)

    if (reason === STAFF_INVITATION_VALIDATION_REASON.EXPIRED) {
      return (
        <StaffInvitationErrorView
          title={t('invitation.accept.expiredTitle')}
          description={t('invitation.accept.expiredDescription')}
        />
      )
    }

    if (reason === STAFF_INVITATION_VALIDATION_REASON.SLUG_MISMATCH) {
      return (
        <StaffInvitationErrorView
          title={t('invitation.accept.slugMismatchTitle')}
          description={t('invitation.accept.slugMismatchDescription')}
        />
      )
    }

    return (
      <StaffInvitationErrorView
        title={t('invitation.accept.invalidTitle')}
        description={t('invitation.accept.invalidDescription')}
      />
    )
  }

  if (!data) {
    return (
      <StaffInvitationErrorView
        title={t('invitation.accept.invalidTitle')}
        description={t('invitation.accept.invalidDescription')}
      />
    )
  }

  return <StaffInvitationAcceptView invitation={data} token={token} />
}
