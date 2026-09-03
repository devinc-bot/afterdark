// @vitest-environment jsdom
import { createElement } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ACCOUNT_SESSION_STATUS, CLIENT_APP, type AccountSessionResponse } from '@repo/types'
import { AccountSessions, type AccountSessionsLabels } from '@repo/ui'

const labels: AccountSessionsLabels = {
  title: 'Sessions',
  description: 'Review signed-in devices.',
  loading: 'Loading',
  loadError: 'Load failed',
  retry: 'Retry',
  empty: 'No sessions',
  unknownDevice: 'Unknown device',
  metadataUnavailable: 'Metadata unavailable',
  current: 'Current session',
  close: 'Close',
  revoke: 'Revoke',
  revoking: 'Revoking',
  cancel: 'Cancel',
  confirmTitle: 'Revoke this session?',
  confirmDescription: 'This device will need to sign in again.',
  getCreatedAtLabel: () => 'Created today',
  getExpiresAtLabel: () => 'Expires tomorrow',
  getStatusLabel: (status) => status,
}

const remoteSession: AccountSessionResponse = {
  documentId: 'remote-session',
  clientApp: CLIENT_APP.DASHBOARD,
  device: 'Safari on macOS',
  ipAddress: '203.0.113.11',
  locationLabel: 'Córdoba',
  createdAt: new Date('2026-01-01T10:00:00Z'),
  expiresAt: new Date('2026-01-02T10:00:00Z'),
  revokedAt: null,
  status: ACCOUNT_SESSION_STATUS.ACTIVE,
  isCurrent: false,
}

afterEach(cleanup)

test('confirms remote-session revocation and removes the revoked device from the visible list', async () => {
  const onRevoke = vi.fn().mockResolvedValue(undefined)

  render(
    createElement(AccountSessions, {
      sessions: [remoteSession],
      isLoading: false,
      error: null,
      revokeError: null,
      isRevoking: false,
      labels,
      onRetry: () => undefined,
      onRevoke,
      onClearRevokeError: () => undefined,
    })
  )

  fireEvent.click(screen.getByRole('button', { name: 'Revoke' }))
  expect(screen.getByRole('dialog')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Revoke this session?' })).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Revoke' }))

  await waitFor(() => expect(onRevoke).toHaveBeenCalledWith('remote-session'))
  await waitFor(() => expect(screen.queryByText('Safari on macOS')).toBeNull())
  expect(screen.queryByRole('dialog')).toBeNull()
})
