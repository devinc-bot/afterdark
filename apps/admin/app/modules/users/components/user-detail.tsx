import { useTranslation } from 'react-i18next'
import type { AdminUserListItemResponse, AdminUserStatus } from '@repo/types'
import {
  Badge,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
} from '@repo/ui'
import { formatDate } from '@repo/common'
import { ADMIN_USER_STATUS } from '~/modules/users/constants/admin-user-status'
import { useAdminUserDetail } from '~/modules/users/queries/use-users-queries'

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string | null
  mono?: boolean
}) {
  const content = value ?? null

  return (
    <div className="flex flex-col gap-1">
      <dt className="font-label text-xs font-semibold tracking-label-xs text-ink-muted uppercase">
        {label}
      </dt>
      <dd className={mono ? 'font-mono text-sm break-all text-ink' : 'text-sm text-ink'}>
        {content ?? '—'}
      </dd>
    </div>
  )
}

function statusBadgeVariant(status: AdminUserStatus): 'secondary' | 'destructive' | 'outline' {
  if (status === ADMIN_USER_STATUS.ACTIVE) return 'secondary'
  if (status === ADMIN_USER_STATUS.INACTIVE) return 'destructive'
  return 'outline'
}

function DetailSkeleton() {
  return (
    <dl className="flex flex-col gap-5 py-4" aria-busy="true">
      {['a', 'b', 'c', 'd', 'e'].map((key) => (
        <div key={key} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>
      ))}
    </dl>
  )
}

export function UserDetail({
  user,
  onOpenChange,
}: {
  user: AdminUserListItemResponse | null
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('admin')
  const { data: detail, isLoading, isError } = useAdminUserDetail(user?.documentId ?? null)

  const headerName =
    user && (user.name || user.lastName) ? `${user.name ?? ''} ${user.lastName ?? ''}`.trim() : null

  const statusLabel = (status: AdminUserStatus | null): string | null => {
    if (status === ADMIN_USER_STATUS.ACTIVE) return t('users.detail.statusActive')
    if (status === ADMIN_USER_STATUS.INACTIVE) return t('users.detail.statusInactive')
    if (status === ADMIN_USER_STATUS.PENDING) return t('users.detail.statusPending')
    return status ?? null
  }

  const headerStatus = statusLabel(user?.status ?? null)

  return (
    <Sheet open={user !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        overlayClassName="bg-surface-strong/45 backdrop-blur-[2px]"
        closeLabel={t('users.detail.close')}
        className="inset-y-3 right-3 h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] gap-0 overflow-y-auto rounded-app border border-hairline bg-surface-raised p-6 shadow-glass sm:right-5 sm:w-full sm:max-w-xl"
      >
        {user ? (
          <>
            <SheetHeader className="border-b border-hairline pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t(`users.roles.${user.role}`)}</Badge>
                {user.status !== null ? (
                  <Badge variant={statusBadgeVariant(user.status)}>{headerStatus}</Badge>
                ) : null}
              </div>
              <SheetTitle className="text-left">
                {headerName ?? t('users.detail.noProfile')}
              </SheetTitle>
              <SheetDescription className="text-left font-mono text-xs break-all">
                {user.email}
              </SheetDescription>
            </SheetHeader>

            {isLoading ? (
              <DetailSkeleton />
            ) : isError || !detail ? (
              <p className="py-4 text-sm text-ink-muted">{t('users.detail.error')}</p>
            ) : (
              <dl className="flex flex-col gap-5 py-4">
                <DetailField label={t('users.detail.phone')} value={detail.phone} />
                <DetailField label={t('users.detail.birthday')} value={detail.birthday} />
                <DetailField label={t('users.detail.nationalId')} value={detail.nationalId} />
                <DetailField
                  label={t('users.detail.organization')}
                  value={detail.organizationName}
                />
                <DetailField label={t('users.detail.taxId')} value={detail.taxId} />
                <DetailField
                  label={t('users.detail.address')}
                  value={
                    detail.address
                      ? `${detail.address.address} ${detail.address.streetNumber}, ${detail.address.city}, ${detail.address.state}`
                      : null
                  }
                />
                <DetailField
                  label={t('users.detail.provider')}
                  value={
                    detail.provider === 'google'
                      ? t('users.detail.providerGoogle')
                      : t('users.detail.providerLocal')
                  }
                />
                <DetailField
                  label={t('users.detail.registeredAt')}
                  value={formatDate(new Date(detail.createdAt), {
                    options: { dateStyle: 'medium', timeStyle: 'medium' },
                  })}
                />
                <DetailField label={t('users.detail.documentId')} value={detail.documentId} mono />
              </dl>
            )}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
