import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('staff')
  const displayStatus = resolveStaffInvitationDisplayStatus(invitation)

  if (displayStatus === STAFF_INVITATION_STATUS.ACCEPTED) {
    return (
      <Badge variant="outline" size="sm" className="border-success/40 bg-success/10 text-success">
        {t('invitationsTable.statusAccepted')}
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
        {t('invitationsTable.statusCancelled')}
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
        {t('invitationsTable.statusExpired')}
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
      {t('invitationsTable.statusPending')}
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
  const { t } = useTranslation('staff')
  const showCopyLink = canCopyStaffInvitationLink(invitation)
  const showDelete = canDeleteStaffInvitation(invitation)

  if (!showCopyLink && !showDelete) {
    return null
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitation.url)
      toast.success(t('invitation.copied'))
    } catch {
      toast.error(t('form.error'))
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
          aria-label={`${t('invitationsTable.actions')} para ${invitation.email}`}
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
            {t('invitationsTable.copyLink')}
          </DropdownMenuItem>
        ) : null}
        {showDelete ? (
          <DropdownMenuItem
            className={cn(staffActionItemClassName, 'text-error focus:text-error')}
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 aria-hidden="true" className={cn(staffActionIconClassName, 'text-error')} />
            {t('invitationsTable.delete')}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function StaffInvitationExpiryCell({ invitation }: { invitation: StaffInvitationRecord }) {
  const { t } = useTranslation('staff')
  const displayStatus = resolveStaffInvitationDisplayStatus(invitation)

  const [label, setLabel] = useState(() => {
    if (displayStatus === STAFF_INVITATION_STATUS.ACCEPTED) {
      return t('invitationsTable.statusAccepted')
    }

    if (displayStatus === STAFF_INVITATION_STATUS.CANCELLED) {
      return t('invitationsTable.statusCancelled')
    }

    if (isStaffInvitationExpired(invitation)) {
      return t('invitation.expired')
    }

    return t('invitation.expiresIn', { time: formatInvitationTimeRemaining(invitation.expiresAt) })
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
        setLabel(t('invitation.expired'))
        return
      }

      setLabel(
        t('invitation.expiresIn', { time: formatInvitationTimeRemaining(invitation.expiresAt) })
      )
    }

    updateLabel()
    const interval = window.setInterval(updateLabel, 1000)
    return () => window.clearInterval(interval)
  }, [displayStatus, invitation, t])

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
  const { t } = useTranslation('staff')
  const registrySubtitle =
    invitations.length > 0
      ? t('invitationsTable.registryCount', { count: invitations.length })
      : null

  return (
    <section aria-labelledby="staff-invitations-heading">
      <header className="py-4">
        <h2
          id="staff-invitations-heading"
          className="font-heading text-lg font-semibold text-ink sm:text-xl"
        >
          {t('invitationsTable.title')}
        </h2>
        {registrySubtitle ? (
          <p className="mt-1 text-sm text-ink-muted">{registrySubtitle}</p>
        ) : null}
      </header>

      <Card variant="gradient">
        <Table variant="compact">
          <TableHeader>
            <TableRow>
              <TableHead className="p-6">{t('invitationsTable.email')}</TableHead>
              <TableHead className="p-6">{t('invitationsTable.venue')}</TableHead>
              <TableHead className="p-6">{t('invitationsTable.security')}</TableHead>
              <TableHead className="p-6">{t('invitationsTable.expires')}</TableHead>
              <TableHead className="p-6">{t('invitationsTable.status')}</TableHead>
              <TableHead className="text-right p-6">{t('invitationsTable.actions')}</TableHead>
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
                  {invitation.hasSecurityWord
                    ? t('invitationsTable.securityEnabled')
                    : t('invitationsTable.securityDisabled')}
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
