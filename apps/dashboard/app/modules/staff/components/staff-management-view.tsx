import { useCallback, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@afterdark/ui'
import { StaffInvitations } from '~/modules/staff/components/staff-invitations'
import { StaffPersonnelTab } from '~/modules/staff/components/staff-personnel-tab'
import { StaffUserCreateDialog } from '~/modules/staff/components/staff-user-create-dialog'
import type { StaffInvitationResult } from '~/modules/staff/components/staff-user-form'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
import { STAFF_TAB } from '~/modules/staff/constants/staff-tabs.constants'
import {
  createStaffInvitationRecord,
  type StaffInvitationRecord,
} from '~/modules/staff/types/staff-invitation-record'

export function StaffManagementView() {
  const [activeTab, setActiveTab] = useState<string>(STAFF_TAB.STAFF)
  const [invitations, setInvitations] = useState<StaffInvitationRecord[]>([])

  const handleInvite = useCallback((result: StaffInvitationResult) => {
    setInvitations((current) => [createStaffInvitationRecord(result), ...current])
    setActiveTab(STAFF_TAB.INVITATIONS)
  }, [])

  return (
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:gap-8">
        <header className="max-w-2xl">
          <h1 className="text-balance font-heading text-2xl font-bold text-ink sm:text-3xl">
            {STAFF_COPY.page.title}
          </h1>
          <p className="mt-2 text-pretty text-base text-ink-muted">{STAFF_COPY.page.description}</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList variant="line" className="flex w-full gap-4 sm:w-auto">
              <TabsTrigger variant="line" value={STAFF_TAB.STAFF}>
                {STAFF_COPY.tabs.staff}
              </TabsTrigger>
              <TabsTrigger variant="line" value={STAFF_TAB.INVITATIONS}>
                {STAFF_COPY.tabs.invitations}
              </TabsTrigger>
            </TabsList>

            <StaffUserCreateDialog onInvite={handleInvite} />
          </div>

          <TabsContent value={STAFF_TAB.STAFF} className="mt-0">
            <StaffPersonnelTab />
          </TabsContent>

          <TabsContent value={STAFF_TAB.INVITATIONS} className="mt-0">
            <StaffInvitations invitations={invitations} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
