import { useEffect, useState } from 'react'
import { Button, Input, toast } from '@afterdark/ui'
import { Check, Copy } from 'lucide-react'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
import type { StaffInvitationSuccess } from '~/modules/staff/components/staff-user-form'
import { formatInvitationTimeRemaining } from '~/modules/staff/utils/staff-invitation.utils'

type StaffInvitationSuccessPanelProps = {
  invitation: StaffInvitationSuccess
  onClose: () => void
}

export function StaffInvitationSuccessPanel({
  invitation,
  onClose,
}: StaffInvitationSuccessPanelProps) {
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(() =>
    formatInvitationTimeRemaining(invitation.expiresAt)
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeRemaining(formatInvitationTimeRemaining(invitation.expiresAt))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [invitation.expiresAt])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitation.url)
      setCopied(true)
      toast.success(STAFF_COPY.invitation.copied)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(STAFF_COPY.form.error)
    }
  }

  const isExpired = invitation.expiresAt <= Date.now()
  const hasSecurityWord = invitation.hasSecurityWord

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-8">
        <div>
          <h3 className="font-heading text-lg font-semibold text-ink">
            {STAFF_COPY.invitation.successTitle}
          </h3>
          <p className="mt-2 text-sm text-ink-muted">{STAFF_COPY.invitation.successDescription}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="staff-invitation-link" className="text-sm font-medium text-ink">
            {STAFF_COPY.invitation.linkLabel}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="staff-invitation-link"
              readOnly
              value={invitation.url}
              className="font-mono text-xs sm:text-sm"
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              iconLeft={copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              onClick={() => void handleCopy()}
            >
              {copied ? STAFF_COPY.invitation.copied : STAFF_COPY.invitation.copy}
            </Button>
          </div>
        </div>

        <p className={isExpired ? 'text-sm font-medium text-error' : 'text-sm text-ink-muted'}>
          {isExpired
            ? STAFF_COPY.invitation.expired
            : STAFF_COPY.invitation.expiresIn(timeRemaining)}
        </p>

        {hasSecurityWord ? (
          <p className="text-sm text-ink-muted">{STAFF_COPY.invitation.securityWordNote}</p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-hairline px-6 py-6 sm:px-8">
        <Button type="button" className="w-full sm:ml-auto sm:w-auto" onClick={onClose}>
          {STAFF_COPY.invitation.close}
        </Button>
      </div>
    </div>
  )
}
