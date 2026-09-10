// @vitest-environment jsdom
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import {
  LEGAL_DOCUMENT_TYPE,
  type LegalDocumentByTypeResponse,
  type LegalDocumentResponse,
  type LegalDocumentType,
} from '@repo/types'

const serviceMocks = vi.hoisted(() => ({
  listLegalDocuments: vi.fn(),
  saveDraft: vi.fn(),
  publish: vi.fn(),
}))

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'es' },
    t: (key: string) =>
      ({
        'legalDocuments.title': 'Documentos legales',
        'legalDocuments.description':
          'Prepará el contenido legal para organizaciones y clientes web.',
        'legalDocuments.loading': 'Cargando documentos legales',
        'legalDocuments.loadError': 'No se pudieron cargar los documentos legales',
        'legalDocuments.retry': 'Reintentar',
        'legalDocuments.save': 'Guardar',
        'legalDocuments.saving': 'Guardando',
        'legalDocuments.publish': 'Publicar',
        'legalDocuments.publishing': 'Publicando',
        'legalDocuments.saveError': 'No se pudo guardar el borrador',
        'legalDocuments.publishError': 'No se pudo publicar el documento',
        'legalDocuments.toast.saveSuccess.termsDashboard':
          'Se guardaron los términos y condiciones de organizaciones.',
        'legalDocuments.toast.saveSuccess.termsWeb':
          'Se guardaron los términos y condiciones de web.',
        'legalDocuments.toast.saveSuccess.privacyDashboard':
          'Se guardó la política de privacidad de organizaciones.',
        'legalDocuments.toast.saveSuccess.privacyWeb':
          'Se guardó la política de privacidad de web.',
        'legalDocuments.toast.publishSuccess.termsDashboard':
          'Se publicaron los términos y condiciones de organizaciones.',
        'legalDocuments.toast.publishSuccess.termsWeb':
          'Se publicaron los términos y condiciones de web.',
        'legalDocuments.toast.publishSuccess.privacyDashboard':
          'Se publicó la política de privacidad de organizaciones.',
        'legalDocuments.toast.publishSuccess.privacyWeb':
          'Se publicó la política de privacidad de web.',
        'legalDocuments.toast.saveError.termsDashboard':
          'No se pudieron guardar los términos y condiciones de organizaciones.',
        'legalDocuments.toast.saveError.termsWeb':
          'No se pudieron guardar los términos y condiciones de web.',
        'legalDocuments.toast.saveError.privacyDashboard':
          'No se pudo guardar la política de privacidad de organizaciones.',
        'legalDocuments.toast.saveError.privacyWeb':
          'No se pudo guardar la política de privacidad de web.',
        'legalDocuments.toast.publishError.termsDashboard':
          'No se pudieron publicar los términos y condiciones de organizaciones.',
        'legalDocuments.toast.publishError.termsWeb':
          'No se pudieron publicar los términos y condiciones de web.',
        'legalDocuments.toast.publishError.privacyDashboard':
          'No se pudo publicar la política de privacidad de organizaciones.',
        'legalDocuments.toast.publishError.privacyWeb':
          'No se pudo publicar la política de privacidad de web.',
        'legalDocuments.tabs.terms': 'Términos y condiciones',
        'legalDocuments.tabs.privacy': 'Política de privacidad',
        'legalDocuments.organizations.title': 'Organizaciones',
        'legalDocuments.organizations.description':
          'Contenido dirigido a dueños y equipos que administran organizaciones.',
        'legalDocuments.organizations.termsEditorLabel':
          'Editor de términos y condiciones para organizaciones',
        'legalDocuments.organizations.privacyEditorLabel':
          'Editor de política de privacidad para organizaciones',
        'legalDocuments.web.title': 'Web',
        'legalDocuments.web.description':
          'Contenido dirigido a clientes que usan la experiencia pública de Repo.',
        'legalDocuments.web.termsEditorLabel': 'Editor de términos y condiciones para web',
        'legalDocuments.web.privacyEditorLabel': 'Editor de política de privacidad para web',
      })[key] ?? key,
  }),
}))

