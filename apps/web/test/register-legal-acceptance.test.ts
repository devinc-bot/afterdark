// @vitest-environment jsdom
import { readFile } from 'node:fs/promises'
import { createElement, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { LEGAL_DOCUMENT_TYPE, type PublicLegalDocumentResponse } from '@repo/types'

const serviceMocks = vi.hoisted(() => ({
  getPublishedLegalDocumentByType: vi.fn(),
}))

const registerMocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  error: null as Error | null,
}))

const routerMocks = vi.hoisted(() => ({
  search: { error: undefined as string | undefined },
}))

const locationAssign = vi.hoisted(() => vi.fn())

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'es' },
    t: (key: string) =>
      ({
        'register.title': 'Crear cuenta',
        'register.subtitle': 'Unite a Lumina y empezá a descubrir la noche.',
        'register.name': 'Nombre',
        'register.namePlaceholder': 'María',
        'register.lastName': 'Apellido',
        'register.lastNamePlaceholder': 'González',
        'register.emailWeb': 'Correo',
        'register.emailPlaceholderWeb': 'maria@correo.com',
        'register.password': 'Contraseña',
        'register.passwordPlaceholder': 'Mínimo 8 caracteres',
        'register.confirmPassword': 'Confirmar contraseña',
        'register.confirmPasswordPlaceholder': 'Repetí la contraseña',
        'register.submit': 'Crear cuenta',
        'register.submitting': 'Creando…',
        'register.alreadyHaveAccount': '¿Ya tenés cuenta?',
        'register.signIn': 'Iniciar sesión',
        'register.legal.terms': 'Acepto los términos y condiciones',
        'register.legal.privacy': 'Acepto la política de privacidad',
        'register.legal.termsOpen': 'Leer términos y condiciones',
        'register.legal.privacyOpen': 'Leer política de privacidad',
        'register.legal.unavailable': 'No se pudieron cargar los documentos legales requeridos.',
        'register.legal.required': 'Tenés que aceptar los términos y la privacidad.',
        'register.legal.close': 'Cerrar',
        'register.legal.dialogDescription': 'Documento legal publicado.',
        'register.legal.legend': 'Aceptación de documentos legales',
        'register.otherOptions': 'Otras opciones de acceso',
        'google.continue': 'Continuar con Google',
        'google.or': 'o',
        'google.errors.registerRequired':
          'Para crear una cuenta con Google, registrate y aceptá los términos y la privacidad.',
      })[key] ?? key,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children?: ReactNode; to?: string }) =>
    createElement('a', { href: typeof to === 'string' ? to : '/', ...props }, children),
  useSearch: () => routerMocks.search,
}))

vi.mock('~/config/api', () => ({
  API_URL: 'http://localhost:3000/api',
}))
vi.mock('../app/config/api', () => ({
  API_URL: 'http://localhost:3000/api',
}))

vi.mock('../app/modules/auth/mutations/use-auth-mutations', () => ({
  useRequestRegister: () => registerMocks,
}))
vi.mock('~/modules/auth/mutations/use-auth-mutations', () => ({
  useRequestRegister: () => registerMocks,
}))

vi.mock('../app/modules/legal-documents/services/legal-documents.service', () => serviceMocks)
vi.mock('~/modules/legal-documents/services/legal-documents.service', () => serviceMocks)

vi.mock('~/modules/common/constants/query-keys', () => ({
  QUERY_KEYS: {
    publishedLegalDocument: (type: string) => ['published-legal-document', type] as const,
  },
}))
vi.mock('../app/modules/common/constants/query-keys', () => ({
  QUERY_KEYS: {
    publishedLegalDocument: (type: string) => ['published-legal-document', type] as const,
  },
}))

import { RegisterForm } from '../app/modules/auth/components/register-form'

