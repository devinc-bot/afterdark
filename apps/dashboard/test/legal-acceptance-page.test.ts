// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { LEGAL_DOCUMENT_TYPE, type PublicLegalDocumentResponse } from '@repo/types'

const serviceMocks = vi.hoisted(() => ({
  getPendingLegalAcceptance: vi.fn(),
  getPublishedLegalDocumentByType: vi.fn(),
  acceptLegalDocuments: vi.fn(),
}))

const navigateMock = vi.hoisted(() => vi.fn())

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'legalAcceptance.title': 'Hay una versión nueva',
        'legalAcceptance.description': 'Actualizamos los documentos legales.',
        'legalAcceptance.submit': 'Aceptar y continuar',
        'legalAcceptance.submitting': 'Guardando…',
        'legalAcceptance.required': 'Marcá todos los documentos para continuar.',
        'register.legal.terms': 'Acepto los términos y condiciones',
        'register.legal.privacy': 'Acepto la política de privacidad',
        'register.legal.termsOpen': 'Leer términos y condiciones',
        'register.legal.privacyOpen': 'Leer política de privacidad',
        'register.legal.close': 'Cerrar',
        'register.legal.dialogDescription': 'Documento legal publicado.',
        'register.legal.legend': 'Aceptación de documentos legales',
        'register.legal.loading': 'Cargando documentos legales…',
        'register.legal.retry': 'Reintentar',
        'register.legal.unavailable': 'No se pudieron cargar los documentos legales requeridos.',
      })[key] ?? key,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  Link: ({ children, to }: { children?: ReactNode; to?: string }) =>
    createElement('a', { href: to }, children),
}))

vi.mock('../../app/modules/legal-documents/services/legal-documents.service.ts', () => serviceMocks)
vi.mock('../app/modules/legal-documents/services/legal-documents.service.ts', () => serviceMocks)

import { LegalAcceptancePage } from '../app/modules/legal-documents/components/legal-acceptance-page'

function published(
  type: PublicLegalDocumentResponse['type'],
  title = type,
  text = type
): PublicLegalDocumentResponse {
  return {
    documentId: `${type}-id`,
    type,
    version: 'v2',
    title,
    content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] },
    publishedAt: new Date('2026-01-01T00:00:00Z'),
  }
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(createElement(QueryClientProvider, { client: queryClient }, createElement(LegalAcceptancePage)))
  return queryClient
}

beforeEach(() => {
  navigateMock.mockReset()
  serviceMocks.acceptLegalDocuments.mockResolvedValue({ staleTypes: [] })
  serviceMocks.getPendingLegalAcceptance.mockResolvedValue({
    staleTypes: [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD],
  })
  serviceMocks.getPublishedLegalDocumentByType.mockImplementation(async (type: string) =>
    published(type as PublicLegalDocumentResponse['type'])
  )
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => undefined
  HTMLElement.prototype.releasePointerCapture = () => undefined
  HTMLElement.prototype.scrollIntoView = () => undefined

  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

test('shows only stale dashboard document checkboxes and blocks submit until checked', async () => {
  const queryClient = renderPage()

  await waitFor(() =>
    expect(screen.getByRole('checkbox', { name: /términos y condiciones/i })).toBeTruthy()
  )
  expect(screen.queryByRole('checkbox', { name: /política de privacidad/i })).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Aceptar y continuar' }))
  expect(serviceMocks.acceptLegalDocuments).not.toHaveBeenCalled()
  expect(screen.getByText('Marcá todos los documentos para continuar.')).toBeTruthy()

  fireEvent.click(screen.getByRole('checkbox', { name: /términos y condiciones/i }))
  fireEvent.click(screen.getByRole('button', { name: 'Aceptar y continuar' }))

  await waitFor(() =>
    expect(serviceMocks.acceptLegalDocuments).toHaveBeenCalledWith([
      LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
    ])
  )
  queryClient.clear()
})

test('shows only stale privacy checkbox when privacy dashboard is the stale type', async () => {
  serviceMocks.getPendingLegalAcceptance.mockResolvedValue({
    staleTypes: [LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD],
  })
  const queryClient = renderPage()

  await waitFor(() =>
    expect(screen.getByRole('checkbox', { name: /política de privacidad/i })).toBeTruthy()
  )
  expect(screen.queryByRole('checkbox', { name: /términos y condiciones/i })).toBeNull()

  fireEvent.click(screen.getByRole('checkbox', { name: /política de privacidad/i }))
  fireEvent.click(screen.getByRole('button', { name: 'Aceptar y continuar' }))

  await waitFor(() =>
    expect(serviceMocks.acceptLegalDocuments).toHaveBeenCalledWith([
      LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
    ])
  )
  queryClient.clear()
})

test('opening a stale document dialog shows the published title and converted content', async () => {
  serviceMocks.getPublishedLegalDocumentByType.mockResolvedValue(
    published(
      LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
      'Términos dashboard publicados',
      'Contenido publicado de términos dashboard'
    )
  )
  const queryClient = renderPage()

  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Leer términos y condiciones' })).toBeTruthy()
  )
  fireEvent.click(screen.getByRole('button', { name: 'Leer términos y condiciones' }))

  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByRole('heading', { name: 'Términos dashboard publicados' })).toBeTruthy()
  expect(within(dialog).getByText('Contenido publicado de términos dashboard')).toBeTruthy()
  queryClient.clear()
})

test('both stale dashboard types require both checkboxes before submit', async () => {
  serviceMocks.getPendingLegalAcceptance.mockResolvedValue({
    staleTypes: [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD, LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD],
  })
  const queryClient = renderPage()

  await waitFor(() =>
    expect(screen.getByRole('checkbox', { name: /términos y condiciones/i })).toBeTruthy()
  )
  expect(screen.getByRole('checkbox', { name: /política de privacidad/i })).toBeTruthy()

  fireEvent.click(screen.getByRole('checkbox', { name: /términos y condiciones/i }))
  fireEvent.click(screen.getByRole('button', { name: 'Aceptar y continuar' }))
  expect(serviceMocks.acceptLegalDocuments).not.toHaveBeenCalled()
  expect(screen.getByText('Marcá todos los documentos para continuar.')).toBeTruthy()

  fireEvent.click(screen.getByRole('checkbox', { name: /política de privacidad/i }))
  fireEvent.click(screen.getByRole('button', { name: 'Aceptar y continuar' }))

  await waitFor(() =>
    expect(serviceMocks.acceptLegalDocuments).toHaveBeenCalledWith([
      LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
      LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
    ])
  )
  queryClient.clear()
})
