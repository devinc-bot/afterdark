import { createFileRoute } from '@tanstack/react-router'
import { StaffInvitationAcceptView } from '~/modules/staff/components/staff-invitation-accept-view'
import { StaffInvitationErrorView } from '~/modules/staff/components/staff-invitation-error-view'
import { STAFF_INVITATION_VALIDATION_REASON } from '~/modules/staff/constants/staff-invitation.constants'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
import { validateStaffInvitation } from '~/modules/staff/utils/staff-invitation.utils'

export const Route = createFileRoute('/$name/$token')({
  head: () => ({
    meta: [{ title: STAFF_COPY.invitation.accept.metaTitle }],
  }),
  component: StaffInvitationPage,
})

function StaffInvitationPage() {
  const { name, token } = Route.useParams()
  const copy = STAFF_COPY.invitation.accept
  const result = validateStaffInvitation(name, token)

  if (!result.ok) {
    if (result.reason === STAFF_INVITATION_VALIDATION_REASON.EXPIRED) {
      return (
        <StaffInvitationErrorView title={copy.expiredTitle} description={copy.expiredDescription} />
      )
    }

    if (result.reason === STAFF_INVITATION_VALIDATION_REASON.SLUG_MISMATCH) {
      return (
        <StaffInvitationErrorView
          title={copy.slugMismatchTitle}
          description={copy.slugMismatchDescription}
        />
      )
    }

    return (
      <StaffInvitationErrorView title={copy.invalidTitle} description={copy.invalidDescription} />
    )
  }

  return <StaffInvitationAcceptView payload={result.payload} />
}
