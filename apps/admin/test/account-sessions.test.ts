// @vitest-environment jsdom
import { createElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { AccountSessions, type AccountSessionsLabels } from '@repo/ui'

const labels: AccountSessionsLabels = {
  title: 'Sessions',
  description: 'Review signed-in devices.',
  loading: 'Loading sessions',
  loadError: 'Unable to load sessions',
  retry: 'Try again',
  empty: 'No sessions',
  unknownDevice: 'Unknown device',
  metadataUnavailable: 'Metadata unavailable',
  current: 'Current',
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

afterEach(cleanup)

test('announces a session load failure and lets the user retry', () => {
  const onRetry = vi.fn()

  render(
    createElement(AccountSessions, {
      isLoading: false,
      error: new Error('Sessions could not be loaded'),
      revokeError: null,
      isRevoking: false,
      labels,
      onRetry,
      onRevoke: async () => undefined,
      onClearRevokeError: () => undefined,
    })
  )

  expect(screen.getByRole('alert').textContent).toContain('Sessions could not be loaded')
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(onRetry).toHaveBeenCalledOnce()
})
