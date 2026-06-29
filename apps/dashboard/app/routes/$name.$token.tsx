import { createFileRoute } from '@tanstack/react-router'
import { Skeleton } from '@afterdark/ui'
import { StaffInvitationAcceptView } from '~/modules/staff/components/staff-invitation-accept-view'
import { StaffInvitationErrorView } from '~/modules/staff/components/staff-invitation-error-view'
import { STAFF_INVITATION_VALIDATION_REASON } from '~/modules/staff/constants/staff-invitation.constants'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
import { useStaffInvitationByLink } from '~/modules/staff/queries/use-staff-invitation-by-link'
import { mapStaffInvitationLinkError } from '~/modules/staff/utils/staff-invitation-link.utils'

export const Route = createFileRoute('/$name/$token')({
  head: () => ({
    meta: [{ title: STAFF_COPY.invitation.accept.metaTitle }],
  }),
  component: StaffInvitationPage,
})

function StaffInvitationPage() {
  const { name, token } = Route.useParams()
  const copy = STAFF_COPY.invitation.accept
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
        <StaffInvitationErrorView title={copy.expiredTitle} description={copy.expiredDescription} />
      )
    }

    if (reason === STAFF_INVITATION_VALIDATION_REASON.SLUG_MISMATCH) {
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

  if (!data) {
    return (
      <StaffInvitationErrorView title={copy.invalidTitle} description={copy.invalidDescription} />
    )
  }

  return <StaffInvitationAcceptView invitation={data} token={token} />
}