const PUBLISHED_TERMS_TITLE = 'Términos web publicados'
const PUBLISHED_TERMS_TEXT = 'Contenido publicado de términos web'
const PUBLISHED_PRIVACY_TITLE = 'Privacidad web publicada'
const PUBLISHED_PRIVACY_TEXT = 'Contenido publicado de privacidad web'

function tipTapDoc(text: string): Record<string, unknown> {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

function tipTapListDoc(): Record<string, unknown> {
  return {
    type: 'doc',
    content: [
      {
        type: 'orderedList',
        attrs: { start: 1 },
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Paso numerado' }] }],
          },
        ],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Viñeta publicada' }] }],
          },
        ],
      },
    ],
  }
}

function publishedDocument(
  type: PublicLegalDocumentResponse['type'],
  title: string,
  text: string
): PublicLegalDocumentResponse {
  return {
    documentId: `${type}-published`,
    type,
    version: 'v1',
    title,
    content: tipTapDoc(text),
    publishedAt: new Date('2026-01-01T00:00:00Z'),
  }
}

const publishedTerms = publishedDocument(
  LEGAL_DOCUMENT_TYPE.TERMS_WEB,
  PUBLISHED_TERMS_TITLE,
  PUBLISHED_TERMS_TEXT
)
const publishedPrivacy = publishedDocument(
  LEGAL_DOCUMENT_TYPE.PRIVACY_WEB,
  PUBLISHED_PRIVACY_TITLE,
  PUBLISHED_PRIVACY_TEXT
)

function mockPublishedDocuments(
  terms: PublicLegalDocumentResponse | null = publishedTerms,
  privacy: PublicLegalDocumentResponse | null = publishedPrivacy
) {
  serviceMocks.getPublishedLegalDocumentByType.mockImplementation(async (type: string) => {
    if (type === LEGAL_DOCUMENT_TYPE.TERMS_WEB) {
      if (!terms) throw new Error('No se encontró el documento publicado')
      return terms
    }
    if (type === LEGAL_DOCUMENT_TYPE.PRIVACY_WEB) {
      if (!privacy) throw new Error('No se encontró el documento publicado')
      return privacy
    }
    throw new Error(`Unexpected legal document type: ${type}`)
  })
}

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(createElement(QueryClientProvider, { client: queryClient }, createElement(RegisterForm)))

  return queryClient
}

function termsCheckbox() {
  return screen.getByRole('checkbox', { name: /términos y condiciones/i })
}

function privacyCheckbox() {
  return screen.getByRole('checkbox', { name: /política de privacidad/i })
}

function googleButton() {
  return screen.getByRole('button', { name: 'Continuar con Google' }) as HTMLButtonElement
}

function submitButton() {
  return screen.getByRole('button', { name: 'Crear cuenta' }) as HTMLButtonElement
}

function fillValidRegisterFields() {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Maria' } })
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Gonzalez' } })
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'maria@correo.com' } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password1' } })
  fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
    target: { value: 'password1' },
  })
}

async function acceptRequiredLegalDocuments() {
  await waitFor(() => expect(termsCheckbox()).toBeTruthy())
  fireEvent.click(termsCheckbox())
  fireEvent.click(privacyCheckbox())
  await waitFor(() => {
    expect(termsCheckbox().getAttribute('aria-checked')).toBe('true')
    expect(privacyCheckbox().getAttribute('aria-checked')).toBe('true')
  })
}

async function flushSubmit() {
  await Promise.resolve()
  await Promise.resolve()
}

async function readSource(relativeFromTest: string) {
  try {
    return await readFile(new URL(relativeFromTest, import.meta.url), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return ''
    }
    throw error
  }
}

beforeEach(() => {
  routerMocks.search.error = undefined
  registerMocks.isPending = false
  registerMocks.isError = false
  registerMocks.error = null
  registerMocks.mutateAsync.mockReset()
  registerMocks.mutateAsync.mockResolvedValue(undefined)
  locationAssign.mockReset()
  mockPublishedDocuments()

  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: {
      assign: locationAssign,
      href: 'http://localhost:3001/register',
      origin: 'http://localhost:3001',
    },
  })

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

