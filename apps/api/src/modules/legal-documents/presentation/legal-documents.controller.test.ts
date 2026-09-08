import 'reflect-metadata'
import { RequestMethod } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { expect, test } from 'vitest'
import { API_ROUTES } from '@repo/common'
import { LEGAL_DOCUMENT_TYPE, USER_ROLE } from '@repo/types'
import { Roles } from '../../common/decorators/roles.decorator.ts'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.ts'
import { RolesGuard } from '../../common/guards/roles.guard.ts'
import { LegalDocumentsController } from './legal-documents.controller.ts'

const PATH_METADATA = 'path'
const METHOD_METADATA = 'method'
const GUARDS_METADATA = '__guards__'
const reflector = new Reflector()

function unusedUseCase() {
  return {
    execute: async () => {
      throw new Error('unexpected use case call')
    },
  }
}

function createController(
  overrides: {
    list?: { execute: () => Promise<unknown> }
    get?: { execute: (type: string) => Promise<unknown> }
    save?: { execute: (type: string, input: { title: string }) => Promise<unknown> }
    publish?: { execute: (type: string) => Promise<unknown> }
    getPublished?: { execute: (type: string) => Promise<unknown> }
  } = {}
) {
  return new LegalDocumentsController(
    (overrides.list ?? unusedUseCase()) as never,
    (overrides.get ?? unusedUseCase()) as never,
    (overrides.save ?? unusedUseCase()) as never,
    (overrides.publish ?? unusedUseCase()) as never,
    (overrides.getPublished ?? unusedUseCase()) as never
  )
}

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

  const controller = createController({
    list: {
      execute: async () => {
        calls.push('list')
        return listResult
      },
    },
    get: {
      execute: async (type: string) => {
        calls.push(`get:${type}`)
        return getResult
      },
    },
    save: {
      execute: async (type: string, input: { title: string }) => {
        calls.push(`save:${type}:${input.title}`)
        return savedDraft
      },
    },
    publish: {
      execute: async (type: string) => {
        calls.push(`publish:${type}`)
        return published
      },
    },
  })

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

test('delegates public published-by-type GET to the published use case', async () => {
  const calls: string[] = []
  const published = {
    documentId: 'published-id',
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    version: 'v1',
    title: 'Terms of use',
    content: { type: 'doc', content: [] },
    publishedAt: new Date('2026-03-01T00:00:00.000Z'),
  }
  const controller = createController({
    getPublished: {
      execute: async (type: string) => {
        calls.push(`published:${type}`)
        return published
      },
    },
  })

  expect(await controller.getPublishedByType(LEGAL_DOCUMENT_TYPE.TERMS_WEB)).toEqual(published)
  expect(calls).toEqual([`published:${LEGAL_DOCUMENT_TYPE.TERMS_WEB}`])
})

test('public GET uses /public/:type and does not collide with admin GET /:type', () => {
  expect(API_ROUTES.legalDocuments.path.getPublishedByType(':type')).toBe('/public/:type')
  expect(API_ROUTES.legalDocuments.path.getByType(':type')).toBe('/:type')
  expect(API_ROUTES.legalDocuments.path.getPublishedByType(':type')).not.toBe(
    API_ROUTES.legalDocuments.path.getByType(':type')
  )

  const publicHandler = LegalDocumentsController.prototype.getPublishedByType
  const adminHandler = LegalDocumentsController.prototype.get

  expect(Reflect.getMetadata(PATH_METADATA, publicHandler)).toBe(
    API_ROUTES.legalDocuments.path.getPublishedByType(':type')
  )
  expect(Reflect.getMetadata(METHOD_METADATA, publicHandler)).toBe(RequestMethod.GET)
  expect(Reflect.getMetadata(PATH_METADATA, adminHandler)).toBe(
    API_ROUTES.legalDocuments.path.getByType(':type')
  )
  expect(Reflect.getMetadata(METHOD_METADATA, adminHandler)).toBe(RequestMethod.GET)
})

test('getPublishedByType has no JwtAuthGuard or Roles', () => {
  const handler = LegalDocumentsController.prototype.getPublishedByType
  expect(typeof handler).toBe('function')

  const classGuards = (Reflect.getMetadata(GUARDS_METADATA, LegalDocumentsController) ??
    []) as unknown[]
  const methodGuards = (Reflect.getMetadata(GUARDS_METADATA, handler) ?? []) as unknown[]

  expect([...classGuards, ...methodGuards]).not.toContain(JwtAuthGuard)
  expect([...classGuards, ...methodGuards]).not.toContain(RolesGuard)
  expect(reflector.get(Roles, handler)).toBeUndefined()
  expect(reflector.get(Roles, LegalDocumentsController.prototype.get)).toEqual([USER_ROLE.ADMIN])
})
