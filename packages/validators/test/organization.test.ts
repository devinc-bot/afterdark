import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createStaffInvitationSchema,
  ownerSettingsFormSchema,
  organizationSettingsSchema,
  updateCurrentOwnerSchema,
} from '../src/index.ts'

test('organization settings require a name when tax ID is present', () => {
  const result = organizationSettingsSchema.safeParse({
    organizationName: '',
    taxId: '20329642330',
  })

  assert.equal(result.success, false)
  assert.equal(result.error?.issues[0]?.path[0], 'organizationName')
})

test('owner settings compose organization validation', () => {
  const result = updateCurrentOwnerSchema.safeParse({
    name: 'Ana',
    lastName: 'Perez',
    phone: '1123456789',
    birthday: '',
    nationalId: '',
    organizationName: '  Afterdark  ',
    taxId: '20329642330',
    address: { address: '', streetNumber: '', state: '', city: '' },
  })

  assert.equal(result.success, true)
  assert.equal(result.data?.organizationName, 'Afterdark')
})

test('owner settings always require an organization name', () => {
  const result = ownerSettingsFormSchema.safeParse({
    profile: {
      name: 'Ana',
      lastName: 'Perez',
      phone: '1123456789',
      birthday: '',
      nationalId: '',
      organizationName: '',
      taxId: '',
      address: { address: '', streetNumber: '', state: '', city: '' },
    },
  })

  assert.equal(result.success, false)
  assert.deepEqual(result.error?.issues[0]?.path, ['profile', 'organizationName'])
})

test('staff invitation no longer accepts location context', () => {
  const result = createStaffInvitationSchema.parse({
    email: 'staff@example.com',
    locationId: 'legacy-location',
    securityWord: '',
    expiresInMs: 43200000,
  })

  assert.equal('locationId' in result, false)
})
