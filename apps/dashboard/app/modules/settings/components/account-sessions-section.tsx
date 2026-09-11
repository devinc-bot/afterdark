import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AccountSessions, buildAccountSessionsLabels } from '@repo/ui'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { getAccountSessions, revokeAccountSession } from '../services/account-sessions.service'

export function AccountSessionsSection() {
  const { t, i18n } = useTranslation('settings')
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: QUERY_KEYS.accountSessions(), queryFn: getAccountSessions })
  const mutation = useMutation({
    mutationFn: revokeAccountSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accountSessions() })
    },
  })

  return (
    <div className="mt-10 px-4 sm:px-8">
      <AccountSessions
        className="mx-auto w-full max-w-6xl border-t border-outline-variant/35 pt-8"
        sessions={query.data?.sessions}
        isLoading={query.isLoading}
        error={query.error}
        isRetrying={query.isFetching}
        revokeError={mutation.error}
        isRevoking={mutation.isPending}
        labels={buildAccountSessionsLabels(t, i18n.language)}
        onRetry={() => void query.refetch()}
        onRevoke={mutation.mutateAsync}
        onClearRevokeError={mutation.reset}
      />
    </div>
  )
}
