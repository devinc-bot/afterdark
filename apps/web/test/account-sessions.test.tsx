// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import { ACCOUNT_SESSION_STATUS, CLIENT_APP, type AccountSessionResponse } from '@repo/types'
import { AccountSessions, type AccountSessionsLabels } from '@repo/ui'

const labels: AccountSessionsLabels = {
  title: 'Sessions',
  description: 'Review devices signed in to this account.',
  loading: 'Loading sessions',
  loadError: 'Unable to load sessions',
  retry: 'Try again',
  empty: 'No sessions found',
  unknownDevice: 'Unknown device',
  metadataUnavailable: 'Metadata unavailable',
  current: 'Current session',
  close: 'Close',
  revoke: 'Revoke',
  revoking: 'Revoking',
  cancel: 'Cancel',
  confirmTitle: 'Revoke this session?',
  confirmDescription: 'This device will need to sign in again.',
  getSessionCountLabel: (count) => `${count} sessions`,
  getCreatedAtLabel: () => 'Created today',
  getExpiresAtLabel: () => 'Expires tomorrow',
  getStatusLabel: (status) => status,
}

const sessions: AccountSessionResponse[] = [
  {
    documentId: 'current-session',
    clientApp: CLIENT_APP.WEB,
    device: 'Chrome on Windows',
    ipAddress: '203.0.113.10',
    locationLabel: 'Buenos Aires',
    createdAt: new Date('2026-01-01T10:00:00Z'),
    expiresAt: new Date('2026-01-02T10:00:00Z'),
    revokedAt: null,
    status: ACCOUNT_SESSION_STATUS.ACTIVE,
    isCurrent: true,
  },
  {
    documentId: 'expired-session',
    clientApp: CLIENT_APP.WEB,
    device: 'Firefox on Linux',
    ipAddress: null,
    locationLabel: null,
    createdAt: new Date('2025-12-01T10:00:00Z'),
    expiresAt: new Date('2025-12-02T10:00:00Z'),
    revokedAt: null,
    status: ACCOUNT_SESSION_STATUS.EXPIRED,
    isCurrent: false,
  },
  {
    documentId: 'revoked-session',
    clientApp: CLIENT_APP.WEB,
    device: 'Hidden revoked device',
    ipAddress: null,
    locationLabel: null,
    createdAt: new Date('2025-11-01T10:00:00Z'),
    expiresAt: new Date('2025-11-02T10:00:00Z'),
    revokedAt: new Date('2025-11-03T10:00:00Z'),
    status: ACCOUNT_SESSION_STATUS.REVOKED,
    isCurrent: false,
  },
]

afterEach(cleanup)

test('shows current and retained sessions while hiding revoked history', () => {
  render(
    <AccountSessions
      sessions={sessions}
      isLoading={false}
      error={null}
      revokeError={null}
      isRevoking={false}
      labels={labels}
      onRetry={() => undefined}
      onRevoke={async () => undefined}
      onClearRevokeError={() => undefined}
    />
  )

  expect(screen.getByRole('heading', { name: 'Sessions' })).toBeTruthy()
  expect(screen.getByText('2 sessions')).toBeTruthy()
  expect(screen.getByText('Chrome on Windows')).toBeTruthy()
  expect(screen.getByText('Current session')).toBeTruthy()
  expect(screen.getByText('Firefox on Linux')).toBeTruthy()
  expect(screen.getByText('Metadata unavailable')).toBeTruthy()
  expect(screen.queryByText('Hidden revoked device')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Revoke' })).toBeNull()
})
