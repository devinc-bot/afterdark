import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AccountSessions, type AccountSessionsLabels } from '@repo/ui'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { getAccountSessions, revokeAccountSession } from '../services/account-sessions.service'

export function AccountSessionsView() {
  const { t, i18n } = useTranslation('settings')
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: QUERY_KEYS.accountSessions(), queryFn: getAccountSessions })
  const mutation = useMutation({
    mutationFn: revokeAccountSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accountSessions() })
    },
  })
  const labels: AccountSessionsLabels = {
    title: t('sessions.title'),
    description: t('sessions.description'),
    loading: t('sessions.loading'),
    loadError: t('sessions.loadError'),
    retry: t('sessions.retry'),
    empty: t('sessions.empty'),
    unknownDevice: t('sessions.unknownDevice'),
    metadataUnavailable: t('sessions.metadataUnavailable'),
    current: t('sessions.current'),
    close: t('sessions.close'),
    revoke: t('sessions.revoke'),
    revoking: t('sessions.revoking'),
    cancel: t('sessions.cancel'),
    confirmTitle: t('sessions.confirmTitle'),
    confirmDescription: t('sessions.confirmDescription'),
    getSessionCountLabel: (count) => t('sessions.count', { count }),
    getCreatedAtLabel: (createdAt) =>
      t('sessions.created', {
        date: createdAt.toLocaleString(i18n.language, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      }),
    getExpiresAtLabel: (expiresAt) =>
      t('sessions.expires', {
        date: expiresAt.toLocaleString(i18n.language, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      }),
    getStatusLabel: (status) => t(`sessions.status.${status}`),
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-8">
      <AccountSessions
        headingLevel="h1"
        sessions={query.data?.sessions}
        isLoading={query.isLoading}
        error={query.error}
        isRetrying={query.isFetching}
        revokeError={mutation.error}
        isRevoking={mutation.isPending}
        labels={labels}
        onRetry={() => void query.refetch()}
        onRevoke={mutation.mutateAsync}
        onClearRevokeError={mutation.reset}
      />
    </main>
  )
}
