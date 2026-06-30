import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@afterdark/ui'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { StaffInvitationsTab } from '~/modules/staff/components/staff-invitations-tab'
import { StaffPersonnelTab } from '~/modules/staff/components/staff-personnel-tab'
import { StaffUserCreateDialog } from '~/modules/staff/components/staff-user-create-dialog'
import { STAFF_TAB } from '~/modules/staff/constants/staff-tabs.constants'
import { PageLayout } from '~/modules/common/components/page-layout'

export function StaffManagementView() {
  const { t } = useTranslation('staff')
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<string>(STAFF_TAB.STAFF)

  const handleInviteSuccess = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staffInvitations() })
    setActiveTab(STAFF_TAB.INVITATIONS)
  }, [queryClient])

  return (
    <PageLayout title={t('page.title')} description={t('page.description')}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList variant="line" className="flex w-full gap-4 sm:w-auto">
            <TabsTrigger variant="line" value={STAFF_TAB.STAFF}>
              {t('tabs.staff')}
            </TabsTrigger>
            <TabsTrigger variant="line" value={STAFF_TAB.INVITATIONS}>
              {t('tabs.invitations')}
            </TabsTrigger>
          </TabsList>

          <StaffUserCreateDialog onInviteSuccess={handleInviteSuccess} />
        </div>

        <TabsContent value={STAFF_TAB.STAFF} className="mt-0">
          <StaffPersonnelTab />
        </TabsContent>

        <TabsContent value={STAFF_TAB.INVITATIONS} className="mt-0">
          <StaffInvitationsTab enabled={activeTab === STAFF_TAB.INVITATIONS} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