test('renders required terms and privacy checkboxes with accessible names', async () => {
  const queryClient = renderForm()

  await waitFor(() => expect(termsCheckbox()).toBeTruthy())
  expect(privacyCheckbox()).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Leer términos y condiciones' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Leer política de privacidad' })).toBeTruthy()
  expect(serviceMocks.getPublishedLegalDocumentByType).toHaveBeenCalledWith(
    LEGAL_DOCUMENT_TYPE.TERMS_WEB
  )
  expect(serviceMocks.getPublishedLegalDocumentByType).toHaveBeenCalledWith(
    LEGAL_DOCUMENT_TYPE.PRIVACY_WEB
  )
  queryClient.clear()
})

test('opening the terms dialog shows the published title and converted content', async () => {
  const queryClient = renderForm()

  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Leer términos y condiciones' })).toBeTruthy()
  )
  fireEvent.click(screen.getByRole('button', { name: 'Leer términos y condiciones' }))

  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByRole('heading', { name: PUBLISHED_TERMS_TITLE })).toBeTruthy()
  expect(within(dialog).getByText(PUBLISHED_TERMS_TEXT)).toBeTruthy()
  queryClient.clear()
})

test('opening the terms dialog renders published ordered and bullet lists as list items', async () => {
  mockPublishedDocuments(
    {
      ...publishedTerms,
      content: tipTapListDoc(),
    },
    publishedPrivacy
  )
  const queryClient = renderForm()

  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Leer términos y condiciones' })).toBeTruthy()
  )
  fireEvent.click(screen.getByRole('button', { name: 'Leer términos y condiciones' }))

  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getAllByRole('list')).toHaveLength(2)
  expect(within(dialog).getAllByRole('listitem')).toHaveLength(2)
  expect(within(dialog).getByText('Paso numerado')).toBeTruthy()
  expect(within(dialog).getByText('Viñeta publicada')).toBeTruthy()
  queryClient.clear()
})

test('submit does not call register when legal checkboxes are unchecked', async () => {
  const queryClient = renderForm()

  await waitFor(() => expect(termsCheckbox()).toBeTruthy())
  fillValidRegisterFields()
  fireEvent.click(submitButton())
  await flushSubmit()

  expect(registerMocks.mutateAsync).not.toHaveBeenCalled()
  expect(screen.getByText('Tenés que aceptar los términos y la privacidad.')).toBeTruthy()
  queryClient.clear()
})

test('submit calls register when both checkboxes are checked and published docs are loaded', async () => {
  const queryClient = renderForm()

  await acceptRequiredLegalDocuments()
  fillValidRegisterFields()
  fireEvent.click(submitButton())

  await waitFor(() => expect(registerMocks.mutateAsync).toHaveBeenCalledOnce())
  expect(registerMocks.mutateAsync).toHaveBeenCalledWith({
    name: 'Maria',
    lastName: 'Gonzalez',
    email: 'maria@correo.com',
    password: 'password1',
  })
  queryClient.clear()
})

test('Google continue does not navigate when legal acceptance is incomplete', async () => {
  const queryClient = renderForm()

  await waitFor(() => expect(termsCheckbox()).toBeTruthy())
  expect(googleButton().disabled).toBe(true)
  fireEvent.click(googleButton())
  expect(locationAssign).not.toHaveBeenCalled()

  fireEvent.click(termsCheckbox())
  expect(googleButton().disabled).toBe(true)
  fireEvent.click(googleButton())
  expect(locationAssign).not.toHaveBeenCalled()
  queryClient.clear()
})

test('Google continue assigns a start URL with legalAccepted=true after both boxes are checked', async () => {
  const queryClient = renderForm()

  await acceptRequiredLegalDocuments()
  expect(googleButton().disabled).toBe(false)
  fireEvent.click(googleButton())

  expect(locationAssign).toHaveBeenCalledOnce()
  expect(String(locationAssign.mock.calls[0]?.[0])).toContain('legalAccepted=true')
  queryClient.clear()
})

