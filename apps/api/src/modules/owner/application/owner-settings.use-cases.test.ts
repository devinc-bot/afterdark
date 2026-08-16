import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
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

const state: {
  currentOwner: typeof ownerRow | null
  ownerId: number | null
  updates: unknown[]
} = {
  currentOwner: ownerRow,
  ownerId: 1,
  updates: [],
}

mock.module('@repo/db', {
  namedExports: {
    findCurrentOwnerByDocumentId: async () => state.currentOwner,
    findOwnerIdByDocumentId: async () => state.ownerId,
    updateOwnerByDocumentId: async (_documentId: string, input: unknown) => {
      state.updates.push(input)
    },
    upsertOwnerAddress: async () => undefined,
  },
})

const getUseCaseModulePromise = import('./get-current-owner.use-case.ts')
const updateUseCaseModulePromise = import('./update-current-owner.use-case.ts')

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
  const { GetCurrentOwnerUseCase } = await getUseCaseModulePromise
  return new GetCurrentOwnerUseCase(translationService)
}

async function createUpdateUseCase() {
  const [{ GetCurrentOwnerUseCase }, { UpdateCurrentOwnerUseCase }] = await Promise.all([
    getUseCaseModulePromise,
    updateUseCaseModulePromise,
  ])
  return new UpdateCurrentOwnerUseCase(
    new GetCurrentOwnerUseCase(translationService),
    translationService
  )
}

test('returns organization-backed owner settings with the existing response fields', async () => {
  resetState()
  const useCase = await createGetUseCase()

  const response = await useCase.execute('owner-one')

  assert.equal(response.organizationName, 'Organization One')
  assert.equal(response.taxId, '20329642330')
})

test('returns not found for a missing owner', async () => {
  resetState()
  state.currentOwner = null
  const useCase = await createGetUseCase()

  await assert.rejects(() => useCase.execute('missing-owner'), {
    name: 'NotFoundException',
    message: 'owner.NOT_FOUND',
  })
})

test('does not update when the repository cannot resolve owner settings', async () => {
  resetState()
  state.currentOwner = null
  const updateUseCase = await createUpdateUseCase()

  await assert.rejects(
    () =>
      updateUseCase.execute('owner-one', {
        name: 'Owner',
        lastName: 'One',
        phone: '11111111',
        birthday: '',
        nationalId: '',
        organizationName: 'Organization One',
        taxId: '20329642330',
        address: { address: '', streetNumber: '', state: '', city: '' },
      }),
    {
      name: 'NotFoundException',
      message: 'owner.NOT_FOUND',
    }
  )
  assert.deepEqual(state.updates, [])
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

  assert.deepEqual(state.updates, [
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
