import { useState } from 'react'
import { CalendarClock, MapPin, Trash2 } from 'lucide-react'
import { ACCOUNT_SESSION_STATUS, type AccountSessionResponse } from '@repo/types'
import { cn } from '../lib/utils'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { LoadErrorBanner } from './ui/load-error-banner'
import { Skeleton } from './ui/skeleton'

export type AccountSessionsLabels = {
  title: string
  description: string
  loading: string
  loadError: string
  retry: string
  empty: string
  unknownDevice: string
  metadataUnavailable: string
  current: string
  close: string
  revoke: string
  revoking: string
  cancel: string
  confirmTitle: string
  confirmDescription: string
  getSessionCountLabel?: (count: number) => string
  getCreatedAtLabel: (createdAt: Date) => string
  getExpiresAtLabel: (expiresAt: Date) => string
  getStatusLabel: (status: AccountSessionResponse['status']) => string
}

export type AccountSessionsProps = {
  sessions?: readonly AccountSessionResponse[]
  isLoading: boolean
  error: Error | null
  isRetrying?: boolean
  revokeError: Error | null
  isRevoking: boolean
  labels: AccountSessionsLabels
  onRetry: () => void
  onRevoke: (documentId: string) => Promise<void>
  onClearRevokeError: () => void
  className?: string
  headingLevel?: 'h1' | 'h2'
}

function getStatusBadgeVariant(status: AccountSessionResponse['status']) {
  if (status === ACCOUNT_SESSION_STATUS.REVOKED) {
    return 'destructive' as const
  }

  if (status === ACCOUNT_SESSION_STATUS.EXPIRED) {
    return 'outline' as const
  }

  return 'secondary' as const
}

function AccountSessionListSkeleton({ label }: { label: string }) {
  return (
    <div
      className="mt-5 divide-y divide-outline-variant/35 border-y border-outline-variant/35"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      {[1, 2].map((index) => (
        <div key={index} className="min-w-0 space-y-2 py-5">
          <Skeleton className="h-4 w-40 max-w-full" />
          <Skeleton className="h-3.5 w-56 max-w-full" />
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-3 w-36 max-w-full" />
            <Skeleton className="h-3 w-36 max-w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AccountSessions({
  sessions,
  isLoading,
  error,
  isRetrying = false,
  revokeError,
  isRevoking,
  labels,
  onRetry,
  onRevoke,
  onClearRevokeError,
  className,
  headingLevel = 'h2',
}: AccountSessionsProps) {
  const [selected, setSelected] = useState<AccountSessionResponse | null>(null)
  const [revokedSessionDocumentIds, setRevokedSessionDocumentIds] = useState<ReadonlySet<string>>(
    new Set()
  )
  const Heading = headingLevel
  const visibleSessions = sessions?.filter(
    (session) =>
      session.status !== ACCOUNT_SESSION_STATUS.REVOKED &&
      !revokedSessionDocumentIds.has(session.documentId)
  )

  async function handleRevoke() {
    if (!selected) {
      return
    }

    try {
      await onRevoke(selected.documentId)
      setRevokedSessionDocumentIds((documentIds) => new Set(documentIds).add(selected.documentId))
      setSelected(null)
    } catch {
      // The caller provides the mutation error state for the confirmation dialog.
    }
  }

  function handleDialogOpenChange(open: boolean) {
    if (!open) {
      onClearRevokeError()
      setSelected(null)
    }
  }

  function handleRevokeSelection(session: AccountSessionResponse) {
    onClearRevokeError()
    setSelected(session)
  }

  return (
    <section className={cn(className)} aria-labelledby="account-sessions-heading">
      <div className="max-w-2xl">
        <Heading
          id="account-sessions-heading"
          className="font-display text-xl font-semibold text-wrap-balance"
        >
          {labels.title}
        </Heading>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">{labels.description}</p>
        {visibleSessions && labels.getSessionCountLabel ? (
          <p className="mt-3 font-label text-xs font-semibold tracking-label-sm text-ink-muted">
            {labels.getSessionCountLabel(visibleSessions.length)}
          </p>
        ) : null}
      </div>

      {isLoading ? <AccountSessionListSkeleton label={labels.loading} /> : null}

      {error ? (
        <LoadErrorBanner
          className="my-5 w-full max-w-none"
          message={error.message || labels.loadError}
          retryLabel={labels.retry}
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      ) : null}

      {visibleSessions?.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">{labels.empty}</p>
      ) : null}

      {visibleSessions ? (
        <ul className="mt-5 divide-y divide-outline-variant/35 border-y border-outline-variant/35">
          {visibleSessions.map((session) => {
            const canRevoke = !session.isCurrent && session.status === ACCOUNT_SESSION_STATUS.ACTIVE
            const metadata = [session.locationLabel, session.ipAddress].filter(Boolean).join(' · ')

            return (
              <li
                key={session.documentId}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="min-w-0 font-medium text-ink">
                      {session.device ?? labels.unknownDevice}
                    </p>
                    {session.isCurrent ? <Badge size="sm">{labels.current}</Badge> : null}
                    <Badge size="sm" variant={getStatusBadgeVariant(session.status)}>
                      {labels.getStatusLabel(session.status)}
                    </Badge>
                  </div>
                  <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{metadata || labels.metadataUnavailable}</span>
                  </p>
                  <div className="mt-3 grid gap-x-6 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
                      <p className="truncate">
                        {labels.getCreatedAtLabel(new Date(session.createdAt))}
                      </p>
                    </div>
                    <div className="flex min-w-0 items-center gap-1.5">
                      <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
                      <p className="truncate">
                        {labels.getExpiresAtLabel(new Date(session.expiresAt))}
                      </p>
                    </div>
                  </div>
                </div>
                {canRevoke ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 self-start sm:self-center hover:bg-red-500/10 hover:text-red-500"
                    onClick={() => handleRevokeSelection(session)}
                  >
                    <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{labels.revoke}</span>
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      <Dialog open={selected !== null} onOpenChange={handleDialogOpenChange}>
        <DialogContent variant="destructive" size="sm" closeLabel={labels.close}>
          <DialogHeader>
            <DialogTitle>{labels.confirmTitle}</DialogTitle>
            <DialogDescription>{labels.confirmDescription}</DialogDescription>
          </DialogHeader>
          {revokeError ? <p role="alert">{revokeError.message}</p> : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              disabled={isRevoking}
            >
              {labels.cancel}
            </Button>
            <Button variant="destructive" onClick={() => void handleRevoke()} loading={isRevoking}>
              {isRevoking ? labels.revoking : labels.revoke}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
