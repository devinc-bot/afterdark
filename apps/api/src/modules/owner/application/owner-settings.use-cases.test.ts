import { expect, test, vi } from 'vitest'
import { OWNER_STATUS } from '@repo/types'

const ownerRow = {
  documentId: 'owner-one',
  name: 'Owner',
  lastName: 'One',
  avatar: null,
  phone: '11111111',
  birthday: null,
  nationalId: null,
  organizationName: 'Organization One',
  taxId: '20329642330',
  status: OWNER_STATUS.ACTIVE,
  email: 'owner@example.com',
  address: null,
}

const state = vi.hoisted(() => ({
  currentOwner: null as typeof ownerRow | null,
  ownerId: 1 as number | null,
  updates: [] as unknown[],
}))

vi.mock('@repo/db', () => ({
  findCurrentOwnerByDocumentId: async () => state.currentOwner,
  findOwnerIdByDocumentId: async () => state.ownerId,
  updateOwnerByDocumentId: async (_documentId: string, input: unknown) => {
    state.updates.push(input)
  },
  upsertOwnerAddress: async () => undefined,
}))

import { GetCurrentOwnerUseCase } from './get-current-owner.use-case.ts'
import { UpdateCurrentOwnerUseCase } from './update-current-owner.use-case.ts'

const translationService = {
  translateError: (code: string) => code,
  translateNs: (_namespace: string, code: string) => code,
} as never

function resetState() {
  state.currentOwner = ownerRow
  state.ownerId = 1
  state.updates = []
}

async function createGetUseCase() {
  return new GetCurrentOwnerUseCase(translationService)
}

async function createUpdateUseCase() {
  return new UpdateCurrentOwnerUseCase(
    new GetCurrentOwnerUseCase(translationService),
    translationService
  )
}

test('returns organization-backed owner settings with the existing response fields', async () => {
  resetState()
  const useCase = await createGetUseCase()

  const response = await useCase.execute('owner-one')

  expect(response.organizationName).toBe('Organization One')
  expect(response.taxId).toBe('20329642330')
})

test('returns not found for a missing owner', async () => {
  resetState()
  state.currentOwner = null
  const useCase = await createGetUseCase()

  await expect(useCase.execute('missing-owner')).rejects.toMatchObject({
    name: 'NotFoundException',
    message: 'owner.NOT_FOUND',
  })
})

test('does not update when the repository cannot resolve owner settings', async () => {
  resetState()
  state.currentOwner = null
  const updateUseCase = await createUpdateUseCase()

  await expect(
    updateUseCase.execute('owner-one', {
      name: 'Owner',
      lastName: 'One',
      phone: '11111111',
      birthday: '',
      nationalId: '',
      organizationName: 'Organization One',
      taxId: '20329642330',
      address: { address: '', streetNumber: '', state: '', city: '' },
    })
  ).rejects.toMatchObject({
    name: 'NotFoundException',
    message: 'owner.NOT_FOUND',
  })
  expect(state.updates).toEqual([])
})

test('preserves organization fields when updating owner settings', async () => {
  resetState()
  const useCase = await createUpdateUseCase()

  await useCase.execute('owner-one', {
    name: 'Updated',
    lastName: 'Owner',
    phone: '22222222',
    birthday: '',
    nationalId: '',
    organizationName: 'Updated Organization',
    taxId: '20329642330',
    address: { address: '', streetNumber: '', state: '', city: '' },
  })

  expect(state.updates).toEqual([
    {
      name: 'Updated',
      lastName: 'Owner',
      phone: '22222222',
      birthday: null,
      nationalId: null,
      organizationName: 'Updated Organization',
      taxId: '20329642330',
    },
  ])
})
