import { expect, test, vi } from 'vitest'
import { STAFF_STATUS, USER_ROLE, type OwnerStaffPersonnelRow } from '@repo/types'

const personnelRow: OwnerStaffPersonnelRow = {
  staffDocumentId: 'staff-one',
  name: 'Staff',
  lastName: 'Member',
  email: 'staff@example.com',
  avatar: null,
  staffStatus: STAFF_STATUS.ACTIVE,
  organizationDocumentId: 'organization-one',
  organizationName: 'Organization One',
  role: USER_ROLE.STAFF,
  lastActiveAt: new Date(1000),
}

const state = vi.hoisted(() => ({
  deleteResult: true,
  personnel: [] as OwnerStaffPersonnelRow[],
  updateResult: true,
}))

vi.mock('@repo/db', () => ({
  deleteStaffByDocumentId: async () => state.deleteResult,
  findPersonnelByOwnerDocumentId: async () => state.personnel,
  updateStaffStatusByDocumentId: async () => state.updateResult,
}))

import { DeleteStaffUseCase } from './delete-staff.use-case.ts'
import { ListPersonnelForOwnerUseCase } from './list-personnel-for-owner.use-case.ts'
import { UpdateStaffStatusUseCase } from './update-staff-status.use-case.ts'

const translationService = {
  translateError: (code: string) => code,
} as never

test('maps organization context in owner personnel responses', async () => {
  state.personnel = [personnelRow]
  const useCase = new ListPersonnelForOwnerUseCase(translationService)

  const response = await useCase.execute('owner-one')

  expect(response).toEqual([
    {
      documentId: 'staff-one',
      name: 'Staff Member',
      email: 'staff@example.com',
      organizationId: 'organization-one',
      organizationName: 'Organization One',
      role: USER_ROLE.STAFF,
      status: STAFF_STATUS.ACTIVE,
      avatar: null,
      lastActiveAt: new Date(1000),
    },
  ])
})

test('returns not found when owner and staff do not share an organization', async () => {
  state.updateResult = false
  state.deleteResult = false
  await expect(
    new UpdateStaffStatusUseCase(translationService).execute(
      'unrelated-owner',
      'staff-one',
      STAFF_STATUS.INACTIVE
    )
  ).rejects.toMatchObject({ name: 'NotFoundException', message: 'staff.NOT_FOUND' })
  await expect(
    new DeleteStaffUseCase(translationService).execute('unrelated-owner', 'staff-one')
  ).rejects.toMatchObject({ name: 'NotFoundException', message: 'staff.NOT_FOUND' })
})

test('accepts repository success for organization-scoped status and membership removal', async () => {
  state.updateResult = true
  state.deleteResult = true
  await new UpdateStaffStatusUseCase(translationService).execute(
    'owner-one',
    'staff-multiple-memberships',
    STAFF_STATUS.INACTIVE
  )
  await new DeleteStaffUseCase(translationService).execute(
    'owner-one',
    'staff-multiple-memberships'
  )
})