test('missing published documents block Google and submit and show an unavailable message', async () => {
  mockPublishedDocuments(publishedTerms, null)
  const queryClient = renderForm()

  await waitFor(() =>
    expect(
      screen.getByText('No se pudieron cargar los documentos legales requeridos.')
    ).toBeTruthy()
  )

  fillValidRegisterFields()
  const terms = screen.queryByRole('checkbox', { name: /términos y condiciones/i })
  const privacy = screen.queryByRole('checkbox', { name: /política de privacidad/i })
  if (terms) fireEvent.click(terms)
  if (privacy) fireEvent.click(privacy)

  expect(googleButton().disabled).toBe(true)
  fireEvent.click(googleButton())
  expect(locationAssign).not.toHaveBeenCalled()

  fireEvent.click(submitButton())
  await flushSubmit()
  expect(registerMocks.mutateAsync).not.toHaveBeenCalled()
  queryClient.clear()
})

test('shows the mapped Google register_required error from search', async () => {
  routerMocks.search.error = 'register_required'
  const queryClient = renderForm()

  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain(
      'Para crear una cuenta con Google, registrate y aceptá los términos y la privacidad.'
    )
  )
  queryClient.clear()
})

test('register wiring uses published-by-type routes, query keys, and legalAccepted intent', async () => {
  const [
    registerRoute,
    registerForm,
    googleButtonSource,
    loginForm,
    legalService,
    queryKeys,
    authEs,
    authEn,
  ] = await Promise.all([
    readSource('../app/routes/register.tsx'),
    readSource('../app/modules/auth/components/register-form.tsx'),
    readSource('../app/modules/auth/components/google-continue-button.tsx'),
    readSource('../app/modules/auth/components/login-form.tsx'),
    readSource('../app/modules/legal-documents/services/legal-documents.service.ts'),
    readSource('../app/modules/common/constants/query-keys.ts'),
    readSource('../../../packages/i18n/src/locales/auth/es.json'),
    readSource('../../../packages/i18n/src/locales/auth/en.json'),
  ])

  expect(registerRoute).toContain('validateSearch')
  expect(registerRoute).toContain("typeof search.error === 'string'")

  expect(registerForm).toContain('googleOauthErrorMessageKey')
  expect(registerForm).toContain('LEGAL_DOCUMENT_TYPE.TERMS_WEB')
  expect(registerForm).toContain('LEGAL_DOCUMENT_TYPE.PRIVACY_WEB')
  expect(registerForm).toContain('LegalAcceptanceField')
  expect(registerForm).toContain('PublishedLegalDocumentDialog')
  expect(registerForm).toContain('legalAccepted')
  expect(registerForm).not.toContain('/api/legal-documents')

  expect(await readSource('../app/modules/legal-documents/components/legal-acceptance-fields.tsx')).toContain(
    'RICH_EDITOR_HTML_CLASS_NAME'
  )

  expect(googleButtonSource).toContain('legalAccepted: true')
  expect(googleButtonSource).toContain('disabled')
  expect(loginForm).toContain('GoogleContinueButton')
  expect(loginForm).not.toContain('legalAccepted')

  expect(legalService).toContain('getPublishedByType')
  expect(legalService).toContain('LEGAL_DOCUMENT_TYPE')
  expect(legalService).toContain('buildApiPath')
  expect(legalService).toContain('API_ROUTES.legalDocuments')
  expect(legalService).not.toContain('/api/legal-documents/')

  expect(queryKeys).toContain('QUERY_KEYS')
  expect(queryKeys).toMatch(/publishedLegalDocument/)

  expect(authEs).toContain('"legal"')
  expect(authEn).toContain('"legal"')
  expect(queryKeys).toContain('LegalDocumentType')
})
