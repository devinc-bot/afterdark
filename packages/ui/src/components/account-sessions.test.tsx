// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ACCOUNT_SESSION_STATUS } from '@repo/types'
import { AccountSessions, type AccountSessionsLabels } from './account-sessions'

const labels: AccountSessionsLabels = {
  title: 'Sessions',
  description: 'Review signed-in devices.',
  loading: 'Loading sessions',
  loadError: 'Could not load sessions',
  retry: 'Retry',
  empty: 'No sessions',
  unknownDevice: 'Unknown device',
  metadataUnavailable: 'Location unavailable',
  current: 'Current session',
  close: 'Close',
  revoke: 'Revoke',
  revoking: 'Revoking',
  cancel: 'Cancel',
  confirmTitle: 'Revoke this session?',
  confirmDescription: 'The device will need to sign in again.',
  getCreatedAtLabel: () => 'Created today',
  getExpiresAtLabel: () => 'Expires tomorrow',
  getStatusLabel: (status) => status,
}

const redesignedLabels = {
  ...labels,
  description: 'Review each device and revoke any session you do not recognize.',
  getSessionCountLabel: (count: number) => `${count} sessions`,
}

afterEach(cleanup)

test('summarizes visible sessions and keeps each session’s security details readable', () => {
  render(
    <AccountSessions
      sessions={[
        {
          documentId: 'current',
          clientApp: 'web',
          device: 'Chrome on Windows',
          ipAddress: '203.0.113.10',
          locationLabel: 'Buenos Aires, AR',
          createdAt: new Date('2026-09-02T12:00:00.000Z'),
          expiresAt: new Date('2026-09-03T12:00:00.000Z'),
          revokedAt: null,
          status: ACCOUNT_SESSION_STATUS.ACTIVE,
          isCurrent: true,
        },
        {
          documentId: 'remote-active',
          clientApp: 'web',
          device: 'Safari on iPhone',
          ipAddress: '198.51.100.20',
          locationLabel: 'Córdoba, AR',
          createdAt: new Date('2026-09-01T12:00:00.000Z'),
          expiresAt: new Date('2026-09-03T12:00:00.000Z'),
          revokedAt: null,
          status: ACCOUNT_SESSION_STATUS.ACTIVE,
          isCurrent: false,
        },
        {
          documentId: 'expired',
          clientApp: 'web',
          device: 'Firefox on Linux',
          ipAddress: '192.0.2.30',
          locationLabel: 'Mendoza, AR',
          createdAt: new Date('2026-08-30T12:00:00.000Z'),
          expiresAt: new Date('2026-09-01T12:00:00.000Z'),
          revokedAt: null,
          status: ACCOUNT_SESSION_STATUS.EXPIRED,
          isCurrent: false,
        },
      ]}
      isLoading={false}
      error={null}
      revokeError={null}
      isRevoking={false}
      labels={redesignedLabels}
      onRetry={vi.fn()}
      onRevoke={vi.fn()}
      onClearRevokeError={vi.fn()}
    />
  )

  expect(screen.getByRole('heading', { name: 'Sessions' })).toBeTruthy()
  expect(screen.getByText('3 sessions')).toBeTruthy()
  expect(screen.getByText(redesignedLabels.description)).toBeTruthy()

  const rows = screen.getAllByRole('listitem')
  expect(rows).toHaveLength(3)

  const currentSession = within(rows[0])
  expect(currentSession.getByText('Chrome on Windows')).toBeTruthy()
  expect(currentSession.queryByRole('img')).toBeNull()
  expect(currentSession.getByText('Buenos Aires, AR · 203.0.113.10')).toBeTruthy()
  expect(currentSession.getByText('Created today')).toBeTruthy()
  expect(currentSession.getByText('Expires tomorrow')).toBeTruthy()
  expect(currentSession.getByText('Current session')).toBeTruthy()
  expect(currentSession.queryByRole('button', { name: 'Revoke' })).toBeNull()

  expect(within(rows[1]).getByRole('button', { name: 'Revoke' })).toBeTruthy()
  expect(within(rows[2]).queryByRole('button', { name: 'Revoke' })).toBeNull()
  expect(screen.queryByRole('button', { name: /revoke all/i })).toBeNull()
})

test('protects the current session and removes a confirmed remote revocation', async () => {
  const onRevoke = vi.fn().mockResolvedValue(undefined)

  render(
    <AccountSessions
      sessions={[
        {
          documentId: 'current',
          clientApp: 'web',
          device: 'Current device',
          ipAddress: null,
          locationLabel: null,
          createdAt: new Date(),
          expiresAt: new Date(),
          revokedAt: null,
          status: ACCOUNT_SESSION_STATUS.ACTIVE,
          isCurrent: true,
        },
        {
          documentId: 'other',
          clientApp: 'web',
          device: 'Other device',
          ipAddress: null,
          locationLabel: null,
          createdAt: new Date(),
          expiresAt: new Date(),
          revokedAt: null,
          status: ACCOUNT_SESSION_STATUS.ACTIVE,
          isCurrent: false,
        },
      ]}
      isLoading={false}
      error={null}
      revokeError={null}
      isRevoking={false}
      labels={labels}
      onRetry={vi.fn()}
      onRevoke={onRevoke}
      onClearRevokeError={vi.fn()}
    />
  )

  expect(screen.getByText('Current session')).toBeTruthy()
  expect(screen.getAllByText('Expires tomorrow')).toHaveLength(2)
  expect(screen.getAllByRole('button', { name: 'Revoke' })).toHaveLength(1)
  expect(onRevoke).not.toHaveBeenCalled()

  fireEvent.click(screen.getByRole('button', { name: 'Revoke' }))
  expect(screen.getByRole('heading', { name: 'Revoke this session?' })).toBeTruthy()
  expect(onRevoke).not.toHaveBeenCalled()

  fireEvent.click(screen.getByRole('button', { name: 'Revoke' }))
  await waitFor(() => {
    expect(onRevoke).toHaveBeenCalledWith('other')
    expect(screen.queryByText('Other device')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Revoke this session?' })).toBeNull()
  })
})
