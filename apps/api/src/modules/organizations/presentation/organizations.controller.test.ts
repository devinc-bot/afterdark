import assert from 'node:assert/strict'
import test from 'node:test'
import { OrganizationsController } from './organizations.controller.ts'

test('delegates public organization retrieval to the use case', async () => {
  const result = { documentId: 'organization-id', name: 'Nocturna', avatar: null, events: [] }
  const calls: string[] = []
  const useCase = {
    execute: async (documentId: string) => {
      calls.push(documentId)
      return result
    },
  }
  const controller = new OrganizationsController(useCase as never)

  assert.equal(
    await controller.getPublicByDocumentId('organization-id', { page: 1, limit: 5 }),
    result
  )
  assert.deepEqual(calls, ['organization-id'])
})
