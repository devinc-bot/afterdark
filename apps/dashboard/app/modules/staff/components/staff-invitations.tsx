import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@afterdark/ui'
import { STAFF_INVITATION_STATUS } from '@afterdark/types'
import { Copy, EllipsisVertical, Trash2 } from 'lucide-react'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
import type { StaffInvitationRecord } from '~/modules/staff/types/staff-invitation-record'
import {
  canCopyStaffInvitationLink,
  canDeleteStaffInvitation,
  isStaffInvitationExpired,
  resolveStaffInvitationDisplayStatus,
} from '~/modules/staff/types/staff-invitation-record'
import { formatInvitationTimeRemaining } from '~/modules/staff/utils/staff-invitation.utils'

type StaffInvitationsProps = {
  invitations: StaffInvitationRecord[]
  onDelete?: (invitationId: string) => void
  deletingInvitationId?: string | null
}

const staffActionIconClassName = '!size-[20px] shrink-0'
const staffActionItemClassName = 'gap-3 py-2.5 text-base'

function StaffInvitationStatusBadge({ invitation }: { invitation: StaffInvitationRecord }) {
  const copy = STAFF_COPY.invitationsTable
  const displayStatus = resolveStaffInvitationDisplayStatus(invitation)

  if (displayStatus === STAFF_INVITATION_STATUS.ACCEPTED) {
    return (
      <Badge variant="outline" size="sm" className="border-success/40 bg-success/10 text-success">
        {copy.statusAccepted}
      </Badge>
    )
  }

  if (displayStatus === STAFF_INVITATION_STATUS.CANCELLED) {
    return (
      <Badge
        variant="outline"
        size="sm"
        className="border-hairline bg-surface-container text-ink-muted"
      >
        {copy.statusCancelled}
      </Badge>
    )
  }

  if (displayStatus === STAFF_INVITATION_STATUS.EXPIRED) {
    return (
      <Badge
        variant="outline"
        size="sm"
        className="border-error/50 bg-error-container/30 text-error"
      >
        {copy.statusExpired}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      size="sm"
      className="gap-2 border-primary/40 bg-primary/10 text-primary"
      icon={<span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />}
    >
      {copy.statusPending}
    </Badge>
  )
}

function StaffInvitationRecordActions({
  invitation,
  onDelete,
  isDeleting = false,
}: {
  invitation: StaffInvitationRecord
  onDelete?: (invitationId: string) => void
  isDeleting?: boolean
}) {
  const copy = STAFF_COPY.invitationsTable
  const showCopyLink = canCopyStaffInvitationLink(invitation)
  const showDelete = canDeleteStaffInvitation(invitation)

  if (!showCopyLink && !showDelete) {
    return null
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitation.url)
      toast.success(STAFF_COPY.invitation.copied)
    } catch {
      toast.error(STAFF_COPY.form.error)
    }
  }

  const handleDelete = () => {
    onDelete?.(invitation.id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-ink-muted hover:text-ink"
          aria-label={`${copy.actions} para ${invitation.email}`}
          disabled={isDeleting}
        >
          <EllipsisVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 p-1.5">
        {showCopyLink ? (
          <DropdownMenuItem
            className={staffActionItemClassName}
            onClick={() => void handleCopyLink()}
          >
            <Copy aria-hidden="true" className={staffActionIconClassName} />
            {copy.copyLink}
          </DropdownMenuItem>
        ) : null}
        {showDelete ? (
          <DropdownMenuItem
            className={cn(staffActionItemClassName, 'text-error focus:text-error')}
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 aria-hidden="true" className={cn(staffActionIconClassName, 'text-error')} />
            {copy.delete}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function StaffInvitationExpiryCell({ invitation }: { invitation: StaffInvitationRecord }) {
  const displayStatus = resolveStaffInvitationDisplayStatus(invitation)

  const [label, setLabel] = useState(() => {
    if (displayStatus === STAFF_INVITATION_STATUS.ACCEPTED) {
      return STAFF_COPY.invitationsTable.statusAccepted
    }

    if (displayStatus === STAFF_INVITATION_STATUS.CANCELLED) {
      return STAFF_COPY.invitationsTable.statusCancelled
    }

    if (isStaffInvitationExpired(invitation)) {
      return STAFF_COPY.invitation.expired
    }

    return STAFF_COPY.invitation.expiresIn(formatInvitationTimeRemaining(invitation.expiresAt))
  })

  useEffect(() => {
    if (
      displayStatus === STAFF_INVITATION_STATUS.ACCEPTED ||
      displayStatus === STAFF_INVITATION_STATUS.CANCELLED
    ) {
      return
    }

    const updateLabel = () => {
      if (isStaffInvitationExpired(invitation)) {
        setLabel(STAFF_COPY.invitation.expired)
        return
      }

      setLabel(STAFF_COPY.invitation.expiresIn(formatInvitationTimeRemaining(invitation.expiresAt)))
    }

    updateLabel()
    const interval = window.setInterval(updateLabel, 1000)
    return () => window.clearInterval(interval)
  }, [displayStatus, invitation])

  return (
    <span
      className={
        isStaffInvitationExpired(invitation) ? 'text-sm text-error' : 'text-sm text-ink-muted'
      }
    >
      {label}
    </span>
  )
}

export function StaffInvitations({
  invitations,
  onDelete,
  deletingInvitationId = null,
}: StaffInvitationsProps) {
  const copy = STAFF_COPY.invitationsTable
  const registrySubtitle = invitations.length > 0 ? copy.registryCount(invitations.length) : null

  return (
    <section aria-labelledby="staff-invitations-heading">
      <header className="py-4">
        <h2
          id="staff-invitations-heading"
          className="font-heading text-lg font-semibold text-ink sm:text-xl"
        >
          {copy.title}
        </h2>
        {registrySubtitle ? (
          <p className="mt-1 text-sm text-ink-muted">{registrySubtitle}</p>
        ) : null}
      </header>

      <Card variant="gradient">
        <Table variant="compact">
          <TableHeader>
            <TableRow>
              <TableHead className="p-6">{copy.email}</TableHead>
              <TableHead className="p-6">{copy.venue}</TableHead>
              <TableHead className="p-6">{copy.security}</TableHead>
              <TableHead className="p-6">{copy.expires}</TableHead>
              <TableHead className="p-6">{copy.status}</TableHead>
              <TableHead className="text-right p-6">{copy.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="p-6">
                  <p className="font-medium text-ink">{invitation.email}</p>
                </TableCell>
                <TableCell className="p-6">
                  <Badge variant="outline" size="sm">
                    {invitation.clubName}
                  </Badge>
                </TableCell>
                <TableCell className="p-6 text-sm text-ink-muted">
                  {invitation.hasSecurityWord ? copy.securityEnabled : copy.securityDisabled}
                </TableCell>
                <TableCell className="p-6">
                  <StaffInvitationExpiryCell invitation={invitation} />
                </TableCell>
                <TableCell className="p-6">
                  <StaffInvitationStatusBadge invitation={invitation} />
                </TableCell>
                <TableCell className="p-6 text-right">
                  <StaffInvitationRecordActions
                    invitation={invitation}
                    onDelete={onDelete}
                    isDeleting={deletingInvitationId === invitation.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </section>
  )
}
