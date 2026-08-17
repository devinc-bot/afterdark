import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
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

const state: {
  deleteResult: boolean
  personnel: OwnerStaffPersonnelRow[]
  updateResult: boolean
} = {
  deleteResult: true,
  personnel: [personnelRow],
  updateResult: true,
}

mock.module('@repo/db', {
  namedExports: {
    deleteStaffByDocumentId: async () => state.deleteResult,
    findPersonnelByOwnerDocumentId: async () => state.personnel,
    updateStaffStatusByDocumentId: async () => state.updateResult,
  },
})

const listUseCaseModulePromise = import('./list-personnel-for-owner.use-case.ts')
const updateUseCaseModulePromise = import('./update-staff-status.use-case.ts')
const deleteUseCaseModulePromise = import('./delete-staff.use-case.ts')

const translationService = {
  translateError: (code: string) => code,
} as never

test('maps organization context in owner personnel responses', async () => {
  state.personnel = [personnelRow]
  const { ListPersonnelForOwnerUseCase } = await listUseCaseModulePromise
  const useCase = new ListPersonnelForOwnerUseCase(translationService)

  const response = await useCase.execute('owner-one')

  assert.deepEqual(response, [
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
  const [{ UpdateStaffStatusUseCase }, { DeleteStaffUseCase }] = await Promise.all([
    updateUseCaseModulePromise,
    deleteUseCaseModulePromise,
  ])

  await assert.rejects(
    () =>
      new UpdateStaffStatusUseCase(translationService).execute(
        'unrelated-owner',
        'staff-one',
        STAFF_STATUS.INACTIVE
      ),
    { name: 'NotFoundException', message: 'staff.NOT_FOUND' }
  )
  await assert.rejects(
    () => new DeleteStaffUseCase(translationService).execute('unrelated-owner', 'staff-one'),
    { name: 'NotFoundException', message: 'staff.NOT_FOUND' }
  )
})

test('accepts repository success for organization-scoped status and membership removal', async () => {
  state.updateResult = true
  state.deleteResult = true
  const [{ UpdateStaffStatusUseCase }, { DeleteStaffUseCase }] = await Promise.all([
    updateUseCaseModulePromise,
    deleteUseCaseModulePromise,
  ])

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