vi.mock('../app/modules/legal-documents/services/legal-documents.service', () => serviceMocks)
vi.mock('~/modules/legal-documents/services/legal-documents.service', () => serviceMocks)
vi.mock('~/modules/common/constants/query-keys', () => ({
  QUERY_KEYS: { legalDocuments: () => ['legal-documents'] },
}))
vi.mock('~/modules/legal-documents/constants/legal-document-tabs', () => ({
  LEGAL_DOCUMENT_TAB: {
    TERMS: 'terms',
    PRIVACY: 'privacy',
  },
}))

vi.mock('@repo/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/ui')>()

  return {
    ...actual,
    toast: toastMocks,
    RichEditor: ({
      value,
      defaultValue,
      onChange,
      editorAriaLabel,
      disabled,
    }: {
      value?: string
      defaultValue?: string
      onChange?: (next: string) => void
      editorAriaLabel?: string
      disabled?: boolean
    }) =>
      createElement('textarea', {
        value: value ?? defaultValue ?? '',
        'aria-label': editorAriaLabel,
        disabled,
        onChange: (event: { target: { value: string } }) => onChange?.(event.target.value),
      }),
  }
})

import { LegalDocumentsView } from '../app/modules/legal-documents/components/legal-documents-view'

const DRAFT_ORG_TERMS = 'Borrador organizaciones términos'
const PUBLISHED_ORG_TERMS = 'Publicado organizaciones términos'
const PUBLISHED_WEB_TERMS = 'Publicado web términos'
const UPDATED_ORG_TERMS_HTML = '<p>Términos actualizados para organizaciones</p>'

function tipTapDoc(text: string): Record<string, unknown> {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

function createDocument(
  overrides: Partial<LegalDocumentResponse> & Pick<LegalDocumentResponse, 'type' | 'content'>
): LegalDocumentResponse {
  return {
    documentId: `${overrides.type}-doc`,
    version: 'v1',
    title: 'Términos y condiciones',
    isPublished: false,
    requiresAcceptance: false,
    publishedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  }
}

function createList(
  overrides: Partial<Record<LegalDocumentType, Partial<LegalDocumentByTypeResponse>>> = {}
): LegalDocumentByTypeResponse[] {
  return Object.values(LEGAL_DOCUMENT_TYPE).map((type) => ({
    type,
    draft: null,
    published: null,
    ...overrides[type],
  }))
}

function renderView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    createElement(QueryClientProvider, { client: queryClient }, createElement(LegalDocumentsView))
  )

  return queryClient
}

function organizationsSection() {
  return within(screen.getByRole('region', { name: 'Organizaciones' }))
}

