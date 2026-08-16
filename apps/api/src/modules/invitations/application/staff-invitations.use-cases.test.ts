import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { STAFF_INVITATION_STATUS, USER_ROLE } from '@repo/types'

const invitation = {
  id: 1,
  documentId: 'invitation-one',
  createdAt: new Date(1000),
  updatedAt: new Date(1000),
  email: 'staff@example.com',
  organizationId: 10,
  invitedByOwnerId: 1,
  slug: 'staff',
  token: 'signed-token',
  securityWordHash: null,
  expiresAt: new Date(Date.now() + 60_000),
  status: STAFF_INVITATION_STATUS.PENDING,
  role: USER_ROLE.STAFF,
  acceptedAt: null,
}

const organization = {
  id: 10,
  documentId: 'organization-one',
  name: 'Organization One',
  taxId: null,
}

const state: {
  insertedInput: unknown
  payload: unknown
  registrationInput: unknown
} = {
  insertedInput: null,
  payload: null,
  registrationInput: null,
}

mock.module('@repo/db', {
  namedExports: {
    accountExistsByEmail: async () => false,
    createStaffInvitation: async (input: unknown) => {
      state.insertedInput = input
      return invitation
    },
    deleteStaffInvitationById: async () => undefined,
    findRoleByName: async () => ({ id: 4 }),
    findSoleOrganizationByOwnerDocumentId: async () => organization,
    findStaffInvitationByTokenWithOrganization: async () => ({
      invitation,
      organizationDocumentId: organization.documentId,
      organizationName: organization.name,
    }),
    registerStaffForOrganization: async (input: unknown) => {
      state.registrationInput = input
    },
  },
})

const createUseCaseModulePromise = import('./create-staff-invitation.use-case.ts')
const getUseCaseModulePromise = import('./get-staff-invitation-by-link.use-case.ts')
const acceptUseCaseModulePromise = import('./accept-staff-invitation.use-case.ts')

const translationService = {
  translateError: (code: string) => code,
} as never

const jwtService = {
  signAsync: async (payload: unknown) => {
    state.payload = payload
    return invitation.token
  },
  verifyAsync: async () => state.payload,
} as never

test('creates an invitation for the owner organization without location input', async () => {
  state.insertedInput = null
  state.payload = null
  const { CreateStaffInvitationUseCase } = await createUseCaseModulePromise
  const useCase = new CreateStaffInvitationUseCase(jwtService, translationService, {
    requireOwnerInviter: async () => ({ id: 1, documentId: 'owner-one', role: USER_ROLE.OWNER }),
  } as never)

  const response = await useCase.execute('owner-one', {
    email: invitation.email,
    securityWord: '',
    expiresInMs: 43_200_000,
  })

  assert.equal(response.organizationId, organization.documentId)
  assert.equal(response.organizationName, organization.name)
  assert.equal((state.insertedInput as { organizationId: number }).organizationId, organization.id)
  assert.equal(
    (state.payload as { organizationId: string }).organizationId,
    organization.documentId
  )
  assert.equal('locationId' in (state.insertedInput as object), false)
})

test('returns public invitation organization context', async () => {
  const { GetStaffInvitationByLinkUseCase } = await getUseCaseModulePromise
  const useCase = new GetStaffInvitationByLinkUseCase(jwtService, translationService)

  const response = await useCase.execute(invitation.slug, invitation.token)

  assert.equal(response.organizationId, organization.documentId)
  assert.equal(response.organizationName, organization.name)
})

test('accepts an invitation into its persisted organization', async () => {
  state.registrationInput = null
  const { AcceptStaffInvitationUseCase } = await acceptUseCaseModulePromise
  const useCase = new AcceptStaffInvitationUseCase(jwtService, translationService)

  await useCase.execute(invitation.slug, invitation.token, {
    name: 'Staff',
    lastName: 'Member',
    phone: '11111111',
    securityWord: '',
    password: 'password123',
  })

  assert.equal(
    (state.registrationInput as { organizationId: number }).organizationId,
    organization.id
  )
})
