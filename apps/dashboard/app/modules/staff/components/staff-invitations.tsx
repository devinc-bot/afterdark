import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@afterdark/ui'
import { Check, Copy } from 'lucide-react'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
import type { StaffInvitationRecord } from '~/modules/staff/types/staff-invitation-record'
import { isStaffInvitationExpired } from '~/modules/staff/types/staff-invitation-record'
import { formatInvitationTimeRemaining } from '~/modules/staff/utils/staff-invitation.utils'

type StaffInvitationsProps = {
  invitations: StaffInvitationRecord[]
}

function StaffInvitationStatusBadge({ invitation }: { invitation: StaffInvitationRecord }) {
  const copy = STAFF_COPY.invitationsTable
  const expired = isStaffInvitationExpired(invitation)

  if (expired) {
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

function StaffInvitationCopyAction({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const copy = STAFF_COPY.invitationsTable

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(STAFF_COPY.invitation.copied)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(STAFF_COPY.form.error)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-ink-muted hover:text-ink"
      iconLeft={
        copied ? (
          <Check aria-hidden="true" className="size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )
      }
      onClick={() => void handleCopy()}
      disabled={copied}
    >
      {copy.copyLink}
    </Button>
  )
}

function StaffInvitationExpiryCell({ invitation }: { invitation: StaffInvitationRecord }) {
  const [label, setLabel] = useState(() => {
    if (isStaffInvitationExpired(invitation)) {
      return STAFF_COPY.invitation.expired
    }
    return STAFF_COPY.invitation.expiresIn(formatInvitationTimeRemaining(invitation.expiresAt))
  })

  useEffect(() => {
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
  }, [invitation.expiresAt, invitation])

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

export function StaffInvitations({ invitations }: StaffInvitationsProps) {
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

      {invitations.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="font-heading text-base font-semibold text-ink">{copy.emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">{copy.emptyDescription}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-surface-container-low">
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
                  <TableCell className="text-right p-6">
                    <StaffInvitationCopyAction url={invitation.url} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