function organizationsTermsEditor() {
  return screen.getByRole('textbox', {
    name: 'Editor de términos y condiciones para organizaciones',
  }) as HTMLTextAreaElement
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

test('loads persisted draft HTML into the organizations terms editor and prefers draft over published', async () => {
  serviceMocks.listLegalDocuments.mockResolvedValue(
    createList({
      [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]: {
        draft: createDocument({
          type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
          content: tipTapDoc(DRAFT_ORG_TERMS),
        }),
        published: createDocument({
          type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
          content: tipTapDoc(PUBLISHED_ORG_TERMS),
          isPublished: true,
          publishedAt: new Date('2026-01-01T00:00:00Z'),
        }),
      },
      [LEGAL_DOCUMENT_TYPE.TERMS_WEB]: {
        published: createDocument({
          type: LEGAL_DOCUMENT_TYPE.TERMS_WEB,
          content: tipTapDoc(PUBLISHED_WEB_TERMS),
          isPublished: true,
          publishedAt: new Date('2026-01-01T00:00:00Z'),
        }),
      },
    })
  )

  const queryClient = renderView()

  await waitFor(() => expect(organizationsTermsEditor().value).toContain(DRAFT_ORG_TERMS))
  expect(organizationsTermsEditor().value).not.toContain(PUBLISHED_ORG_TERMS)
  expect(
    (
      screen.getByRole('textbox', {
        name: 'Editor de términos y condiciones para web',
      }) as HTMLTextAreaElement
    ).value
  ).toContain(PUBLISHED_WEB_TERMS)
  expect(serviceMocks.listLegalDocuments).toHaveBeenCalledOnce()
  queryClient.clear()
})

test('Guardar saves an unpublished draft with the organizations terms type and TipTap JSON content', async () => {
  serviceMocks.listLegalDocuments.mockResolvedValue(createList())
  serviceMocks.saveDraft.mockResolvedValue(
    createDocument({
      type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
      content: tipTapDoc('Términos actualizados para organizaciones'),
    })
  )

  const queryClient = renderView()

  await waitFor(() => expect(organizationsTermsEditor()).toBeTruthy())
  fireEvent.change(organizationsTermsEditor(), { target: { value: UPDATED_ORG_TERMS_HTML } })
  fireEvent.click(organizationsSection().getByRole('button', { name: 'Guardar' }))

  await waitFor(() => expect(serviceMocks.saveDraft).toHaveBeenCalledOnce())
  expect(serviceMocks.saveDraft.mock.calls[0][0]).toBe(LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD)
  expect(serviceMocks.saveDraft.mock.calls[0][1]).toEqual(
    expect.objectContaining({
      title: 'Términos y condiciones',
      content: expect.objectContaining({ type: 'doc' }),
    })
  )
  expect(toastMocks.success).toHaveBeenCalledWith(
    'Se guardaron los términos y condiciones de organizaciones.'
  )
  queryClient.clear()
})

test('Publicar is disabled when the API returns no unpublished draft and the editor shows last published content', async () => {
  serviceMocks.listLegalDocuments.mockResolvedValue(
    createList({
      [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]: {
        draft: null,
        published: createDocument({
          type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
          content: tipTapDoc(PUBLISHED_ORG_TERMS),
          isPublished: true,
          publishedAt: new Date('2026-01-01T00:00:00Z'),
        }),
      },
    })
  )

  const queryClient = renderView()

  await waitFor(() => expect(organizationsTermsEditor().value).toContain(PUBLISHED_ORG_TERMS))
  const publishButton = organizationsSection().getByRole('button', { name: 'Publicar' })
  expect((publishButton as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(publishButton)
  expect(serviceMocks.publish).not.toHaveBeenCalled()
  queryClient.clear()
})

test('Publicar publishes the persisted organizations terms draft', async () => {
  serviceMocks.listLegalDocuments.mockResolvedValue(
    createList({
      [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]: {
        draft: createDocument({
          type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
          content: tipTapDoc(DRAFT_ORG_TERMS),
        }),
      },
    })
  )
  serviceMocks.publish.mockResolvedValue(
    createDocument({
      type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
      content: tipTapDoc(DRAFT_ORG_TERMS),
      isPublished: true,
      publishedAt: new Date('2026-01-03T00:00:00Z'),
    })
  )

  const queryClient = renderView()

  await waitFor(() => expect(organizationsTermsEditor().value).toContain(DRAFT_ORG_TERMS))
  const publishButton = organizationsSection().getByRole('button', { name: 'Publicar' })
  expect((publishButton as HTMLButtonElement).disabled).toBe(false)
  fireEvent.click(publishButton)

  await waitFor(() => expect(serviceMocks.publish).toHaveBeenCalledOnce())
  expect(serviceMocks.publish.mock.calls[0][0]).toBe(LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD)
  expect(toastMocks.success).toHaveBeenCalledWith(
    'Se publicaron los términos y condiciones de organizaciones.'
  )
  queryClient.clear()
})

test('retries a failed list load and hydrates the editor after refetch', async () => {
  serviceMocks.listLegalDocuments.mockRejectedValueOnce(
    new Error('No se pudieron cargar los documentos legales')
  )
  serviceMocks.listLegalDocuments.mockResolvedValueOnce(
    createList({
      [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]: {
        draft: createDocument({
          type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
          content: tipTapDoc(DRAFT_ORG_TERMS),
        }),
      },
    })
  )

  const queryClient = renderView()

  await waitFor(() => expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy())
  expect(screen.getByRole('alert').textContent).toContain(
    'No se pudieron cargar los documentos legales'
  )
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

  await waitFor(() => expect(organizationsTermsEditor().value).toContain(DRAFT_ORG_TERMS))
  expect(serviceMocks.listLegalDocuments).toHaveBeenCalledTimes(2)
  queryClient.clear()
})

test('save and publish errors surface a toast message', async () => {
  serviceMocks.listLegalDocuments.mockResolvedValue(
    createList({
      [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]: {
        draft: createDocument({
          type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
          content: tipTapDoc(DRAFT_ORG_TERMS),
        }),
      },
    })
  )
  serviceMocks.saveDraft.mockRejectedValue(new Error('No se pudo guardar el borrador'))
  serviceMocks.publish.mockRejectedValue(new Error('No se pudo publicar el documento'))

  const queryClient = renderView()

  await waitFor(() => expect(organizationsTermsEditor().value).toContain(DRAFT_ORG_TERMS))
  fireEvent.click(organizationsSection().getByRole('button', { name: 'Guardar' }))

  await waitFor(() =>
    expect(toastMocks.error).toHaveBeenCalledWith(
      'No se pudieron guardar los términos y condiciones de organizaciones.'
    )
  )

  fireEvent.click(organizationsSection().getByRole('button', { name: 'Publicar' }))

  await waitFor(() =>
    expect(toastMocks.error).toHaveBeenCalledWith(
      'No se pudieron publicar los términos y condiciones de organizaciones.'
    )
  )
  queryClient.clear()
})

test('shows loading copy while the list request is pending and disables actions while saving or publishing', async () => {
  const listDeferred = Promise.withResolvers<LegalDocumentByTypeResponse[]>()
  const saveDeferred = Promise.withResolvers<LegalDocumentResponse>()
  const publishDeferred = Promise.withResolvers<LegalDocumentResponse>()

  serviceMocks.listLegalDocuments.mockReturnValue(listDeferred.promise)
  serviceMocks.saveDraft.mockReturnValue(saveDeferred.promise)
  serviceMocks.publish.mockReturnValue(publishDeferred.promise)

  const queryClient = renderView()

  expect(screen.getByText('Cargando documentos legales')).toBeTruthy()

  listDeferred.resolve(
    createList({
      [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]: {
        draft: createDocument({
          type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
          content: tipTapDoc(DRAFT_ORG_TERMS),
        }),
      },
    })
  )

  await waitFor(() => expect(organizationsTermsEditor().value).toContain(DRAFT_ORG_TERMS))

  fireEvent.change(organizationsTermsEditor(), { target: { value: UPDATED_ORG_TERMS_HTML } })
  fireEvent.click(organizationsSection().getByRole('button', { name: 'Guardar' }))

  await waitFor(() => {
    const saveButton = organizationsSection().getByRole('button', { name: /Guardar|Guardando/ })
    expect((saveButton as HTMLButtonElement).disabled).toBe(true)
  })

  saveDeferred.resolve(
    createDocument({
      type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
      content: tipTapDoc('Términos actualizados para organizaciones'),
    })
  )

  await waitFor(() =>
    expect(
      (organizationsSection().getByRole('button', { name: 'Guardar' }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  )

  fireEvent.click(organizationsSection().getByRole('button', { name: 'Publicar' }))

  await waitFor(() => {
    const publishButton = organizationsSection().getByRole('button', {
      name: /Publicar|Publicando/,
    })
    expect((publishButton as HTMLButtonElement).disabled).toBe(true)
  })

  publishDeferred.resolve(
    createDocument({
      type: LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
      content: tipTapDoc(DRAFT_ORG_TERMS),
      isPublished: true,
      publishedAt: new Date('2026-01-03T00:00:00Z'),
    })
  )

  await waitFor(() => expect(serviceMocks.publish).toHaveBeenCalledOnce())
  queryClient.clear()
})
