// @vitest-environment jsdom
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ACCOUNT_SESSION_STATUS, CLIENT_APP, type AccountSessionResponse } from '@repo/types'

const serviceMocks = vi.hoisted(() => ({
  getAccountSessions: vi.fn(),
  revokeAccountSession: vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'es' },
    t: (key: string) =>
      ({
        'sessions.title': 'Sesiones',
        'sessions.description': 'Revisa los dispositivos con sesión iniciada.',
        'sessions.loading': 'Cargando sesiones',
        'sessions.loadError': 'No se pudieron cargar las sesiones',
        'sessions.retry': 'Reintentar',
        'sessions.empty': 'No hay sesiones',
        'sessions.unknownDevice': 'Dispositivo desconocido',
        'sessions.metadataUnavailable': 'Metadatos no disponibles',
        'sessions.current': 'Sesión actual',
        'sessions.close': 'Cerrar',
        'sessions.revoke': 'Revocar',
        'sessions.revoking': 'Revocando',
        'sessions.cancel': 'Cancelar',
        'sessions.confirmTitle': '¿Revocar esta sesión?',
        'sessions.confirmDescription': 'Este dispositivo deberá iniciar sesión de nuevo.',
        'sessions.count': '1 sesión',
        'sessions.created': 'Creada hoy',
        'sessions.expires': 'Vence mañana',
        'sessions.status.active': 'Activa',
      })[key] ?? key,
  }),
}))

vi.mock('../app/modules/settings/services/account-sessions.service', () => serviceMocks)

import { AccountSessionsSection } from '../app/modules/settings/components/account-sessions-section'

const remoteSession: AccountSessionResponse = {
  documentId: 'web-remote-session',
  clientApp: CLIENT_APP.WEB,
  device: 'Chrome en Windows',
  ipAddress: '203.0.113.10',
  locationLabel: 'Buenos Aires',
  createdAt: new Date('2026-01-01T10:00:00Z'),
  expiresAt: new Date('2026-01-02T10:00:00Z'),
  revokedAt: null,
  status: ACCOUNT_SESSION_STATUS.ACTIVE,
  isCurrent: false,
}

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(AccountSessionsSection)
    )
  )

  return queryClient
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

test('fetches Spanish sessions, revokes a remote session, then invalidates and refetches the list', async () => {
  serviceMocks.getAccountSessions.mockResolvedValue({ sessions: [remoteSession] })
  serviceMocks.revokeAccountSession.mockResolvedValue(undefined)

  const queryClient = renderSection()

  await waitFor(() => expect(screen.getByText('Chrome en Windows')).toBeTruthy())
  expect(screen.getByRole('heading', { name: 'Sesiones' })).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Revocar' }))
  const dialog = await screen.findByRole('dialog')
  fireEvent.click(within(dialog).getByRole('button', { name: 'Revocar' }))

  await waitFor(() => expect(serviceMocks.revokeAccountSession).toHaveBeenCalledOnce())
  expect(serviceMocks.revokeAccountSession.mock.calls[0][0]).toBe('web-remote-session')
  await waitFor(() => expect(serviceMocks.getAccountSessions).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(screen.queryByText('Chrome en Windows')).toBeNull())
  expect(screen.queryByRole('dialog')).toBeNull()
  queryClient.clear()
})

test('retries the failed query and retains the confirmation dialog when revocation fails', async () => {
  serviceMocks.getAccountSessions.mockRejectedValueOnce(
    new Error('No se pudieron cargar las sesiones')
  )
  serviceMocks.getAccountSessions.mockResolvedValueOnce({ sessions: [remoteSession] })
  serviceMocks.revokeAccountSession.mockRejectedValue(new Error('No se pudo revocar la sesión'))

  const queryClient = renderSection()

  await waitFor(() => expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy())
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
  await waitFor(() => expect(screen.getByText('Chrome en Windows')).toBeTruthy())

  fireEvent.click(screen.getByRole('button', { name: 'Revocar' }))
  const dialog = await screen.findByRole('dialog')
  fireEvent.click(within(dialog).getByRole('button', { name: 'Revocar' }))

  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain('No se pudo revocar la sesión')
  )
  expect(dialog).toBeTruthy()
  expect(screen.getByText('Chrome en Windows')).toBeTruthy()
  queryClient.clear()
})
