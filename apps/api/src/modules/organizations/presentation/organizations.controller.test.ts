import { expect, test } from 'vitest'
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

  expect(await controller.getPublicBySlug('organization-id', { page: 1, limit: 5 })).toBe(result)
  expect(calls).toEqual(['organization-id'])
})
