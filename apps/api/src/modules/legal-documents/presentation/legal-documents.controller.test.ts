import { expect, test } from 'vitest'
import { LEGAL_DOCUMENT_TYPE } from '@repo/types'
import { LegalDocumentsController } from './legal-documents.controller.ts'

test('delegates legal document list, get, save, and publish to admin use cases', async () => {
  const calls: string[] = []
  const listResult = Object.values(LEGAL_DOCUMENT_TYPE).map((type) => ({
    type,
    draft: null,
    published: null,
  }))
  const getResult = {
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    draft: { documentId: 'draft-id' },
    published: null,
  }
  const savedDraft = { documentId: 'draft-id', version: 'v1', isPublished: false }
  const published = { documentId: 'draft-id', version: 'v1', isPublished: true }
  const body = { title: 'Terms of use', content: { type: 'doc', content: [] } }

  const listUseCase = {
    execute: async () => {
      calls.push('list')
      return listResult
    },
  }
  const getUseCase = {
    execute: async (type: string) => {
      calls.push(`get:${type}`)
      return getResult
    },
  }
  const saveUseCase = {
    execute: async (type: string, input: { title: string }) => {
      calls.push(`save:${type}:${input.title}`)
      return savedDraft
    },
  }
  const publishUseCase = {
    execute: async (type: string) => {
      calls.push(`publish:${type}`)
      return published
    },
  }
  const controller = new LegalDocumentsController(
    listUseCase as never,
    getUseCase as never,
    saveUseCase as never,
    publishUseCase as never
  )

  expect(await controller.list()).toEqual(listResult)
  expect(await controller.get(LEGAL_DOCUMENT_TYPE.TERMS_WEB)).toEqual(getResult)
  expect(await controller.saveDraft(LEGAL_DOCUMENT_TYPE.TERMS_WEB, body)).toEqual(savedDraft)
  expect(await controller.publish(LEGAL_DOCUMENT_TYPE.TERMS_WEB)).toEqual(published)
  expect(calls).toEqual([
    'list',
    `get:${LEGAL_DOCUMENT_TYPE.TERMS_WEB}`,
    `save:${LEGAL_DOCUMENT_TYPE.TERMS_WEB}:Terms of use`,
    `publish:${LEGAL_DOCUMENT_TYPE.TERMS_WEB}`,
  ])
})
