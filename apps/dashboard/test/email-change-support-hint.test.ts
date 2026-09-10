// @vitest-environment jsdom
import {
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

const { SUPPORT_EMAIL, SUBJECT_BY_KEY } = vi.hoisted(() => ({
  SUPPORT_EMAIL: 'support@lumina.test',
  SUBJECT_BY_KEY: {
    'owner.profile.emailSupportSubject': 'Cambio de correo',
    'staff.profile.emailSupportSubject': 'Cambio de correo staff',
  } as const,
}))

vi.mock('~/config/env', () => ({
  clientEnv: {
    VITE_SUPPORT_EMAIL: SUPPORT_EMAIL,
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => SUBJECT_BY_KEY[key as keyof typeof SUBJECT_BY_KEY] ?? key,
  }),
  Trans: ({
    i18nKey,
    values,
    components,
  }: {
    i18nKey: string
    values?: { supportEmail?: string }
    components?: { supportLink?: ReactElement }
  }) => {
    const supportEmail = values?.supportEmail ?? ''
    const supportLink = components?.supportLink
    const linkLabel = `escribinos a ${supportEmail}`

    return createElement(
      'span',
      { 'data-testid': 'email-change-support-hint', 'data-i18n-key': i18nKey },
      'Para cambiar el correo, ',
      isValidElement(supportLink)
        ? cloneElement(supportLink, undefined, linkLabel as ReactNode)
        : linkLabel
    )
  },
}))

import { EmailChangeSupportHint } from '../app/modules/settings/components/email-change-support-hint'

afterEach(() => {
  cleanup()
})

test('owner hint renders support email text and mailto link with i18n subject', () => {
  render(
    createElement(EmailChangeSupportHint, {
      hintKey: 'owner.profile.emailHint',
      subjectKey: 'owner.profile.emailSupportSubject',
    })
  )

  const hint = screen.getByTestId('email-change-support-hint')
  expect(hint.getAttribute('data-i18n-key')).toBe('owner.profile.emailHint')
  expect(hint.textContent).toContain(SUPPORT_EMAIL)

  const link = screen.getByRole('link', { name: `escribinos a ${SUPPORT_EMAIL}` })
  expect(link.getAttribute('href')).toBe(
    `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUBJECT_BY_KEY['owner.profile.emailSupportSubject'])}`
  )
})

test('staff hint uses staff i18n keys for mailto subject', () => {
  render(
    createElement(EmailChangeSupportHint, {
      hintKey: 'staff.profile.emailHint',
      subjectKey: 'staff.profile.emailSupportSubject',
    })
  )

  expect(screen.getByTestId('email-change-support-hint').getAttribute('data-i18n-key')).toBe(
    'staff.profile.emailHint'
  )

  const link = screen.getByRole('link', { name: `escribinos a ${SUPPORT_EMAIL}` })
  expect(link.getAttribute('href')).toBe(
    `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUBJECT_BY_KEY['staff.profile.emailSupportSubject'])}`
  )
})
