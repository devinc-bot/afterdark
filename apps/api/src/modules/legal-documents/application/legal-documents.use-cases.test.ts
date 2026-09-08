import { beforeEach, expect, test, vi } from 'vitest'
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { LEGAL_DOCUMENT_TYPE } from '@repo/types'

type LegalDocumentRow = {
  id: number
  documentId: string
  type: string
  version: string
  title: string
  content: Record<string, unknown>
  isPublished: boolean
  requiresAcceptance: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type UpsertDraftInput = {
  type: string
  title: string
  content: Record<string, unknown>
  requiresAcceptance?: boolean
  version: string
}

const TIPTAP_DOC = { type: 'doc', content: [{ type: 'paragraph' }] }
const TIPTAP_UPDATED = { type: 'doc', content: [{ type: 'heading' }] }

const state = vi.hoisted(() => ({
  nextId: 1,
  drafts: new Map<string, LegalDocumentRow>(),
  published: new Map<string, LegalDocumentRow[]>(),
  upsertCalls: [] as UpsertDraftInput[],
  failList: false,
  failSave: false,
  failPublish: false,
}))

vi.mock('@repo/db', () => ({
  findLegalDocumentDraftByType: async (type: string) => {
    if (state.failList) throw new Error('db down')
    return state.drafts.get(type) ?? null
  },
  findLatestPublishedLegalDocumentByType: async (type: string) => {
    if (state.failList) throw new Error('db down')
    const history = state.published.get(type)
    return history?.at(-1) ?? null
  },
  upsertLegalDocumentDraft: async (input: UpsertDraftInput) => {
    if (state.failSave) throw new Error('db down')
    state.upsertCalls.push({
      type: input.type,
      title: input.title,
      content: input.content,
      requiresAcceptance: input.requiresAcceptance,
      version: input.version,
    })
    const existing = state.drafts.get(input.type)
    const now = new Date('2026-04-01T00:00:00.000Z')
    const row: LegalDocumentRow = existing
      ? {
          ...existing,
          title: input.title,
          content: input.content,
          version: input.version,
          requiresAcceptance: input.requiresAcceptance ?? existing.requiresAcceptance,
          isPublished: false,
          publishedAt: null,
          updatedAt: now,
        }
      : {
          id: state.nextId++,
          documentId: `draft-${state.nextId - 1}`,
          type: input.type,
          version: input.version,
          title: input.title,
          content: input.content,
          isPublished: false,
          requiresAcceptance: input.requiresAcceptance ?? true,
          publishedAt: null,
          createdAt: now,
          updatedAt: now,
        }
    state.drafts.set(input.type, row)
    return row
  },
  publishLegalDocumentDraftByType: async (type: string) => {
    if (state.failPublish) throw new Error('db down')
    const draft = state.drafts.get(type)
    if (!draft) return null
    state.drafts.delete(type)
    const published: LegalDocumentRow = {
      ...draft,
      isPublished: true,
      publishedAt: new Date('2026-06-01T00:00:00.000Z'),
      updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    }
    const history = state.published.get(type) ?? []
    history.push(published)
    state.published.set(type, history)
    return published
  },
}))

const translationService = { translateError: (code: string) => code } as never
import { GetLegalDocumentByTypeUseCase } from './get-legal-document-by-type.use-case.ts'
import { GetPublishedLegalDocumentByTypeUseCase } from './get-published-legal-document-by-type.use-case.ts'
import { ListLegalDocumentsUseCase } from './list-legal-documents.use-case.ts'
import { PublishLegalDocumentUseCase } from './publish-legal-document.use-case.ts'
import { SaveLegalDocumentDraftUseCase } from './save-legal-document-draft.use-case.ts'

function resetRepo() {
  state.nextId = 1
  state.drafts.clear()
  state.published.clear()
  state.upsertCalls.length = 0
  state.failList = false
  state.failSave = false
  state.failPublish = false
}

function toResponse(row: LegalDocumentRow) {
  const { id: _id, ...response } = row
  return response
}

function seedDraft(
  overrides: Partial<LegalDocumentRow> & Pick<LegalDocumentRow, 'type'>
): LegalDocumentRow {
  const row: LegalDocumentRow = {
    id: state.nextId++,
    documentId: overrides.documentId ?? `draft-${state.nextId - 1}`,
    type: overrides.type,
    version: overrides.version ?? 'v1',
    title: overrides.title ?? 'Draft title',
    content: overrides.content ?? TIPTAP_DOC,
    isPublished: false,
    requiresAcceptance: overrides.requiresAcceptance ?? true,
    publishedAt: null,
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-02T00:00:00.000Z'),
  }
  state.drafts.set(row.type, row)
  return row
}

function seedPublished(
  overrides: Partial<LegalDocumentRow> & Pick<LegalDocumentRow, 'type'>
): LegalDocumentRow {
  const row: LegalDocumentRow = {
    id: state.nextId++,
    documentId: overrides.documentId ?? `published-${state.nextId - 1}`,
    type: overrides.type,
    version: overrides.version ?? 'v1',
    title: overrides.title ?? 'Published title',
    content: overrides.content ?? TIPTAP_DOC,
    isPublished: true,
    requiresAcceptance: overrides.requiresAcceptance ?? true,
    publishedAt: overrides.publishedAt ?? new Date('2026-03-01T00:00:00.000Z'),
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-03-01T00:00:00.000Z'),
  }
  const history = state.published.get(row.type) ?? []
  history.push(row)
  state.published.set(row.type, history)
  return row
}

beforeEach(() => {
  resetRepo()
})

test('lists four legal document types with null draft and published when empty', async () => {
  const result = await new ListLegalDocumentsUseCase(translationService).execute()

  expect(result).toEqual(
    Object.values(LEGAL_DOCUMENT_TYPE).map((type) => ({
      type,
      draft: null,
      published: null,
    }))
  )
})

test('lists persisted draft and published rows without dropping empty types', async () => {
  const draft = seedDraft({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    documentId: 'draft-web',
    title: 'Web terms draft',
  })
  const published = seedPublished({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    documentId: 'published-web',
    title: 'Web terms published',
  })

  const result = await new ListLegalDocumentsUseCase(translationService).execute()
  const termsWeb = result.find((entry) => entry.type === LEGAL_DOCUMENT_TYPE.TERMS_WEB)

  expect(result).toHaveLength(4)
  expect(result.map((entry) => entry.type)).toEqual(Object.values(LEGAL_DOCUMENT_TYPE))
  expect(termsWeb).toEqual({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    draft: toResponse(draft),
    published: toResponse(published),
  })
  expect(result.filter((entry) => entry.type !== LEGAL_DOCUMENT_TYPE.TERMS_WEB)).toEqual(
    Object.values(LEGAL_DOCUMENT_TYPE)
      .filter((type) => type !== LEGAL_DOCUMENT_TYPE.TERMS_WEB)
      .map((type) => ({ type, draft: null, published: null }))
  )
})

test('gets null draft and published when a type has no rows', async () => {
  await expect(
    new GetLegalDocumentByTypeUseCase(translationService).execute(LEGAL_DOCUMENT_TYPE.TERMS_WEB)
  ).resolves.toEqual({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    draft: null,
    published: null,
  })
})

test('gets draft and published for a single type', async () => {
  const draft = seedDraft({
    type: LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
    documentId: 'draft-privacy',
  })
  const published = seedPublished({
    type: LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
    documentId: 'published-privacy',
  })

  const result = await new GetLegalDocumentByTypeUseCase(translationService).execute(
    LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD
  )

  expect(result).toEqual({
    type: LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
    draft: toResponse(draft),
    published: toResponse(published),
  })
})

test('save creates a v1 draft when none is published', async () => {
  const result = await new SaveLegalDocumentDraftUseCase(translationService).execute(
    LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    { title: 'Terms of use', content: TIPTAP_DOC }
  )

  expect(state.upsertCalls).toHaveLength(1)
  expect(state.upsertCalls[0]).toMatchObject({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    title: 'Terms of use',
    content: TIPTAP_DOC,
    version: 'v1',
  })
  expect(result).toMatchObject({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    version: 'v1',
    title: 'Terms of use',
    content: TIPTAP_DOC,
    isPublished: false,
    requiresAcceptance: true,
    publishedAt: null,
  })
  expect(result.documentId).toEqual(expect.any(String))
  expect(state.published.size).toBe(0)
})

test('save after published v1 creates a v2 draft without changing v1', async () => {
  const publishedV1 = seedPublished({
    type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
    documentId: 'terms-v1',
    version: 'v1',
    title: 'Published v1',
    content: TIPTAP_DOC,
  })
  const publishedSnapshot = structuredClone(publishedV1)

  const result = await new SaveLegalDocumentDraftUseCase(translationService).execute(
    LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
    { title: 'Draft v2', content: TIPTAP_UPDATED, requiresAcceptance: false }
  )

  expect(state.upsertCalls[0]).toMatchObject({
    type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
    title: 'Draft v2',
    content: TIPTAP_UPDATED,
    requiresAcceptance: false,
    version: 'v2',
  })
  expect(result.documentId).not.toBe(publishedV1.documentId)
  expect(result).toMatchObject({
    type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
    version: 'v2',
    title: 'Draft v2',
    isPublished: false,
    publishedAt: null,
  })
  expect(state.published.get(LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD)).toEqual([publishedSnapshot])
  expect(state.drafts.get(LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD)?.documentId).not.toBe(
    publishedV1.documentId
  )
})

test('save twice upserts the same unpublished draft', async () => {
  const useCase = new SaveLegalDocumentDraftUseCase(translationService)

  const first = await useCase.execute(LEGAL_DOCUMENT_TYPE.PRIVACY_WEB, {
    title: 'Privacy draft',
    content: TIPTAP_DOC,
  })
  const second = await useCase.execute(LEGAL_DOCUMENT_TYPE.PRIVACY_WEB, {
    title: 'Privacy draft updated',
    content: TIPTAP_UPDATED,
    requiresAcceptance: false,
  })

  expect(state.upsertCalls).toHaveLength(2)
  expect(state.upsertCalls.map((call) => call.version)).toEqual(['v1', 'v1'])
  expect(state.drafts.size).toBe(1)
  expect(second.documentId).toBe(first.documentId)
  expect(second).toMatchObject({
    documentId: first.documentId,
    title: 'Privacy draft updated',
    content: TIPTAP_UPDATED,
    version: 'v1',
    isPublished: false,
    requiresAcceptance: false,
    publishedAt: null,
  })
})

test('publish without a draft throws BadRequest legalDocument.NO_DRAFT', async () => {
  await expect(
    new PublishLegalDocumentUseCase(translationService).execute(LEGAL_DOCUMENT_TYPE.TERMS_WEB)
  ).rejects.toBeInstanceOf(BadRequestException)
  await expect(
    new PublishLegalDocumentUseCase(translationService).execute(LEGAL_DOCUMENT_TYPE.TERMS_WEB)
  ).rejects.toMatchObject({ name: 'BadRequestException', message: 'legalDocument.NO_DRAFT' })
})

test('subsequent publish freezes v2 and leaves published v1 unchanged', async () => {
  const publishedV1 = seedPublished({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    documentId: 'terms-v1',
    version: 'v1',
    title: 'Published v1',
  })
  const publishedSnapshot = structuredClone(publishedV1)
  seedDraft({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    documentId: 'terms-v2-draft',
    version: 'v2',
    title: 'Draft v2',
  })

  const result = await new PublishLegalDocumentUseCase(translationService).execute(
    LEGAL_DOCUMENT_TYPE.TERMS_WEB
  )

  expect(result).toMatchObject({
    documentId: 'terms-v2-draft',
    version: 'v2',
    title: 'Draft v2',
    isPublished: true,
  })
  expect(state.published.get(LEGAL_DOCUMENT_TYPE.TERMS_WEB)?.[0]).toEqual(publishedSnapshot)
  expect(state.published.get(LEGAL_DOCUMENT_TYPE.TERMS_WEB)?.at(-1)?.documentId).toBe(
    'terms-v2-draft'
  )
})

test('publish marks the current draft as published', async () => {
  const draft = seedDraft({
    type: LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
    documentId: 'privacy-draft',
    version: 'v1',
    title: 'Privacy draft',
    content: TIPTAP_DOC,
  })

  const result = await new PublishLegalDocumentUseCase(translationService).execute(
    LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD
  )

  expect(result).toMatchObject({
    documentId: draft.documentId,
    type: LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
    version: 'v1',
    title: 'Privacy draft',
    content: TIPTAP_DOC,
    isPublished: true,
  })
  expect(result.publishedAt).toBeInstanceOf(Date)
  expect(state.drafts.has(LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD)).toBe(false)
  expect(state.published.get(LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD)?.at(-1)?.isPublished).toBe(true)
})

test('returns the latest published document without draft or unpublished fields', async () => {
  seedDraft({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    documentId: 'draft-secret',
    title: 'Unpublished draft',
    content: TIPTAP_DOC,
  })
  seedPublished({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    documentId: 'terms-v1',
    version: 'v1',
    title: 'Published v1',
  })
  const latest = seedPublished({
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    documentId: 'terms-v2',
    version: 'v2',
    title: 'Published v2',
    content: TIPTAP_UPDATED,
    publishedAt: new Date('2026-06-01T00:00:00.000Z'),
  })

  const result = await new GetPublishedLegalDocumentByTypeUseCase(translationService).execute(
    LEGAL_DOCUMENT_TYPE.TERMS_WEB
  )

  expect(result).toEqual({
    documentId: latest.documentId,
    type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
    version: 'v2',
    title: 'Published v2',
    content: TIPTAP_UPDATED,
    publishedAt: latest.publishedAt,
  })
  expect([...Object.keys(result)].sort()).toEqual(
    ['content', 'documentId', 'publishedAt', 'title', 'type', 'version'].sort()
  )
  expect(result).not.toHaveProperty('draft')
  expect(result).not.toHaveProperty('isPublished')
  expect(result).not.toHaveProperty('requiresAcceptance')
  expect(result).not.toHaveProperty('createdAt')
  expect(result).not.toHaveProperty('updatedAt')
})

test('throws not found when no published document exists for the type', async () => {
  seedDraft({
    type: LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
    documentId: 'privacy-draft-only',
    title: 'Draft only',
  })

  await expect(
    new GetPublishedLegalDocumentByTypeUseCase(translationService).execute(
      LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD
    )
  ).rejects.toBeInstanceOf(NotFoundException)
  await expect(
    new GetPublishedLegalDocumentByTypeUseCase(translationService).execute(
      LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD
    )
  ).rejects.toMatchObject({
    name: 'NotFoundException',
    message: 'legalDocument.PUBLISHED_NOT_FOUND',
  })
  await expect(
    new GetPublishedLegalDocumentByTypeUseCase(translationService).execute(
      LEGAL_DOCUMENT_TYPE.TERMS_WEB
    )
  ).rejects.toMatchObject({
    name: 'NotFoundException',
    message: 'legalDocument.PUBLISHED_NOT_FOUND',
  })
})

test('does not convert published-not-found into LIST_FAILED', async () => {
  await expect(
    new GetPublishedLegalDocumentByTypeUseCase(translationService).execute(
      LEGAL_DOCUMENT_TYPE.PRIVACY_WEB
    )
  ).rejects.not.toMatchObject({
    name: 'InternalServerErrorException',
    message: 'legalDocument.LIST_FAILED',
  })
  await expect(
    new GetPublishedLegalDocumentByTypeUseCase(translationService).execute(
      LEGAL_DOCUMENT_TYPE.PRIVACY_WEB
    )
  ).rejects.toBeInstanceOf(NotFoundException)
})

test('throws internal errors when legal document persistence fails', async () => {
  state.failList = true
  await expect(new ListLegalDocumentsUseCase(translationService).execute()).rejects.toMatchObject({
    name: 'InternalServerErrorException',
    message: 'legalDocument.LIST_FAILED',
  })
  await expect(new ListLegalDocumentsUseCase(translationService).execute()).rejects.toBeInstanceOf(
    InternalServerErrorException
  )

  resetRepo()
  state.failSave = true
  await expect(
    new SaveLegalDocumentDraftUseCase(translationService).execute(LEGAL_DOCUMENT_TYPE.TERMS_WEB, {
      title: 'Terms',
      content: TIPTAP_DOC,
    })
  ).rejects.toMatchObject({
    name: 'InternalServerErrorException',
    message: 'legalDocument.SAVE_FAILED',
  })

  resetRepo()
  seedDraft({ type: LEGAL_DOCUMENT_TYPE.TERMS_WEB })
  state.failPublish = true
  await expect(
    new PublishLegalDocumentUseCase(translationService).execute(LEGAL_DOCUMENT_TYPE.TERMS_WEB)
  ).rejects.toMatchObject({
    name: 'InternalServerErrorException',
    message: 'legalDocument.PUBLISH_FAILED',
  })

  resetRepo()
  state.failList = true
  await expect(
    new GetPublishedLegalDocumentByTypeUseCase(translationService).execute(
      LEGAL_DOCUMENT_TYPE.TERMS_WEB
    )
  ).rejects.toMatchObject({
    name: 'InternalServerErrorException',
    message: 'legalDocument.LIST_FAILED',
  })
  await expect(
    new GetPublishedLegalDocumentByTypeUseCase(translationService).execute(
      LEGAL_DOCUMENT_TYPE.TERMS_WEB
    )
  ).rejects.toBeInstanceOf(InternalServerErrorException)
})
